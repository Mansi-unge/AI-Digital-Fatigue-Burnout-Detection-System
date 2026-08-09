from flask import Blueprint, request, jsonify

from backend.profile.profile_service import ProfileService


profile_bp = Blueprint(
    "profile",
    __name__,
    url_prefix="/profile"
)


profile_service = ProfileService()


# ==========================================
# GET USER PROFILE
# ==========================================

@profile_bp.route("/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    try:

        profile = profile_service.get_profile(user_id)

        if not profile:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "profile": profile
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# UPDATE USER PROFILE
# ==========================================

@profile_bp.route("/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Profile data is required"
            }), 400

        profile = profile_service.update_profile(
            user_id,
            data
        )

        if not profile:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "profile": profile
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500