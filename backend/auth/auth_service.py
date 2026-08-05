from sqlalchemy.orm import Session

from backend.database.models.users import User
from backend.auth.password_utils import hash_password, verify_password


def register_user(db: Session, user_data: dict):
    """
    Register a new user.
    """

    existing_email = db.query(User).filter(
        User.email == user_data["email"]
    ).first()

    if existing_email:
        return {
            "success": False,
            "message": "Email already registered."
        }

    existing_mobile = db.query(User).filter(
        User.mobile_number == user_data["mobile_number"]
    ).first()

    if existing_mobile:
        return {
            "success": False,
            "message": "Mobile number already registered."
        }

    hashed_password = hash_password(user_data["password"])

    new_user = User(
        name=user_data["name"],
        email=user_data["email"],
        mobile_number=user_data["mobile_number"],
        date_of_birth=user_data["date_of_birth"],
        address=user_data["address"],
        designation=user_data["designation"],
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User registered successfully."
    }


def login_user(db: Session, email: str, password: str):
    """
    Login an existing user.
    """

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return {
            "success": False,
            "message": "Invalid email."
        }

    if not verify_password(password, user.password_hash):
        return {
            "success": False,
            "message": "Invalid password."
        }

    return {
        "success": True,
        "message": "Login successful.",
        "user_id": user.id,
        "name": user.name
    }           