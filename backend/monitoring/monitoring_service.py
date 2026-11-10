from backend.database.database import SessionLocal
from backend.database.models.activity import Activity


class MonitoringService:

    def save_activity(
        self,
        user_id,
        screen_time=0,
        active_time=0,
        idle_time=0,
        keyboard_count=0,
        typing_speed=0,
        mouse_clicks=0,
        mouse_distance=0,
        scroll_count=0,
        active_application="Unknown",
        application_switches=0,
        work_duration=0,
        break_duration=0,
        brightness=50,
        battery_percentage=100,
        charging_status=False
    ):

        db = SessionLocal()

        try:

            activity = Activity(

                user_id=user_id,

                screen_time=screen_time,
                active_time=active_time,
                idle_time=idle_time,

                keyboard_count=keyboard_count,
                typing_speed=typing_speed,

                mouse_clicks=mouse_clicks,
                mouse_distance=mouse_distance,
                scroll_count=scroll_count,

                active_application=active_application,
                application_switches=application_switches,

                work_duration=work_duration,
                break_duration=break_duration,

                brightness=brightness,
                battery_percentage=battery_percentage,
                charging_status=charging_status
            )

            db.add(activity)
            db.commit()
            db.refresh(activity)

            return {
                "success": True,
                "message": "Activity saved successfully",
                "activity_id": activity.id
            }

        except Exception as e:

            db.rollback()

            return {
                "success": False,
                "message": str(e)
            }

        finally:

            db.close()