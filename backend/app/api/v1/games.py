from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.game import Game
from app.schemas.game import (
    GuessRequest,
    GameDetailResponse,
    GuessResponse,
    GameHistoryItem,
)
from app.services.game_service import GameService
from app.services.game_engine import GameStatus

router = APIRouter(prefix="/games", tags=["Games"])


def format_game_detail(
    game: Game, db: Session, user: User
) -> GameDetailResponse:
    """Format game detail ensuring secret word is ONLY revealed if game is completed."""
    today = GameService.get_current_date()
    played = GameService.get_daily_usage(db, user.id, today)
    remaining = max(0, settings.MAX_DAILY_GAMES - played)

    is_completed = game.status in (
        GameStatus.WON.value,
        GameStatus.LOST.value,
    )
    secret_word = game.word.word if is_completed else None

    msg = None
    if game.status == GameStatus.WON.value:
        msg = "Congratulations! You won the game!"
    elif game.status == GameStatus.LOST.value:
        msg = f"Better luck next time! The correct word was {game.word.word}."

    guess_responses = [
        GuessResponse(
            guess_number=g.guess_number,
            guess_word=g.guess_word,
            feedback=g.feedback,
            created_at=g.created_at,
        )
        for g in game.guesses
    ]

    return GameDetailResponse(
        id=game.id,
        status=game.status,
        attempts_used=game.attempts_used,
        max_attempts=settings.MAX_GUESSES_PER_GAME,
        game_date=game.game_date,
        started_at=game.started_at,
        completed_at=game.completed_at,
        guesses=guess_responses,
        daily_games_played=played,
        daily_games_remaining=remaining,
        secret_word=secret_word,
        message=msg,
    )


@router.post(
    "/start",
    response_model=GameDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Start a new game or resume unfinished game",
)
def start_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameDetailResponse:
    """Start playing: picks a random word or resumes an in-progress game without consuming daily quota."""
    game, is_resumed = GameService.start_game(db, current_user)
    return format_game_detail(game, db, current_user)


@router.get(
    "/active",
    response_model=GameDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get active game state or 404 if none",
)
def get_active_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameDetailResponse:
    """Retrieve in-progress game for user if one exists."""
    active_game = GameService.get_active_game(db, current_user.id)
    if not active_game:
        # Return an empty container with daily stats
        today = GameService.get_current_date()
        played = GameService.get_daily_usage(db, current_user.id, today)
        remaining = max(0, settings.MAX_DAILY_GAMES - played)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active game in progress.",
        )
    return format_game_detail(active_game, db, current_user)


@router.get(
    "/quota",
    summary="Get today's daily game quota and active status",
)
def get_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = GameService.get_current_date()
    played = GameService.get_daily_usage(db, current_user.id, today)
    remaining = max(0, settings.MAX_DAILY_GAMES - played)
    active_game = GameService.get_active_game(db, current_user.id)

    return {
        "date": today,
        "daily_limit": settings.MAX_DAILY_GAMES,
        "daily_games_played": played,
        "daily_games_remaining": remaining,
        "can_play": remaining > 0 or active_game is not None,
        "active_game_id": active_game.id if active_game else None,
    }


@router.post(
    "/{game_id}/guess",
    response_model=GameDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a 5-letter guess",
)
def submit_guess(
    game_id: UUID,
    request: GuessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GameDetailResponse:
    """Submit a guess and receive per-letter color feedback (GREEN, ORANGE, GREY)."""
    game = GameService.submit_guess(db, current_user, game_id, request.guess)
    return format_game_detail(game, db, current_user)


@router.get(
    "/history",
    response_model=List[GameHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get player's game history",
)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[GameHistoryItem]:
    """Retrieve full history of games played by the authenticated player."""
    games = GameService.get_user_history(db, current_user.id)
    history = []
    for g in games:
        is_won = g.status == GameStatus.WON.value
        history.append(
            GameHistoryItem(
                id=g.id,
                game_date=g.game_date,
                word_attempted=g.word.word,
                attempts_used=g.attempts_used,
                max_attempts=settings.MAX_GUESSES_PER_GAME,
                status=g.status,
                is_won=is_won,
                correct_guesses=1 if is_won else 0,
                started_at=g.started_at,
                completed_at=g.completed_at,
            )
        )
    return history
