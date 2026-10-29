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
    # PRIMARY KEY
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ==========================================
    # USER
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="activities"
    )

    # ==========================================
    # DESKTOP MONITORING
    # ==========================================

    screen_time = Column(
        Float,
        default=0
    )

    active_time = Column(
        Float,
        default=0
    )

    idle_time = Column(
        Float,
        default=0
    )

    keyboard_count = Column(
        Integer,
        default=0
    )

    mouse_clicks = Column(
        Integer,
        default=0
    )

    scroll_count = Column(
        Integer,
        default=0
    )

    active_application = Column(
        String(255),
        default="Unknown"
    )

    application_switches = Column(
        Integer,
        default=0
    )

    # ==========================================
    # CAMERA MONITORING
    # ==========================================

    blink_rate = Column(
        Float,
        default=0
    )

    eye_closure = Column(
        Float,
        default=0
    )

    yawn_count = Column(
        Integer,
        default=0
    )

    head_pose = Column(
        String(50),
        default="UNKNOWN"
    )

    # ==========================================
    # IOT SENSOR DATA
    # ==========================================

    temperature = Column(
        Float,
        nullable=True
    )

    humidity = Column(
        Float,
        nullable=True
    )

    light = Column(
        Float,
        nullable=True
    )

    distance = Column(
        Float,
        nullable=True
    )

    motion = Column(
        Boolean,
        nullable=True
    )

    # ==========================================
    # SYSTEM MONITORING
    # ==========================================

    brightness = Column(
        Float,
        default=50
    )

    battery_percentage = Column(
        Float,
        default=100
    )

    charging_status = Column(
        Boolean,
        default=False
    )
    session_id = Column(
    Integer,
    ForeignKey("monitoring_sessions.id"),
    nullable=False
    )

    session = relationship(
        "MonitoringSession",
        back_populates="activities"
    )

    # ==========================================
    # TIMESTAMP
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )