from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from backend.database.database import Base


class Report(Base):

    __tablename__ = "reports"

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
    # Report Information
    # ==========================================

    report_type = Column(
        String(50),
        nullable=False
    )

    report_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ==========================================
    # Activity Summary
    # ==========================================

    total_screen_time = Column(
        Float,
        default=0.0
    )

    total_active_time = Column(
        Float,
        default=0.0
    )

    total_idle_time = Column(
        Float,
        default=0.0
    )

    total_keyboard_count = Column(
        Integer,
        default=0
    )

    total_mouse_clicks = Column(
        Integer,
        default=0
    )

    # ==========================================
    # Work / Break
    # ==========================================

    total_work_duration = Column(
        Float,
        default=0.0
    )

    total_break_duration = Column(
        Float,
        default=0.0
    )

    # ==========================================
    # Prediction Results
    # ==========================================

    fatigue_score = Column(
        Float,
        default=0.0
    )

    burnout_score = Column(
        Float,
        default=0.0
    )

    # ==========================================
    # Report File
    # ==========================================

    report_file = Column(
        String(255),
        nullable=True
    )

    # ==========================================
    # Relationship
    # ==========================================

    user = relationship(
        "User",
        back_populates="reports"
    )

    def __repr__(self):

        return (
            f"<Report "
            f"user_id={self.user_id} "
            f"type={self.report_type}>"
        )