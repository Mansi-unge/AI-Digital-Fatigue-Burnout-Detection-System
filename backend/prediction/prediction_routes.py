from flask import Blueprint, request, jsonify

from backend.prediction.prediction_service import PredictionService


prediction_bp = Blueprint(
    "prediction",
    __name__,
    url_prefix="/prediction"
)


prediction_service = PredictionService()


# ==========================================
# PREDICT FATIGUE + BURNOUT
# ==========================================

@prediction_bp.route("/predict", methods=["POST"])
def predict():

    try:

        activity_data = request.get_json()

        if not activity_data:

            return jsonify({
                "success": False,
                "message": "Activity data is required"
            }), 400

        result = prediction_service.predict(
            activity_data
        )

        return jsonify({
            "success": True,
            "prediction": result
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500