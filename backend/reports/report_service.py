from datetime import datetime


class ReportService:

    # ==========================================
    # GENERATE REPORT
    # ==========================================

    def generate_report(self, data):

        report = {
            "generated_at": datetime.utcnow().isoformat(),

            "summary": {
                "screen_time": data.get("screen_time", 0),
                "active_time": data.get("active_time", 0),
                "idle_time": data.get("idle_time", 0),
                "keyboard_count": data.get("keyboard_count", 0),
                "mouse_clicks": data.get("mouse_clicks", 0),
                "mouse_distance": data.get("mouse_distance", 0),
                "scroll_count": data.get("scroll_count", 0),
                "active_application": data.get(
                    "active_application",
                    "Unknown"
                )
            },

            "prediction": {
                "fatigue_score": data.get(
                    "fatigue_score",
                    0
                ),
                "fatigue_level": data.get(
                    "fatigue_level",
                    "Unknown"
                ),
                "burnout_score": data.get(
                    "burnout_score",
                    0
                ),
                "burnout_level": data.get(
                    "burnout_level",
                    "Unknown"
                )
            },

            "device": {
                "brightness": data.get(
                    "brightness",
                    0
                ),
                "battery_percentage": data.get(
                    "battery_percentage",
                    0
                ),
                "charging_status": data.get(
                    "charging_status",
                    False
                )
            }
        }

        return report

    # ==========================================
    # REPORT SUMMARY
    # ==========================================

    def get_summary(self, data):

        return {
            "screen_time": data.get(
                "screen_time",
                0
            ),

            "active_time": data.get(
                "active_time",
                0
            ),

            "idle_time": data.get(
                "idle_time",
                0
            ),

            "keyboard_count": data.get(
                "keyboard_count",
                0
            ),

            "mouse_clicks": data.get(
                "mouse_clicks",
                0
            ),

            "fatigue_score": data.get(
                "fatigue_score",
                0
            ),

            "burnout_score": data.get(
                "burnout_score",
                0
            )
        }