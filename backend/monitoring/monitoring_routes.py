from flask import Blueprint, jsonify, request, Response

import cv2
import time

from backend.monitoring.monitor_manager import monitor_manager
from backend.monitoring.monitoring_service import MonitoringService
from backend.database.database import SessionLocal
from backend.database.models.monitoring_sessions import MonitoringSession

monitoring_bp = Blueprint(
    "monitoring",
    __name__,
    url_prefix="/monitoring"
)

monitoring_service = MonitoringService()


# ==========================================================
# LIVE CAMERA FRAME GENERATOR
# ==========================================================

def generate_camera_frames():

    while (
        monitor_manager.is_running()
        and monitor_manager.camera_stream.is_running()
    ):

        frame = monitor_manager.get_frame()

        if frame is None:
            time.sleep(0.1)
            continue

        success, buffer = cv2.imencode(
            ".jpg",
            frame
        )

        if not success:
            time.sleep(0.03)
            continue

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame_bytes
            + b"\r\n"
        )

        time.sleep(0.03)

# ==========================================================
# SAVE FATIGUE SELF-REPORT
# ==========================================================


# ==========================================================
# SAVE FATIGUE SELF-REPORT
# ==========================================================

@monitoring_bp.route("/fatigue", methods=["POST"])
def save_fatigue():

    db = SessionLocal()

    try:
        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        session_id = data.get("session_id")
        level = data.get("level")

        # --------------------------------------------------
        # VALIDATE INPUT
        # --------------------------------------------------

        if not all([user_id, session_id, level]):
            return jsonify({
                "success": False,
                "message": "user_id, session_id and level are required"
            }), 400

        try:
            user_id = int(user_id)
            session_id = int(session_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Invalid user_id or session_id"
            }), 400

        level = str(level).strip().lower()

        if level not in ["healthy", "mild", "high"]:
            return jsonify({
                "success": False,
                "message": "Invalid fatigue level"
            }), 400

        # --------------------------------------------------
        # VALIDATE MONITORING SESSION
        # --------------------------------------------------

        session = (
            db.query(MonitoringSession)
            .filter(
                MonitoringSession.id == session_id,
                MonitoringSession.user_id == user_id,
                MonitoringSession.is_active == True,
                MonitoringSession.mode == "DATA_COLLECTION"
            )
            .first()
        )

        if session is None:
            return jsonify({
                "success": False,
                "message": "No active Data Collection session found"
            }), 400

        # --------------------------------------------------
        # SAVE FATIGUE RESPONSE
        # --------------------------------------------------

        result = monitoring_service.save_fatigue_report(
            user_id=user_id,
            level=level,
            session_id=session_id
        )

        if not result.get("success"):
            return jsonify(result), 400

        print(
            f"Fatigue response saved: "
            f"user_id={user_id}, "
            f"session_id={session_id}, "
            f"level={level}"
        )

        return jsonify({
            "success": True,
            "message": "Fatigue response saved successfully",
            "user_id": user_id,
            "session_id": session_id,
            "level": level
        }), 200

    except Exception as e:

        db.rollback()

        print("Fatigue self-report error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to save fatigue response"
        }), 500

    finally:
        db.close()

# ==========================================================
# GET LATEST FATIGUE SELF-REPORT
# ==========================================================

@monitoring_bp.route("/fatigue/latest", methods=["GET"])
def latest_fatigue():
    try:
        user_id = request.args.get("user_id", type=int)

        if user_id is None:
            return jsonify({"success": False, "message": "user_id is required"}), 400

        result = monitoring_service.get_latest_fatigue(user_id=user_id)

        if not result["success"]:
            return jsonify(result), 500

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



# ==========================================================
# LIVE CAMERA STREAM
# ==========================================================

@monitoring_bp.route("/camera/stream", methods=["GET"])
def camera_stream():

    if not monitor_manager.is_running():
        return jsonify({
            "success": False,
            "message": "Monitoring is not running"
        }), 400

    if not monitor_manager.camera_stream.is_running():
        return jsonify({
            "success": False,
            "message": "Camera is disabled"
        }), 400

    return Response(
        generate_camera_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )




