import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.db.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.game import Game
from app.models.guess import Guess
from app.models.daily_usage import DailyGameUsage
from scripts.seed_words import seed_words


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Ensure tables and words exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_words(db)
    db.close()
    yield


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
