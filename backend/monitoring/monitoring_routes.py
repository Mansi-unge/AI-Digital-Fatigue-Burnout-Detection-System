from flask import Blueprint, jsonify

from backend.monitoring.monitor_manager import MonitorManager


monitoring_bp = Blueprint(
    "monitoring",
    __name__,
    url_prefix="/monitoring"
)


# Create one manager
monitor_manager = MonitorManager()


# ==========================================
# START MONITORING
# ==========================================

@monitoring_bp.route("/start", methods=["POST"])
def start_monitoring():

    try:

        monitor_manager.start()

        return jsonify({
            "success": True,
            "message": "Monitoring started"
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# GET LIVE MONITORING DATA
# ==========================================

@monitoring_bp.route("/data", methods=["GET"])
def get_monitoring_data():

    try:

        if not monitor_manager.is_running():

            return jsonify({
                "success": False,
                "message": "Monitoring is not running"
            }), 400

        data = monitor_manager.get_data()

        return jsonify({
            "success": True,
            "data": data
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# STOP MONITORING
# ==========================================

@monitoring_bp.route("/stop", methods=["POST"])
def stop_monitoring():

    try:

        monitor_manager.stop()

        return jsonify({
            "success": True,
            "message": "Monitoring stopped"
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# MONITORING STATUS
# ==========================================

@monitoring_bp.route("/status", methods=["GET"])
def monitoring_status():

    return jsonify({
        "success": True,
        "running": monitor_manager.is_running()
    }), 200