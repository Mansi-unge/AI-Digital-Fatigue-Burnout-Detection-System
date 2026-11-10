
from flask import Blueprint, request, jsonify

from backend.database.database import SessionLocal

# Registration and login services
from backend.auth.auth_service import (
    send_otp,
    verify_otp as verify_registration_otp,
    register_user,
    login_user
)

# Password recovery services
from backend.auth.forgot_password import (
    forgot_password as generate_password_reset_otp
)
from backend.auth.verify_otp import (
    verify_otp as verify_password_reset_otp
)
from backend.auth.reset_password import (
    reset_password as update_password
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp_route():
    data = request.get_json()

    db = SessionLocal()
    try:
        result = send_otp(db, data)
        return jsonify(result)
    finally:
        db.close()


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp_route():
    data = request.get_json()

    db = SessionLocal()
    try:
        result = verify_registration_otp(db, data)
        return jsonify(result)
    finally:
        db.close()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    db = SessionLocal()
    try:
        result = register_user(db, data)
        return jsonify(result)
    finally:
        db.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    db = SessionLocal()
    try:
        result = login_user(
            db,
            data["email"],
            data["password"]
        )
        return jsonify(result)
    finally:
        db.close()


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password_route():
    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required."
        }), 400

    result = generate_password_reset_otp(email)
    return jsonify(result)


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password_route():
    data = request.get_json() or {}

    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp or not new_password:
        return jsonify({
            "success": False,
            "message": "Email, OTP and new password are required."
        }), 400

    # Verify password-reset OTP before changing password
    verification = verify_password_reset_otp(email, otp)

    if not verification.get("success"):
        return jsonify(verification), 400

    result = update_password(email, new_password)
    return jsonify(result)
