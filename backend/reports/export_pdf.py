from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch


class PDFReportExporter:

    def generate_pdf(self, report_data, output_path):

        document = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()

        story = []

        # ==========================================
        # TITLE
        # ==========================================

        story.append(
            Paragraph(
                "AI Digital Fatigue & Burnout Report",
                styles["Title"]
            )
        )

        story.append(Spacer(1, 20))

        # ==========================================
        # GENERATED DATE
        # ==========================================

        generated_at = report_data.get(
            "generated_at",
            "Unknown"
        )

        story.append(
            Paragraph(
                f"Generated: {generated_at}",
                styles["Normal"]
            )
        )

        story.append(Spacer(1, 20))

        # ==========================================
        # ACTIVITY SUMMARY
        # ==========================================

        story.append(
            Paragraph(
                "Activity Summary",
                styles["Heading2"]
            )
        )

        summary = report_data.get(
            "summary",
            {}
        )

        summary_data = [
            ["Metric", "Value"],

            [
                "Screen Time",
                str(summary.get("screen_time", 0))
            ],

            [
                "Active Time",
                str(summary.get("active_time", 0))
            ],

            [
                "Idle Time",
                str(summary.get("idle_time", 0))
            ],

            [
                "Keyboard Count",
                str(summary.get("keyboard_count", 0))
            ],

            [
                "Mouse Clicks",
                str(summary.get("mouse_clicks", 0))
            ],

            [
                "Mouse Distance",
                str(summary.get("mouse_distance", 0))
            ],

            [
                "Scroll Count",
                str(summary.get("scroll_count", 0))
            ],

            [
                "Active Application",
                str(
                    summary.get(
                        "active_application",
                        "Unknown"
                    )
                )
            ]
        ]

        table = Table(
            summary_data,
            colWidths=[3 * inch, 3 * inch]
        )

        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.grey
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    1,
                    colors.black
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ])
        )

        story.append(table)

        story.append(Spacer(1, 25))

        # ==========================================
        # PREDICTION
        # ==========================================

        story.append(
            Paragraph(
                "Fatigue & Burnout Prediction",
                styles["Heading2"]
            )
        )

        prediction = report_data.get(
            "prediction",
            {}
        )

        prediction_data = [
            ["Prediction", "Score", "Level"],

            [
                "Fatigue",
                str(
                    prediction.get(
                        "fatigue_score",
                        0
                    )
                ),
                str(
                    prediction.get(
                        "fatigue_level",
                        "Unknown"
                    )
                )
            ],

            [
                "Burnout",
                str(
                    prediction.get(
                        "burnout_score",
                        0
                    )
                ),
                str(
                    prediction.get(
                        "burnout_level",
                        "Unknown"
                    )
                )
            ]
        ]

        prediction_table = Table(
            prediction_data,
            colWidths=[
                2.5 * inch,
                1.5 * inch,
                2 * inch
            ]
        )

        prediction_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.grey
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    1,
                    colors.black
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ])
        )

        story.append(prediction_table)

        story.append(Spacer(1, 25))

        # ==========================================
        # DEVICE INFORMATION
        # ==========================================

        story.append(
            Paragraph(
                "Device Information",
                styles["Heading2"]
            )
        )

        device = report_data.get(
            "device",
            {}
        )

        device_data = [
            ["Metric", "Value"],

            [
                "Brightness",
                str(
                    device.get(
                        "brightness",
                        0
                    )
                )
            ],

            [
                "Battery",
                str(
                    device.get(
                        "battery_percentage",
                        0
                    )
                ) + "%"
            ],

            [
                "Charging",
                str(
                    device.get(
                        "charging_status",
                        False
                    )
                )
            ]
        ]

        device_table = Table(
            device_data,
            colWidths=[3 * inch, 3 * inch]
        )

        device_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.grey
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    1,
                    colors.black
                ),

                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ])
        )

        story.append(device_table)

        story.append(Spacer(1, 30))

        story.append(
            Paragraph(
                "End of Report",
                styles["Normal"]
            )
        )

        # ==========================================
        # BUILD PDF
        # ==========================================

        document.build(story)

        return output_path