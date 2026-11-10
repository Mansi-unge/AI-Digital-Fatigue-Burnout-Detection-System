from backend.prediction.fatigue_model import FatigueModel
from backend.prediction.burnout_model import BurnoutModel


class PredictionService:

    def __init__(self):

        self.fatigue_model = FatigueModel()

        self.burnout_model = BurnoutModel()

    # ==========================================
    # GENERATE PREDICTIONS
    # ==========================================

    def predict(self, activity_data):

        # Fatigue prediction
        fatigue_result = self.fatigue_model.predict(
            activity_data
        )

        # Burnout prediction
        burnout_result = self.burnout_model.predict(
            activity_data
        )

        # ======================================
        # COMBINED RESULT
        # ======================================

        return {

            "fatigue": {

                "score":
                    fatigue_result["fatigue_score"],

                "level":
                    fatigue_result["fatigue_level"]
            },

            "burnout": {

                "score":
                    burnout_result["burnout_score"],

                "level":
                    burnout_result["burnout_level"]
            }
        }