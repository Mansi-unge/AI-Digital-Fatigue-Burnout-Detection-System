import random
from datetime import datetime, timedelta

from backend.database.database import SessionLocal
from backend.database.models.users import User

def forgot_password(email):
    """
    Generate and save a 6-digit OTP for password reset.
    """

    db = SessionLocal()

    try:

        # Find user
        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            return {
                "success": False,
                "message": "Email not registered."
            }

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # OTP expires after 5 minutes
        expiry_time = datetime.utcnow() + timedelta(minutes=5)

        # Save to database
        user.otp = otp
        user.otp_expiry = expiry_time

        db.commit()

        # For now, print OTP in terminal
        print("\n==============================")
        print("PASSWORD RESET OTP")
        print("Email :", email)
        print("OTP   :", otp)
        print("==============================\n")

        return {
            "success": True,
            "message": "OTP generated successfully."
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        db.close()