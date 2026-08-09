from datetime import datetime

from backend.database.database import SessionLocal
from backend.database.models.users import User


class ProfileService:

    # ==========================================
    # GET PROFILE
    # ==========================================

    def get_profile(self, user_id):

        db = SessionLocal()

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                return None

            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "mobile_number": user.mobile_number,
                "date_of_birth": (
                    user.date_of_birth.isoformat()
                    if user.date_of_birth
                    else None
                ),
                "address": user.address,
                "designation": user.designation
            }

        finally:

            db.close()

    # ==========================================
    # UPDATE PROFILE
    # ==========================================

    def update_profile(self, user_id, data):

        db = SessionLocal()

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if not user:
                return None

            if "name" in data:
                user.name = data["name"]

            if "mobile_number" in data:
                user.mobile_number = data["mobile_number"]

            if "date_of_birth" in data:

                value = data["date_of_birth"]

                if value:

                    user.date_of_birth = datetime.strptime(
                        value,
                        "%Y-%m-%d"
                    ).date()

                else:

                    user.date_of_birth = None

            if "address" in data:
                user.address = data["address"]

            if "designation" in data:
                user.designation = data["designation"]

            db.commit()

            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "mobile_number": user.mobile_number,
                "date_of_birth": (
                    user.date_of_birth.isoformat()
                    if user.date_of_birth
                    else None
                ),
                "address": user.address,
                "designation": user.designation
            }

        except Exception:

            db.rollback()

            raise

        finally:

            db.close()