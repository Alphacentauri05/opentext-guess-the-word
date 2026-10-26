import uuid
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    word_id = Column(
        Integer,
        ForeignKey("words.id"),
        nullable=False,
    )
    status = Column(
        String(20), default="IN_PROGRESS", nullable=False
    )  # "IN_PROGRESS", "WON", "LOST"
    attempts_used = Column(Integer, default=0, nullable=False)
    game_date = Column(Date, nullable=False, index=True)
    started_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="games")
    word = relationship("Word")
    guesses = relationship(
        "Guess",
        back_populates="game",
        cascade="all, delete-orphan",
        order_by="Guess.guess_number",
    )

    def __repr__(self) -> str:
        return f"<Game {self.id} (user={self.user_id}, status={self.status}, attempts={self.attempts_used})>"
