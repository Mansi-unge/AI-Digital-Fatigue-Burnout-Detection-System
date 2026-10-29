from backend.database.database import SessionLocal
from backend.database.models.activity import Activity
from backend.database.models.monitoring_sessions import MonitoringSession

from backend.prediction.fatigue_model import FatigueModel
from backend.prediction.burnout_model import BurnoutModel
from backend.prediction.health_model import HealthModel

class PredictionService:

    def __init__(self):
        self.fatigue_model = FatigueModel()
        self.burnout_model = BurnoutModel()
        self.health_model = HealthModel()

    # ==========================================================
    # PREDICT FROM PROVIDED ACTIVITY DATA
    # ==========================================================
    def predict(self, activity_data):

        # ==========================================
        # FATIGUE
        # ==========================================

        fatigue_result = self.fatigue_model.predict(
            activity_data
        )

        # ==========================================
        # BURNOUT
        # ==========================================

        burnout_result = self.burnout_model.predict(
            activity_data
        )

        # ==========================================
        # HEALTH
        # ==========================================

        health_result = self.health_model.predict(
            activity_data
        )

        # ==========================================
        # COMBINED RESULT
        # ==========================================

        return {
            "fatigue": {
                "score": fatigue_result["fatigue_score"],
                "level": fatigue_result["fatigue_level"]
            },

            "burnout": {
                "score": burnout_result["burnout_score"],
                "level": burnout_result["burnout_level"]
            },

            "health": {
                "score": health_result["health_score"],
                "level": health_result["health_level"]
            }
        }

    # ==========================================================
    # GET CURRENT AI MONITORING PREDICTION
    # ==========================================================

    def get_current_prediction(self, user_id):

        db = SessionLocal()

        try:

            # --------------------------------------------------
            # FIND ACTIVE SESSION
            # --------------------------------------------------

            session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.is_active == True
                )
                .order_by(MonitoringSession.started_at.desc())
                .first()
            )

            # --------------------------------------------------
            # NO ACTIVE SESSION
            # --------------------------------------------------

            if session is None:

                return {
                    "success": True,
                    "has_prediction": False,
                    "message": "No active monitoring session"
                }

            # --------------------------------------------------
            # ONLY AI MONITORING
            # --------------------------------------------------

            if session.mode != "AI_MONITORING":

                return {
                    "success": True,
                    "has_prediction": False,
                    "message": "Burnout prediction is available only in AI Monitoring mode"
                }

            # --------------------------------------------------
            # GET ACTIVITY RECORDS FOR CURRENT SESSION
            # --------------------------------------------------

            activities = (
                db.query(Activity)
                .filter(
                    Activity.user_id == user_id,
                    Activity.session_id == session.id
                )
                .order_by(Activity.created_at.asc())
                .all()
            )

            # --------------------------------------------------
            # NOT ENOUGH DATA
            # --------------------------------------------------

            if not activities:

                return {
                    "success": True,
                    "has_prediction": False,
                    "message": "Not enough monitoring data yet",
                    "session_id": session.id,
                    "records_used": 0
                }

            # --------------------------------------------------
            # AGGREGATE ACTIVITY DATA
            # --------------------------------------------------

            activity_data = self._aggregate_activities(
                activities
            )

            # --------------------------------------------------
            # GENERATE PREDICTION
            # --------------------------------------------------

            prediction = self.predict(
                activity_data
            )

            # --------------------------------------------------
            # RESPONSE
            # --------------------------------------------------

            return {
                "success": True,
                "has_prediction": True,
                "session_id": session.id,
                "records_used": len(activities),
                "prediction": prediction,
                "features": activity_data
            }

        except Exception as e:

            print(
                "PredictionService current prediction error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:

            db.close()

    # ==========================================================
    # AGGREGATE ACTIVITY RECORDS
    # ==========================================================
    def _aggregate_activities(self, activities):

        if not activities:
            return {
                "screen_time": 0,
                "active_time": 0,
                "idle_time": 0,
                "keyboard_count": 0,
                "mouse_clicks": 0,
                "scroll_count": 0,
                "application_switches": 0,
                "blink_rate": 0,
                "eye_closure": 0,
                "yawn_count": 0,
                "head_pose": "UNKNOWN",
            }

        # ==========================================================
        # LATEST ACTIVITY
        # ==========================================================

        latest = max(
            activities,
            key=lambda a: a.created_at
        )

        # ==========================================================
        # DESKTOP
        # These values are cumulative/current counters.
        # Use the latest value rather than adding every snapshot.
        # ==========================================================

        screen_time = float(latest.screen_time or 0)

        active_time = float(latest.active_time or 0)

        idle_time = float(latest.idle_time or 0)

        keyboard_count = int(latest.keyboard_count or 0)

        mouse_clicks = int(latest.mouse_clicks or 0)

        scroll_count = int(latest.scroll_count or 0)

        application_switches = int(
            latest.application_switches or 0
        )

        # ==========================================================
        # CAMERA
        # These are interval measurements.
        # Average them across the session.
        # ==========================================================

        blink_values = [
            float(a.blink_rate)
            for a in activities
            if a.blink_rate is not None
        ]

        eye_closure_values = [
            float(a.eye_closure)
            for a in activities
            if a.eye_closure is not None
        ]

        blink_rate = (
            sum(blink_values) / len(blink_values)
            if blink_values
            else 0
        )

        eye_closure = (
            sum(eye_closure_values) / len(eye_closure_values)
            if eye_closure_values
            else 0
        )

        # ==========================================================
        # YAWN
        # Count occurrences over the session.
        # ==========================================================

        yawn_count = sum(
            int(a.yawn_count or 0)
            for a in activities
        )

        # ==========================================================
        # HEAD POSE
        # ==========================================================

        head_pose_counts = {}

        for activity in activities:

            pose = activity.head_pose or "UNKNOWN"

            head_pose_counts[pose] = (
                head_pose_counts.get(pose, 0) + 1
            )

        dominant_head_pose = (
            max(
                head_pose_counts,
                key=head_pose_counts.get
            )
            if head_pose_counts
            else "UNKNOWN"
        )

        # ==========================================================
        # ENVIRONMENT
        # ==========================================================

        temperatures = [
            float(a.temperature)
            for a in activities
            if a.temperature is not None
        ]

        humidities = [
            float(a.humidity)
            for a in activities
            if a.humidity is not None
        ]

        lights = [
            float(a.light)
            for a in activities
            if a.light is not None
        ]

        brightness_values = [
            float(a.brightness or 0)
            for a in activities
        ]

        battery_values = [
            float(a.battery_percentage or 0)
            for a in activities
        ]

        average_temperature = (
            sum(temperatures) / len(temperatures)
            if temperatures else 0
        )

        average_humidity = (
            sum(humidities) / len(humidities)
            if humidities else 0
        )

        average_light = (
            sum(lights) / len(lights)
            if lights else 0
        )

        average_brightness = (
            sum(brightness_values) / len(brightness_values)
            if brightness_values else 0
        )

        average_battery = (
            sum(battery_values) / len(battery_values)
            if battery_values else 0
        )

        # ==========================================================
        # RETURN
        # ==========================================================

        return {
            "screen_time": screen_time,
            "active_time": active_time,
            "idle_time": idle_time,

            "work_duration": active_time,
            "break_duration": idle_time,

            "keyboard_count": keyboard_count,
            "mouse_clicks": mouse_clicks,
            "scroll_count": scroll_count,
            "application_switches": application_switches,

            "blink_rate": blink_rate,
            "eye_closure": eye_closure,
            "yawn_count": yawn_count,
            "head_pose": dominant_head_pose,

            "temperature": average_temperature,
            "humidity": average_humidity,
            "light": average_light,
            "brightness": average_brightness,

            "battery_percentage": average_battery,
        }