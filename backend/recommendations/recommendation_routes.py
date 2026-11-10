from flask import Blueprint, request, jsonify

from backend.recommendations.recommendation_service import (
    RecommendationService
)


recommendation_bp = Blueprint(
    "recommendations",
    __name__,
    url_prefix="/recommendations"
)


recommendation_service = RecommendationService()


# ==========================================
# GENERATE RECOMMENDATIONS
# ==========================================

@recommendation_bp.route("/generate", methods=["POST"])
def generate_recommendations():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Activity data is required"
            }), 400

        recommendations = (
            recommendation_service
            .generate_recommendations(data)
        )

        return jsonify({
            "success": True,
            "recommendations": recommendations
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500