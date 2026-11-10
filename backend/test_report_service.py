from backend.reports.report_service import ReportService


service = ReportService()


data = {

    "screen_time": 18000,

    "active_time": 15000,

    "idle_time": 3000,

    "keyboard_count": 3500,

    "mouse_clicks": 1100,

    "mouse_distance": 2500,

    "scroll_count": 150,

    "active_application": "Visual Studio Code",

    "fatigue_score": 75,

    "fatigue_level": "High",

    "burnout_score": 80,

    "burnout_level": "High",

    "brightness": 70,

    "battery_percentage": 82,

    "charging_status": True
}


report = service.generate_report(data)


print("================================")
print("REPORT")
print("================================")

print(
    "Generated:",
    report["generated_at"]
)

print()

print("Screen time:",
      report["summary"]["screen_time"])

print("Active time:",
      report["summary"]["active_time"])

print("Idle time:",
      report["summary"]["idle_time"])

print("Keyboard:",
      report["summary"]["keyboard_count"])

print("Mouse clicks:",
      report["summary"]["mouse_clicks"])

print("Active application:",
      report["summary"]["active_application"])

print()

print("Fatigue:",
      report["prediction"]["fatigue_score"],
      report["prediction"]["fatigue_level"])

print("Burnout:",
      report["prediction"]["burnout_score"],
      report["prediction"]["burnout_level"])

print()

print("Battery:",
      report["device"]["battery_percentage"])

print("Charging:",
      report["device"]["charging_status"])

print("================================")