from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    String,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from backend.database.database import Base


class Settings(Base):
    __tablename__ = "settings"

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ==========================================================
    # USER REFERENCE
    # ==========================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True
    )

    # ==========================================================
    # MONITORING SETTINGS
    # ==========================================================

    monitoring_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    keyboard_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    mouse_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    screen_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    idle_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    application_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    webcam_monitoring = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # ==========================================================
    # NOTIFICATION SETTINGS
    # ==========================================================

    notifications_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    break_reminders = Column(
        Boolean,
        default=True,
        nullable=False
    )

    fatigue_alerts = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # ==========================================================
    # GENERAL SETTINGS
    # ==========================================================

    theme = Column(
        String(20),
        default="light",
        nullable=False
    )

    # ==========================================================
    # CREATED / UPDATED
    # ==========================================================

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

    # ==========================================================
    # RELATIONSHIP WITH USER
    # ==========================================================

    user = relationship(
        "User",
        back_populates="settings"
    )

    # ==========================================================
    # REPRESENTATION
    # ==========================================================

    def __repr__(self):
        return f"<Settings user_id={self.user_id}>"