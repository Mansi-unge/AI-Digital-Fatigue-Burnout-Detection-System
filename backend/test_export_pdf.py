from backend.reports.export_pdf import PDFReportExporter


exporter = PDFReportExporter()


report_data = {

    "generated_at": "2026-08-09 15:00:00",

    "summary": {
        "screen_time": 18000,
        "active_time": 15000,
        "idle_time": 3000,
        "keyboard_count": 3500,
        "mouse_clicks": 1100,
        "mouse_distance": 2500,
        "scroll_count": 150,
        "active_application": "Visual Studio Code"
    },

    "prediction": {
        "fatigue_score": 75,
        "fatigue_level": "High",
        "burnout_score": 80,
        "burnout_level": "High"
    },

    "device": {
        "brightness": 70,
        "battery_percentage": 82,
        "charging_status": True
    }
}


output_path = "burnout_report.pdf"


exporter.generate_pdf(
    report_data,
    output_path
)


print("================================")
print("PDF REPORT GENERATED")
print("================================")
print(
    "File:",
    output_path
)
print("================================")