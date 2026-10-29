from functools import wraps

from flask import request, jsonify


def require_user(f):

    @wraps(f)
    def decorated_function(*args, **kwargs):

        # ==========================================
        # GET USER ID FROM HEADER
        # ==========================================

        user_id = request.headers.get("X-User-ID")

        if not user_id:

            return jsonify({
                "success": False,
                "message": "User authentication required"
            }), 401

        # ==========================================
        # VALIDATE USER ID
        # ==========================================

        try:
            user_id = int(user_id)

        except ValueError:

            return jsonify({
                "success": False,
                "message": "Invalid user ID"
            }), 401

        # ==========================================
        # ADD USER ID TO REQUEST
        # ==========================================

        request.user_id = user_id

        return f(*args, **kwargs)

    return decorated_function