# ==========================================================
# CAMERA ON / OFF
# ==========================================================

@monitoring_bp.route(
    "/camera/toggle",
    methods=["POST"]
)
def toggle_camera():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        user_id = data.get("user_id")
        enabled = data.get("enabled")

        # ======================================================
        # VALIDATE AND CONVERT USER ID
        # ======================================================

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        try:
            user_id = int(user_id)

        except (TypeError, ValueError):

            return jsonify({
                "success": False,
                "message": "Invalid user ID"
            }), 400

        # ======================================================
        # VALIDATE ENABLED
        # ======================================================

        if not isinstance(enabled, bool):

            return jsonify({
                "success": False,
                "message": "enabled must be true or false"
            }), 400

        # ======================================================
        # CHECK MONITORING
        # ======================================================

        if not monitor_manager.is_running():

            return jsonify({
                "success": False,
                "message": "Monitoring is not running"
            }), 400

        # ======================================================
        # CHECK ACTIVE USER
        # ======================================================

        if monitor_manager.user_id != user_id:

            return jsonify({
                "success": False,
                "message": "Active monitoring user mismatch"
            }), 403

        # ======================================================
        # CHANGE CAMERA STATE
        # ======================================================

        result = (
            monitor_manager
            .set_camera_enabled(enabled)
        )

        if not result.get("success"):

            return jsonify(result), 400

        # ======================================================
        # RESPONSE
        # ======================================================

        return jsonify({

            "success": True,

            "enabled": result.get(
                "enabled",
                enabled
            ),

            "message": result.get(
                "message",
                "Camera setting updated."
            )

        }), 200

    except Exception as e:

        print(
            "Camera toggle error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "message": "Unable to update camera status."

        }), 500

# ==========================================================
# START MONITORING
# ==========================================================

@monitoring_bp.route(
    "/start",
    methods=["POST"]
)
def start_monitoring():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        user_id = data.get("user_id")

        mode = data.get("mode")

        # ------------------------------------------
        # VALIDATE AND CONVERT USER ID
        # ------------------------------------------

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        try:
            user_id = int(user_id)

        except (TypeError, ValueError):
            return jsonify({
                "success": False,
                "message": "Invalid user ID"
            }), 400

        # ------------------------------------------
        # VALIDATE MONITORING MODE
        # ------------------------------------------

        if mode not in ["DATA_COLLECTION", "AI_MONITORING"]:
            return jsonify({
                "success": False,
                "message": "Invalid monitoring mode"
            }), 400

        # ------------------------------------------
        # CHECK MONITORING
        # ------------------------------------------

        if monitor_manager.is_running():

            return jsonify({
                "success": False,
                "message": "Monitoring is already running",
                "user_id": monitor_manager.user_id,
                "session_id": getattr(
                    monitor_manager,
                    "session_id",
                    None
                )
            }), 400

        # ------------------------------------------
        # CREATE SESSION THROUGH SERVICE
        # ------------------------------------------

        result = (
            monitoring_service
            .start_monitoring(
                user_id=user_id,
                mode=mode
            )
        )

        if not result["success"]:
            return jsonify(result), 400

        session_id = result["session_id"]

        # ------------------------------------------
        # SET MONITOR MANAGER
        # ------------------------------------------

        monitor_manager.set_user(
            user_id,
            session_id
        )

        monitor_manager.start_transition()

        try:
            monitor_manager.start()

        except Exception as start_error:

            print("Monitoring startup failed:", str(start_error))

            try:
                monitor_manager.stop()
            except Exception as cleanup_error:
                print("Monitoring cleanup failed:", str(cleanup_error))

            try:
                monitoring_service.stop_monitoring(
                    user_id=user_id
                )
            except Exception as session_error:
                print("Session cleanup failed:", str(session_error))

            monitor_manager.user_id = None
            monitor_manager.session_id = None

            monitor_manager.set_transition_phase(
                "error",
                message="Unable to start monitoring.",
                error=str(start_error)
            )

            return jsonify({
                "success": False,
                "message": "Unable to start monitoring."
            }), 500

        # ------------------------------------------
        # START MONITORS
        # ------------------------------------------

        return jsonify({

            "success": True,

            "message": "Monitoring started",

            "user_id": user_id,

            "session_id": session_id,

            "mode": result["mode"],

            "started_at": result["started_at"]

        }), 200

    except Exception as e:

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500

