from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from backend.auth.otp_utils import generate_otp
from backend.database.models.otp_verification import OTPVerification


def create_otp(
    db: Session,
    email: str,
    purpose: str = "register"
):
    """
    Generate and save a new email OTP.
    """

    # Delete any previous unverified OTP for this email and purpose
    db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.purpose == purpose,
        OTPVerification.is_verified == False
    ).delete()

    # Generate OTP
    otp = generate_otp()

    # Save OTP
    otp_record = OTPVerification(
        email=email,
        otp=otp,
        purpose=purpose,
        is_verified=False,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )

    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)

    return otp_record


def get_otp(
    db: Session,
    email: str,
    otp: str,
    purpose: str = "register"
):
    """
    Fetch the latest matching OTP.
    """

    return db.query(OTPVerification).filter(
        OTPVerification.email == email,
        OTPVerification.otp == otp,
        OTPVerification.purpose == purpose
    ).first()