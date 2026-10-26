import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Guess(Base):
    __tablename__ = "guesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(
        UUID(as_uuid=True),
        ForeignKey("games.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    guess_number = Column(Integer, nullable=False)  # 1 to 5
    guess_word = Column(String(5), nullable=False)
    feedback = Column(JSONB, nullable=False)  # e.g. ["GREEN", "ORANGE", "GREY", ...]
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    game = relationship("Game", back_populates="guesses")

    __table_args__ = (
        UniqueConstraint("game_id", "guess_number", name="uq_game_guess_number"),
    )

    def __repr__(self) -> str:
        return f"<Guess {self.guess_number}: {self.guess_word} (game={self.game_id})>"
