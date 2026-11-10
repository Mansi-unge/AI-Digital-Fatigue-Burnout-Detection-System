from flask import Blueprint, request, jsonify

from backend.settings.settings_service import SettingsService


settings_bp = Blueprint(
    "settings",
    __name__,
    url_prefix="/settings"
)


settings_service = SettingsService()


# ==========================================
# GET USER SETTINGS
# ==========================================

@settings_bp.route("/<int:user_id>", methods=["GET"])
def get_settings(user_id):

    try:

        settings = settings_service.get_settings(user_id)

        if not settings:

            # Create default settings if none exist
            settings = settings_service.create_settings(
                user_id
            )

        return jsonify({
            "success": True,
            "settings": settings
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# UPDATE USER SETTINGS
# ==========================================

@settings_bp.route("/<int:user_id>", methods=["PUT"])
def update_settings(user_id):

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Settings data is required"
            }), 400

        settings = settings_service.update_settings(
            user_id,
            data
        )

        return jsonify({
            "success": True,
            "message": "Settings updated successfully",
            "settings": settings
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500