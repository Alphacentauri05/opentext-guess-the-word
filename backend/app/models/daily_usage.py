import uuid
from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class DailyGameUsage(Base):
    __tablename__ = "daily_game_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    usage_date = Column(Date, nullable=False, index=True)
    games_count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="daily_usages")

    __table_args__ = (
        UniqueConstraint("user_id", "usage_date", name="uq_user_usage_date"),
    )

    def __repr__(self) -> str:
        return f"<DailyGameUsage user={self.user_id} date={self.usage_date} count={self.games_count}>"