# ==========================================================
# IoT DATA
# ==========================================================

@monitoring_bp.route(
    "/iot-data",
    methods=["POST"]
)
def receive_iot_data():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        if not data:

            return jsonify({
                "success": False,
                "message": "No JSON data received"
            }), 400

        # --------------------------------------------------
        # CHECK MONITORING
        # --------------------------------------------------

        if not monitor_manager.is_running():

            return jsonify({
                "success": False,
                "message": "Monitoring is not running"
            }), 400

        # --------------------------------------------------
        # USER
        # --------------------------------------------------

        user_id = monitor_manager.user_id

        if user_id is None:

            return jsonify({
                "success": False,
                "message":
                    "No monitoring user is active"
            }), 400

        # --------------------------------------------------
        # SESSION
        # --------------------------------------------------

        session_id = getattr(
            monitor_manager,
            "session_id",
            None
        )

        if session_id is None:

            return jsonify({
                "success": False,
                "message":
                    "No active monitoring session"
            }), 400

        # --------------------------------------------------
        # SENSOR VALUES
        # --------------------------------------------------

        temperature = data.get(
            "temperature"
        )

        humidity = data.get(
            "humidity"
        )

        light = data.get(
            "light"
        )

        distance = data.get(
            "distance"
        )

        motion = data.get(
            "motion"
        )

        # --------------------------------------------------
        # NUMERIC CONVERSION
        # --------------------------------------------------

        if temperature is not None:
            temperature = float(
                temperature
            )

        if humidity is not None:
            humidity = float(
                humidity
            )

        if light is not None:
            light = float(
                light
            )

        if distance is not None:
            distance = float(
                distance
            )

        # --------------------------------------------------
        # MOTION CONVERSION
        # --------------------------------------------------

        if motion is not None:

            if isinstance(
                motion,
                str
            ):

                motion = (
                    motion.lower()
                    == "true"
                )

            else:

                motion = bool(
                    motion
                )

        # --------------------------------------------------
        # UPDATE IoT MANAGER
        # --------------------------------------------------

        monitor_manager.iot.update_data(

            temperature=temperature,

            humidity=humidity,

            light=light,

            distance=distance,

            motion=motion

        )
        monitor_manager.mark_iot_data_received()

        return jsonify({

            "success": True,

            "message":
                "IoT data received successfully",

            "user_id":
                user_id,

            "session_id":
                session_id,

            "data": {

                "temperature":
                    temperature,

                "humidity":
                    humidity,

                "light":
                    light,

                "distance":
                    distance,

                "motion":
                    motion
            }

        }), 200

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "success": False,

            "message":
                "Invalid sensor data"

        }), 400

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ==========================================================
# GET MONITORING DATA
# ==========================================================

@monitoring_bp.route(
    "/data",
    methods=["GET"]
)
def get_monitoring_data():

    try:

        user_id = request.args.get(
            "user_id",
            type=int
        )

        session_id = request.args.get(
            "session_id",
            type=int
        )

        if user_id is None:

            return jsonify({

                "success": False,

                "message":
                    "user_id is required"

            }), 400

        result = (
            monitoring_service
            .get_activity_history(
                user_id=user_id,
                session_id=session_id
            )
        )
        iot_status = monitor_manager.get_iot_status()

        activity_live = (
            monitor_manager.is_running()
            and monitor_manager.user_id == user_id
        )

        if not result["success"]:

            return jsonify(
                result
            ), 500


        return jsonify({
            "success": True,
            "data": result["data"],

            # Activity monitoring status
            "activity_live": activity_live,

            # IoT status
            "iot_live": iot_status["iot_live"],
            "iot_last_received": iot_status["iot_last_received"],
            "iot_age_seconds": iot_status["iot_age_seconds"]
        }), 200

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ==========================================================
# GET MONITORING HISTORY
# ==========================================================

