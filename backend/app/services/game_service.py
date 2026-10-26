from datetime import datetime, date, timezone
from typing import List, Optional, Tuple
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import pytz

from app.core.config import settings
from app.models.user import User
from app.models.word import Word
from app.models.game import Game
from app.models.guess import Guess
from app.models.daily_usage import DailyGameUsage
from app.services.game_engine import GameEngine, GameStatus


class GameService:

    @staticmethod
    def get_current_date() -> date:
        """Get the current calendar date in the configured application timezone."""
        try:
            tz = pytz.timezone(settings.APP_TIMEZONE)
            return datetime.now(tz).date()
        except Exception:
            return datetime.now(timezone.utc).date()

    @staticmethod
    def get_daily_usage(db: Session, user_id: UUID, target_date: date) -> int:
        usage = (
            db.query(DailyGameUsage)
            .filter(
                DailyGameUsage.user_id == user_id,
                DailyGameUsage.usage_date == target_date,
            )
            .first()
        )
        return usage.games_count if usage else 0

    @classmethod
    def get_active_game(cls, db: Session, user_id: UUID) -> Optional[Game]:
        """Find an in-progress game for the user, if one exists."""
        return (
            db.query(Game)
            .filter(
                Game.user_id == user_id,
                Game.status == GameStatus.IN_PROGRESS.value,
            )
            .order_by(Game.started_at.desc())
            .first()
        )

    @classmethod
    def start_game(
        cls, db: Session, user: User, target_date: Optional[date] = None
    ) -> Tuple[Game, bool]:
        """Start a new game or resume existing in-progress game.

        Returns:
            (game, is_resumed: bool)
        """
        if target_date is None:
            target_date = cls.get_current_date()

        # Check if user already has an active, unfinished game
        active_game = cls.get_active_game(db, user.id)
        if active_game:
            # Resume existing game without consuming allowance
            return active_game, True

        # Begin atomic transaction for daily usage check and increment
        # Use SELECT ... FOR UPDATE to prevent concurrency race conditions
        usage_record = (
            db.query(DailyGameUsage)
            .filter(
                DailyGameUsage.user_id == user.id,
                DailyGameUsage.usage_date == target_date,
            )
            .with_for_update()
            .first()
        )

        current_count = usage_record.games_count if usage_record else 0

        if current_count >= settings.MAX_DAILY_GAMES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Daily limit reached. You can only guess a maximum of {settings.MAX_DAILY_GAMES} words per day.",
            )

        # Select a random active word
        # Try to select words the user hasn't played today
        played_word_ids = (
            db.query(Game.word_id)
            .filter(
                Game.user_id == user.id,
                Game.game_date == target_date,
            )
            .subquery()
            .select()
        )

        available_word = (
            db.query(Word)
            .filter(
                Word.is_active == True,
                Word.id.not_in(played_word_ids),
            )
            .order_by(func.random())
            .first()
        )

        # Fallback to any random active word if all have been played
        if not available_word:
            available_word = (
                db.query(Word)
                .filter(Word.is_active == True)
                .order_by(func.random())
                .first()
            )

        if not available_word:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Word bank is empty. Please contact system administrator.",
            )

        # Create the new game
        new_game = Game(
            user_id=user.id,
            word_id=available_word.id,
            status=GameStatus.IN_PROGRESS.value,
            attempts_used=0,
            game_date=target_date,
        )
        db.add(new_game)

        # Update daily usage atomically
        if usage_record:
            usage_record.games_count += 1
        else:
            usage_record = DailyGameUsage(
                user_id=user.id,
                usage_date=target_date,
                games_count=1,
            )
            db.add(usage_record)

        db.commit()
        db.refresh(new_game)
        return new_game, False

    @classmethod
    def submit_guess(
        cls, db: Session, user: User, game_id: UUID, raw_guess: str
    ) -> Game:
        """Submit a guess for an active game."""
        # Sanitize and validate the guess word (5 letters, uppercase)
        try:
            guess_word = GameEngine.sanitize_and_validate_word(raw_guess)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
            )

        # Fetch game with lock
        game = (
            db.query(Game)
            .filter(Game.id == game_id)
            .with_for_update()
            .first()
        )

        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game session not found.",
            )

        if game.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to submit guesses for this game.",
            )

        if game.status != GameStatus.IN_PROGRESS.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This game is already completed (Status: {game.status}). Cannot submit further guesses.",
            )

        if game.attempts_used >= settings.MAX_GUESSES_PER_GAME:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum attempts reached for this game.",
            )

        # Evaluate the guess
        secret_word = game.word.word
        current_attempt = game.attempts_used + 1

        feedback, new_status = GameEngine.evaluate_guess(
            secret_word=secret_word,
            guess_word=guess_word,
            attempts_used=current_attempt,
            max_attempts=settings.MAX_GUESSES_PER_GAME,
        )

        # Record the guess
        guess_record = Guess(
            game_id=game.id,
            guess_number=current_attempt,
            guess_word=guess_word,
            feedback=feedback,
        )
        db.add(guess_record)

        # Update game status and attempts
        game.attempts_used = current_attempt
        game.status = new_status.value

        if new_status in (GameStatus.WON, GameStatus.LOST):
            game.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(game)
        return game

    @classmethod
    def get_game_by_id(cls, db: Session, user: User, game_id: UUID) -> Game:
        game = db.query(Game).filter(Game.id == game_id).first()
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Game not found."
            )
        if game.user_id != user.id and user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this game.",
            )
        return game

    @classmethod
    def get_user_history(cls, db: Session, user_id: UUID) -> List[Game]:
        return (
            db.query(Game)
            .filter(Game.user_id == user_id)
            .order_by(Game.started_at.desc())
            .all()
        )
