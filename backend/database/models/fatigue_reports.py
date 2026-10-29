from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from backend.database.database import Base


class FatigueReport(Base):

    __tablename__ = "fatigue_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("monitoring_sessions.id"), nullable=True)

    # "healthy" | "mild" | "high"
    level = Column(String(20), nullable=False)

    reported_at = Column(DateTime, default=datetime.utcnow, nullable=False)