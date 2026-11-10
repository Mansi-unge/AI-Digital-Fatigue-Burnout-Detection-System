from flask import Blueprint, request, jsonify

from backend.reports.report_service import ReportService


report_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/reports"
)


report_service = ReportService()


# ==========================================
# GENERATE REPORT
# ==========================================

@report_bp.route("/generate", methods=["POST"])
def generate_report():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Report data is required"
            }), 400

        report = report_service.generate_report(data)

        return jsonify({
            "success": True,
            "report": report
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# REPORT SUMMARY
# ==========================================

@report_bp.route("/summary", methods=["POST"])
def report_summary():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Report data is required"
            }), 400

        summary = report_service.get_summary(data)

        return jsonify({
            "success": True,
            "summary": summary
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500