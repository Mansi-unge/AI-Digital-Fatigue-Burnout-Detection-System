from sqlalchemy import desc

from backend.database.database import SessionLocal
from backend.database.models.users import User
from backend.database.models.activity import Activity


class DashboardService:

    def get_dashboard(self, user_id):

        db = SessionLocal()

        try:

            # Find user
            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if user is None:
                return {
                    "success": False,
                    "message": "User not found"
                }

            # Get latest activity
            activity = db.query(Activity).filter(
                Activity.user_id == user_id
            ).order_by(
                desc(Activity.timestamp)
            ).first()

            # User exists but no activity yet
            if activity is None:

                return {
                    "success": True,

                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "designation": user.designation
                    },

                    "activity": {
                        "screen_time": 0,
                        "active_time": 0,
                        "idle_time": 0,

                        "keyboard_count": 0,
                        "typing_speed": 0,

                        "mouse_clicks": 0,
                        "mouse_distance": 0,
                        "scroll_count": 0,

                        "active_application": "None",
                        "application_switches": 0,

                        "work_duration": 0,
                        "break_duration": 0,

                        "brightness": 0,
                        "battery_percentage": 0,
                        "charging_status": False,

                        "timestamp": None
                    }
                }

            # Return latest activity
            return {

                "success": True,

                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "designation": user.designation
                },

                "activity": {

                    "screen_time": activity.screen_time,
                    "active_time": activity.active_time,
                    "idle_time": activity.idle_time,

                    "keyboard_count": activity.keyboard_count,
                    "typing_speed": activity.typing_speed,

                    "mouse_clicks": activity.mouse_clicks,
                    "mouse_distance": activity.mouse_distance,
                    "scroll_count": activity.scroll_count,

                    "active_application": (
                        activity.active_application
                    ),

                    "application_switches": (
                        activity.application_switches
                    ),

                    "work_duration": activity.work_duration,
                    "break_duration": activity.break_duration,

                    "brightness": activity.brightness,
                    "battery_percentage": (
                        activity.battery_percentage
                    ),

                    "charging_status": (
                        activity.charging_status
                    ),

                    "timestamp": (
                        activity.timestamp.isoformat()
                        if activity.timestamp
                        else None
                    )
                }
            }

        finally:

            db.close()