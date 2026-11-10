class FatigueModel:

    def predict(self, activity_data):

        screen_time = activity_data.get(
            "screen_time",
            0
        )

        idle_time = activity_data.get(
            "idle_time",
            0
        )

        keyboard_count = activity_data.get(
            "keyboard_count",
            0
        )

        mouse_clicks = activity_data.get(
            "mouse_clicks",
            0
        )

        # --------------------------------------
        # Simple MVP fatigue calculation
        # --------------------------------------

        score = 0

        # Long screen usage
        if screen_time >= 3600:
            score += 40

        elif screen_time >= 1800:
            score += 20

        # High idle time
        if idle_time >= 900:
            score += 30

        elif idle_time >= 600:
            score += 15

        # High keyboard activity
        if keyboard_count >= 3000:
            score += 20

        elif keyboard_count >= 1500:
            score += 10

        # High mouse activity
        if mouse_clicks >= 1000:
            score += 10

        elif mouse_clicks >= 500:
            score += 5

        # Limit score
        score = min(score, 100)

        # --------------------------------------
        # Fatigue level
        # --------------------------------------

        if score >= 70:

            level = "High"

        elif score >= 40:

            level = "Medium"

        else:

            level = "Low"

        return {
            "fatigue_score": score,
            "fatigue_level": level
        }