from backend.database.database import SessionLocal
from backend.database.models.users import User

from backend.auth.password_utils import hash_password


def reset_password(email, new_password):

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

        user.password_hash = hash_password(new_password)

        user.otp = None
        user.otp_expiry = None

        db.commit()

        return {
            "success": True,
            "message": "Password Updated Successfully."
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        db.close()