from datetime import datetime

from backend.database.database import SessionLocal
from backend.database.models.users import User


def verify_otp(email, otp):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:

            return {
                "success": False,
                "message": "User not found."
            }

        if user.otp != otp:

            return {
                "success": False,
                "message": "Invalid OTP."
            }

        if datetime.utcnow() > user.otp_expiry:

            return {
                "success": False,
                "message": "OTP Expired."
            }

        return {
            "success": True,
            "message": "OTP Verified."
        }

    finally:

        db.close()