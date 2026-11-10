from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from backend.database.database import Base


class Recommendation(Base):

    __tablename__ = "recommendations"

    # ==========================================
    # Primary Key
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ==========================================
    # User Reference
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ==========================================
    # Recommendation Information
    # ==========================================

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=True
    )

    priority = Column(
        String(20),
        default="medium"
    )

    # ==========================================
    # Status
    # ==========================================

    is_completed = Column(
        Boolean,
        default=False
    )

    # ==========================================
    # Created Date
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ==========================================
    # Relationship
    # ==========================================

    user = relationship(
        "User",
        back_populates="recommendations"
    )

    def __repr__(self):

        return (
            f"<Recommendation "
            f"user_id={self.user_id} "
            f"title={self.title}>"
        )