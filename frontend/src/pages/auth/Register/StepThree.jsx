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

    // # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    // # Verification Method
    verification_method = Column(
        String(10),
        nullable=False
    )
    // # "email" or "mobile"

    // # User Information
    email = Column(
        String(100),
        nullable=True
    )

    mobile_number = Column(
        String(15),
        nullable=True
    )

    // # OTP
    otp = Column(
        String(6),
        nullable=False
    )

    // # Purpose
    purpose = Column(
        String(20),
        nullable=False
    )
    // # register
    // # forgot_password
    // # login

    // # Verification Status
    is_verified = Column(
        Boolean,
        default=False
    )

    // # OTP Expiry
    expires_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() + timedelta(minutes=5)
    )

    // # Created Date
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):
        if self.verification_method == "email":
            return f"<OTP {self.email}>"

        return f"<OTP {self.mobile_number}>"