@monitoring_bp.route(
    "/history",
    methods=["GET"]
)
def get_monitoring_history():

    try:

        # ======================================================
        # USER ID
        # ======================================================

        user_id = request.args.get(
            "user_id",
            type=int
        )

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # ======================================================
        # MODE
        # ======================================================

        mode = request.args.get(
            "mode"
        )

        if mode == "":
            mode = None

        # ======================================================
        # GROUP BY
        # ======================================================

        group_by = request.args.get(
            "group_by",
            default="session"
        )

        # ======================================================
        # DATE RANGE
        # ======================================================

        start_date = request.args.get(
            "start_date"
        )

        end_date = request.args.get(
            "end_date"
        )

        # ======================================================
        # CALL SERVICE
        # ======================================================

        result = (
            monitoring_service
            .get_monitoring_history(
                user_id=user_id,
                mode=mode,
                group_by=group_by,
                start_date=start_date,
                end_date=end_date
            )
        )

        # ======================================================
        # HANDLE SERVICE ERROR
        # ======================================================

        if not result["success"]:

            return jsonify(result), 400

        # ======================================================
        # SUCCESS
        # ======================================================

        return jsonify(result), 200

    except Exception as e:

        print(
            "Monitoring history route error:",
            str(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to load monitoring history."
        }), 500




# ==========================================================
# GET SINGLE MONITORING SESSION DETAILS
# ==========================================================

@monitoring_bp.route(
    "/history/<int:session_id>",
    methods=["GET"]
)
def get_monitoring_session_details(session_id):

    try:

        # ======================================================
        # USER ID
        # ======================================================

        user_id = request.args.get(
            "user_id",
            type=int
        )

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # ======================================================
        # SESSION DETAILS
        # ======================================================

        result = (
            monitoring_service
            .get_monitoring_session_details(
                user_id=user_id,
                session_id=session_id
            )
        )

        # ======================================================
        # HANDLE ERROR
        # ======================================================

        if not result["success"]:

            return jsonify(result), 404

        # ======================================================
        # SUCCESS
        # ======================================================

        return jsonify(result), 200

    except Exception as e:

        print(
            "Monitoring session details route error:",
            str(e)
        )

        return jsonify({
            "success": False,
            "message": (
                "Unable to load session details."
            )
        }), 500

# ==========================================================
# GET DATA COLLECTION PROGRESS
# ==========================================================

@monitoring_bp.route(
    "/data-collection/progress",
    methods=["GET"]
)
def get_data_collection_progress():

    try:

        user_id = request.args.get(
            "user_id",
            type=int
        )

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        result = (
            monitoring_service
            .get_data_collection_progress(
                user_id=user_id
            )
        )

        if not result["success"]:
            return jsonify(result), 500

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500



# ==========================================================
# STOP MONITORING
# ==========================================================

@monitoring_bp.route("/stop", methods=["POST"])
def stop_monitoring():

    try:
        user_id = monitor_manager.user_id

        if user_id is None or not monitor_manager.is_running():
            return jsonify({
                "success": False,
                "message": "No active monitoring session."
            }), 400

        monitor_manager.stop_transition()

        # Stop monitors and save final activity snapshot.
        stop_result = monitor_manager.stop()

        if not stop_result.get("success"):
            monitor_manager.set_transition_phase(
                "error",
                message="Monitoring could not be stopped completely.",
                error=stop_result.get("message")
            )

            return jsonify(stop_result), 500

        # Close the database session only after final save.
        result = monitoring_service.stop_monitoring(
            user_id=user_id
        )

        if not result.get("success"):
            monitor_manager.set_transition_phase(
                "error",
                message="Monitoring stopped, but the database session could not be closed.",
                error=result.get("message")
            )

            return jsonify(result), 500

        monitor_manager.update_transition_step(
            "close_session",
            True,
            "Monitoring session closed successfully."
        )

        monitor_manager.set_transition_phase(
            "completed",
            message="Monitoring stopped successfully."
        )

        # Clear user/session only after the transition is complete.
        monitor_manager.user_id = None
        monitor_manager.session_id = None

        return jsonify(result), 200

    except Exception as e:

        print("Monitoring stop error:", str(e))

        monitor_manager.set_transition_phase(
            "error",
            message="Unable to stop monitoring.",
            error=str(e)
        )

        return jsonify({
            "success": False,
            "message": "Unable to stop monitoring."
        }), 500
