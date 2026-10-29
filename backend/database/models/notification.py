from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from backend.database.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    # ==========================================
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # USER REFERENCE
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ==========================================
    # RECOMMENDATION REFERENCE
    # ==========================================

    recommendation_id = Column(
        Integer,
        ForeignKey("recommendations.id"),
        nullable=True,
        index=True,
    )

    # ==========================================
    # NOTIFICATION INFORMATION
    # ==========================================

    title = Column(
        String(200),
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    type = Column(
        String(100),
        nullable=True,
    )

    priority = Column(
        String(20),
        default="Medium",
    )

    # ==========================================
    # STATUS
    # ==========================================

    is_seen = Column(
        Boolean,
        default=False,
        nullable=False
    )

    seen_at = Column(
        DateTime,
        nullable=True
    )
    # ==========================================
    # CREATED DATE
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ==========================================
    # RELATIONSHIPS
    # ==========================================

    user = relationship(
        "User",
        back_populates="notifications",
    )

    recommendation = relationship(
        "Recommendation",
    )

    # ==========================================
    # REPRESENTATION
    # ==========================================

    def __repr__(self):
        return (
            f"<Notification "
            f"user_id={self.user_id} "
            f"title={self.title} "
            f"is_seen={self.is_seen}>"
        )