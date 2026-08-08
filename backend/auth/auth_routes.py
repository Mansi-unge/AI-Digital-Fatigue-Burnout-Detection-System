from flask import Blueprint, request, jsonify

from backend.database.database import SessionLocal
from backend.auth.auth_service import (
    send_otp,
    verify_otp,
    register_user,
    login_user
)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp_route():

    data = request.get_json()

    db = SessionLocal()

    try:
        result = send_otp(
            db,
            data
        )

        return jsonify(result)

    finally:
        db.close()


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp_route():

    data = request.get_json()

    db = SessionLocal()

    try:
        result = verify_otp(db, data)
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