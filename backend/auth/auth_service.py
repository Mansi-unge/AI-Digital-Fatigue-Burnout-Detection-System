from sqlalchemy.orm import Session
from datetime import datetime
from backend.database.models.users import User
from backend.auth.password_utils import hash_password, verify_password
from backend.auth.otp_service import create_otp, get_otp
from backend.auth.email_service import send_email_otp
from backend.database.models.otp_verification import OTPVerification

def send_otp(db: Session, data: dict):
    """
    Send email OTP for user registration.
    """

    email = data.get("email")

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered."
        }

    otp_record = create_otp(
        db=db,
        email=email,
        purpose="register"
    )

    email_sent = send_email_otp(
        receiver_email=email,
        otp=otp_record.otp
    )

    if not email_sent:
        return {
            "success": False,
            "message": "Unable to send OTP."
        }

    return {
        "success": True,
        "message": "OTP sent successfully."
    }


def verify_otp(db: Session, data: dict):
    """
    Verify email OTP.
    """

    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return {
            "success": False,
            "message": "Email and OTP are required."
        }

    otp_record = get_otp(
        db=db,
        email=email,
        otp=otp,
        purpose="register"
    )

    if not otp_record:
        return {
            "success": False,
            "message": "Invalid OTP."
        }

    if otp_record.is_verified:
        return {
            "success": False,
            "message": "OTP already used."
        }

    if otp_record.expires_at < datetime.utcnow():
        return {
            "success": False,
            "message": "OTP has expired."
        }

    otp_record.is_verified = True

    db.commit()

    return {
        "success": True,
        "message": "Email verified successfully."
    }

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
    verified_otp = db.query(OTPVerification).filter(
        OTPVerification.email == user_data["email"],
        OTPVerification.purpose == "register",
        OTPVerification.is_verified == True
    ).first()

    if not verified_otp:
        return {
            "success": False,
            "message": "Please verify your email before registering."
        }
    new_user = User(
        name=user_data["name"],
        email=user_data["email"],
        mobile_number=user_data["mobile_number"],
        date_of_birth=datetime.strptime(
            user_data["date_of_birth"],
            "%Y-%m-%d"
        ).date(),
        address=user_data["address"],
        designation=user_data["designation"],
        password_hash=hashed_password,

        email_verified=True,
        mobile_verified=False
    )
    db.add(new_user)
    db.delete(verified_otp)
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