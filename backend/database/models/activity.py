from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from backend.database.database import Base


class Activity(Base):

    __tablename__ = "activity"

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
    # Timestamp
    # ==========================================

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ==========================================
    # Desktop Usage
    # ==========================================

    screen_time = Column(
        Float,
        default=0.0
    )

    active_time = Column(
        Float,
        default=0.0
    )

    idle_time = Column(
        Float,
        default=0.0
    )

    # ==========================================
    # Keyboard Activity
    # ==========================================

    keyboard_count = Column(
        Integer,
        default=0
    )

    typing_speed = Column(
        Float,
        default=0.0
    )

    # ==========================================
    # Mouse Activity
    # ==========================================

    mouse_clicks = Column(
        Integer,
        default=0
    )

    mouse_distance = Column(
        Float,
        default=0.0
    )

    scroll_count = Column(
        Integer,
        default=0
    )

    # ==========================================
    # Application Usage
    # ==========================================

    active_application = Column(
        String(200),
        nullable=True
    )

    application_switches = Column(
        Integer,
        default=0
    )

    # ==========================================
    # Work Pattern
    # ==========================================

    work_duration = Column(
        Float,
        default=0.0
    )

    break_duration = Column(
        Float,
        default=0.0
    )

    # ==========================================
    # Screen & Device
    # ==========================================

    brightness = Column(
        Integer,
        default=50
    )

    battery_percentage = Column(
        Float,
        default=100.0
    )

    charging_status = Column(
        Boolean,
        default=False
    )

    # ==========================================
    # Relationship with User
    # ==========================================

    user = relationship(
        "User",
        back_populates="activities"
    )

    def __repr__(self):

        return (
            f"<Activity "
            f"user_id={self.user_id} "
            f"timestamp={self.timestamp}>"
        )