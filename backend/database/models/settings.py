from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from backend.database.database import Base


class Settings(Base):

    __tablename__ = "settings"

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
        unique=True,
        index=True
    )

    # ==========================================
    # Monitoring Settings
    # ==========================================

    monitoring_enabled = Column(
        Boolean,
        default=True
    )

    keyboard_monitoring = Column(
        Boolean,
        default=True
    )

    mouse_monitoring = Column(
        Boolean,
        default=True
    )

    screen_monitoring = Column(
        Boolean,
        default=True
    )

    idle_monitoring = Column(
        Boolean,
        default=True
    )

    application_monitoring = Column(
        Boolean,
        default=True
    )

    # ==========================================
    # Notification Settings
    # ==========================================

    notifications_enabled = Column(
        Boolean,
        default=True
    )

    break_reminders = Column(
        Boolean,
        default=True
    )

    fatigue_alerts = Column(
        Boolean,
        default=True
    )

    # ==========================================
    # General Settings
    # ==========================================

    theme = Column(
        String(20),
        default="light"
    )

    # ==========================================
    # Created / Updated
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # ==========================================
    # Relationship
    # ==========================================

    user = relationship(
        "User",
        back_populates="settings"
    )

    def __repr__(self):

        return (
            f"<Settings "
            f"user_id={self.user_id}>"
        )