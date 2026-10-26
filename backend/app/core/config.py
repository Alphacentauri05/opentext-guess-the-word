from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "OpenText Guess The Word"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    APP_TIMEZONE: str = "UTC"

    # Database
    DATABASE_URL: str = "postgresql://postgres@localhost:5432/opentext_guess_word"

    # Security
    SECRET_KEY: str = "opentext_guess_the_word_super_secure_jwt_secret_key_2026_demo"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Game Rules
    MAX_DAILY_GAMES: int = 3
    MAX_GUESSES_PER_GAME: int = 5
    WORD_LENGTH: int = 5

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v


settings = Settings()
