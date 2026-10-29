from flask import Blueprint, request, jsonify

from backend.settings.settings_service import SettingsService
from backend.monitoring.monitor_manager import monitor_manager


settings_bp = Blueprint(
    "settings",
    __name__,
    url_prefix="/settings"
)

settings_service = SettingsService()


# ==========================================================
# GET USER SETTINGS
# ==========================================================

@settings_bp.route(
    "/<int:user_id>",
    methods=["GET"]
)
def get_settings(user_id):

    try:

        settings = settings_service.get_settings(user_id)

        if not settings:

            settings = settings_service.create_settings(
                user_id
            )

        return jsonify({
            "success": True,
            "settings": settings
        }), 200

    except Exception as e:

        print("GET SETTINGS ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================================
# UPDATE USER SETTINGS
# ==========================================================

@settings_bp.route(
    "/<int:user_id>",
    methods=["PUT"]
)
def update_settings(user_id):

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Settings data is required"
            }), 400

        # --------------------------------------------------
        # SAVE SETTINGS TO DATABASE
        # --------------------------------------------------

        settings = settings_service.update_settings(
            user_id,
            data
        )

        # --------------------------------------------------
        # APPLY SETTINGS IMMEDIATELY IF USER IS MONITORING
        # --------------------------------------------------

        if (
            monitor_manager.is_running()
            and monitor_manager.user_id == user_id
        ):
            monitor_manager.apply_settings()

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        return jsonify({
            "success": True,
            "message": "Settings updated successfully",
            "settings": settings
        }), 200

    except Exception as e:

        print("UPDATE SETTINGS ERROR:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500