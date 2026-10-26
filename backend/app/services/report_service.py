from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.user import User
from app.models.game import Game
from app.schemas.admin import (
    DailyActivityReportItem,
    UserActivityReportItem,
    AdminSummaryStats,
)


class ReportService:

    @staticmethod
    def get_daily_activity_report(
        db: Session,
    ) -> List[DailyActivityReportItem]:
        """Generate Daily Activity Report:
        - Date
        - Number of distinct users who played that day
        - Number of correct guesses (games won)
        - Total games played
        """
        results = (
            db.query(
                Game.game_date.label("date"),
                func.count(func.distinct(Game.user_id)).label(
                    "number_of_users"
                ),
                func.sum(case((Game.status == "WON", 1), else_=0)).label(
                    "number_of_correct_guesses"
                ),
                func.count(Game.id).label("total_games_played"),
            )
            .group_by(Game.game_date)
            .order_by(Game.game_date.desc())
            .all()
        )

        return [
            DailyActivityReportItem(
                date=row.date,
                number_of_users=row.number_of_users,
                number_of_correct_guesses=row.number_of_correct_guesses or 0,
                total_games_played=row.total_games_played,
            )
            for row in results
        ]

    @staticmethod
    def get_user_activity_report(
        db: Session, user_id: Optional[UUID] = None
    ) -> List[UserActivityReportItem]:
        """Generate User-Level Report:
        - User ID & Username
        - Date
        - Number of words tried (games started)
        - Number of correct guesses (games won)
        """
        query = (
            db.query(
                User.id.label("user_id"),
                User.username.label("username"),
                Game.game_date.label("date"),
                func.count(Game.id).label("words_tried"),
                func.sum(case((Game.status == "WON", 1), else_=0)).label(
                    "number_of_correct_guesses"
                ),
            )
            .join(User, Game.user_id == User.id)
            .group_by(User.id, User.username, Game.game_date)
            .order_by(Game.game_date.desc(), User.username.asc())
        )

        if user_id:
            query = query.filter(User.id == user_id)

        results = query.all()

        return [
            UserActivityReportItem(
                user_id=row.user_id,
                username=row.username,
                date=row.date,
                words_tried=row.words_tried,
                number_of_correct_guesses=row.number_of_correct_guesses or 0,
            )
            for row in results
        ]

    @staticmethod
    def get_summary_stats(db: Session) -> AdminSummaryStats:
        """Overall system KPI summary."""
        total_players = (
            db.query(User).filter(User.role == "PLAYER").count()
        )
        total_games = db.query(Game).count()
        total_won = db.query(Game).filter(Game.status == "WON").count()
        win_rate = (
            round((total_won / total_games) * 100, 1) if total_games > 0 else 0.0
        )

        return AdminSummaryStats(
            total_players=total_players,
            total_games_played=total_games,
            total_games_won=total_won,
            overall_win_rate=win_rate,
        )
