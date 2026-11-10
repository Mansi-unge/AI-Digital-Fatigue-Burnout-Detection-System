from flask import Blueprint, jsonify

from backend.dashboard.dashboard_service import DashboardService


dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


dashboard_service = DashboardService()


@dashboard_bp.route(
    "/dashboard/<int:user_id>",
    methods=["GET"]
)
def get_dashboard(user_id):

    result = dashboard_service.get_dashboard(user_id)

    if not result["success"]:
        return jsonify(result), 404

    return jsonify(result), 200