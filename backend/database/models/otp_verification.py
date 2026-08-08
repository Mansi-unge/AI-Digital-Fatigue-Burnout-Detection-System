from datetime import datetime, timedelta

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)

from backend.database.database import Base
class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(100), nullable=False)

    otp = Column(String(6), nullable=False)

    purpose = Column(String(20), nullable=False)

    is_verified = Column(Boolean, default=False)

    expires_at = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)