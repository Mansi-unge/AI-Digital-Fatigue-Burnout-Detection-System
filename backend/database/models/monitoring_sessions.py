from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey
)
from sqlalchemy.orm import relationship

from backend.database.database import Base


class MonitoringSession(Base):
    __tablename__ = "monitoring_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    mode = Column(
        String(30),
        nullable=False
    )

    started_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    ended_at = Column(
        DateTime,
        nullable=True
    )
    last_sync_at = Column(
        DateTime,
        nullable=True
    )
    is_active = Column(
        Boolean,
        default=True
    )

    user = relationship(
        "User",
        back_populates="monitoring_sessions"
    )

    activities = relationship(
        "Activity",
        back_populates="session",
        cascade="all, delete-orphan"
    )