# ==========================================================
# GET CURRENT MONITORING SESSION
# ==========================================================

@monitoring_bp.route("/current", methods=["GET"])
def get_current_monitoring():
    user_id = request.args.get("user_id", type=int)

    if not user_id:
        return jsonify({
            "success": False,
            "message": "user_id is required"
        }), 400

    db = SessionLocal()

    try:
        session = (
            db.query(MonitoringSession)
            .filter(
                MonitoringSession.user_id == user_id,
                MonitoringSession.is_active == True
            )
            .order_by(
                MonitoringSession.started_at.desc()
            )
            .first()
        )

        if not session:
            return jsonify({
                "success": True,
                "has_active_session": False,
                "session": None
            }), 200

        return jsonify({
            "success": True,
            "has_active_session": True,
            "session": {
                "id": session.id,
                "user_id": session.user_id,
                "mode": session.mode,
                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at else None
                ),
                "ended_at": (
                    session.ended_at.isoformat()
                    if session.ended_at else None
                ),
                "last_sync_at": (
                    session.last_sync_at.isoformat()
                    if session.last_sync_at else None
                ),
                "is_active": session.is_active
            }
        }), 200

    except Exception as e:
        print("Current monitoring error:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        db.close()




# ==========================================================
# MONITORING STATUS
# ==========================================================

@monitoring_bp.route("/status", methods=["GET"])
def monitoring_status():

    try:
        # --------------------------------------------------
        # CHECK WHETHER MONITORING IS RUNNING
        # --------------------------------------------------

        running = monitor_manager.is_running()

        if not running:
            return jsonify({
                "success": True,
                "running": False,
                "user_id": None,
                "session_id": None,
                "mode": None,
                "started_at": None,
                "ended_at": None
            }), 200

        # --------------------------------------------------
        # GET ACTIVE SESSION FROM MONITOR MANAGER
        # --------------------------------------------------

        user_id = monitor_manager.user_id

        session_id = getattr(
            monitor_manager,
            "session_id",
            None
        )

        if user_id is None or session_id is None:
            return jsonify({
                "success": True,
                "running": False,
                "user_id": None,
                "session_id": None,
                "mode": None,
                "started_at": None,
                "ended_at": None
            }), 200

        # --------------------------------------------------
        # GET SESSION DETAILS FROM DATABASE
        # --------------------------------------------------

        db = SessionLocal()

        try:
            session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.id == session_id,
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.is_active == True
                )
                .first()
            )

            if session is None:
                return jsonify({
                    "success": True,
                    "running": False,
                    "user_id": None,
                    "session_id": None,
                    "mode": None,
                    "started_at": None,
                    "ended_at": None
                }), 200

            return jsonify({
                "success": True,
                "running": True,
                "user_id": user_id,
                "session_id": session.id,
                "mode": session.mode,
                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at else None
                ),
                "ended_at": (
                    session.ended_at.isoformat()
                    if session.ended_at else None
                )
            }), 200

        finally:
            db.close()

    except Exception as e:

        print("Monitoring status error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve monitoring status"
        }), 500



# ==========================================================
# GET REAL MONITORING TRANSITION STATUS
# ==========================================================

@monitoring_bp.route("/transition-status", methods=["GET"])
def get_transition_status():

    try:
        return jsonify({
            "success": True,
            **monitor_manager.get_transition_status()
        }), 200

    except Exception as e:
        print("Transition status error:", str(e))

        return jsonify({
            "success": False,
            "message": "Unable to retrieve transition status."
        }), 500