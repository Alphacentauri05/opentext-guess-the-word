from datetime import date
from typing import List
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class DailyActivityReportItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: date
    number_of_users: int
    number_of_correct_guesses: int
    total_games_played: int


class UserActivityReportItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    username: str
    date: date
    words_tried: int
    number_of_correct_guesses: int


class AdminSummaryStats(BaseModel):
    total_players: int
    total_games_played: int
    total_games_won: int
    overall_win_rate: float
