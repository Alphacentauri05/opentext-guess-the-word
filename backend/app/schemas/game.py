from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class GuessRequest(BaseModel):
    guess: str = Field(
        ...,
        description="5-letter guess word (letters only).",
        example="AUDIO",
    )

    @field_validator("guess")
    @classmethod
    def validate_guess_word(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            raise ValueError("Guess must be a non-empty string.")
        cleaned = v.strip().upper()
        if len(cleaned) != 5:
            raise ValueError("Guess word must be exactly 5 letters long.")
        if not cleaned.isalpha():
            raise ValueError("Guess word must contain letters only (A-Z).")
        return cleaned


class GuessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    guess_number: int
    guess_word: str
    feedback: List[str]
    created_at: datetime


class GameDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str  # "IN_PROGRESS", "WON", "LOST"
    attempts_used: int
    max_attempts: int = 5
    game_date: date
    started_at: datetime
    completed_at: Optional[datetime] = None
    guesses: List[GuessResponse] = []
    daily_games_played: int
    daily_games_remaining: int
    secret_word: Optional[str] = (
        None  # Disclosed ONLY after completion (WON or LOST)
    )
    message: Optional[str] = None


class GameHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    game_date: date
    word_attempted: str
    attempts_used: int
    max_attempts: int = 5
    status: str
    is_won: bool
    correct_guesses: int
    started_at: datetime
    completed_at: Optional[datetime] = None
