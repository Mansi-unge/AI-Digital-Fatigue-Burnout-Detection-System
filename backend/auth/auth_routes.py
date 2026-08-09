from flask import Blueprint, request, jsonify

from backend.database.database import SessionLocal
from backend.auth.auth_service import register_user, login_user
from backend.auth.forgot_password import forgot_password
from backend.auth.verify_otp import verify_otp
from backend.auth.reset_password import reset_password

auth_bp = Blueprint("auth", __name__)


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