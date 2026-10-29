from flask import Blueprint, request, jsonify

from backend.prediction.prediction_service import PredictionService
from backend.recommendations.recommendation_service import (
    RecommendationService
)


recommendation_bp = Blueprint(
    "recommendations",
    __name__,
    url_prefix="/recommendations"
)


prediction_service = PredictionService()
recommendation_service = RecommendationService()


# ==========================================================
# GET CURRENT RECOMMENDATIONS
# ==========================================================

@recommendation_bp.route("/current", methods=["GET"])
def current_recommendations():

    try:

        user_id = request.args.get(
            "user_id",
            type=int
        )

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # ==================================================
        # GET CURRENT AI PREDICTION
        # ==================================================

        prediction_result = (
            prediction_service
            .get_current_prediction(
                user_id=user_id
            )
        )

        if not prediction_result.get("success"):

            return jsonify(
                prediction_result
            ), 500

        # ==================================================
        # NO PREDICTION YET
        # ==================================================

        if not prediction_result.get(
            "has_prediction",
            False
        ):

            return jsonify({
                "success": True,
                "has_recommendations": False,
                "message": prediction_result.get(
                    "message",
                    "Not enough monitoring data yet"
                ),
                "recommendations": []
            }), 200

        # ==================================================
        # GENERATE RECOMMENDATIONS
        # ==================================================

        recommendations = (
            recommendation_service
            .generate_recommendations(
                prediction_result,
                user_id
            )
        )

        # ==================================================
        # RESPONSE
        # ==================================================

        return jsonify({

            "success": True,

            "has_recommendations": True,

            "session_id": prediction_result.get(
                "session_id"
            ),

            "recommendations": recommendations

        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500