class BurnoutModel:

    def predict(self, activity_data):

        screen_time = activity_data.get(
            "screen_time",
            0
        )

        idle_time = activity_data.get(
            "idle_time",
            0
        )

        active_time = activity_data.get(
            "active_time",
            0
        )

        work_duration = activity_data.get(
            "work_duration",
            0
        )

        break_duration = activity_data.get(
            "break_duration",
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

        # ==========================================
        # BURNOUT SCORE
        # ==========================================

        score = 0

        # Long screen time
        if screen_time >= 21600:       # 6 hours
            score += 30

        elif screen_time >= 14400:     # 4 hours
            score += 20

        elif screen_time >= 7200:      # 2 hours
            score += 10

        # Long work duration
        if work_duration >= 21600:

            score += 25

        elif work_duration >= 14400:

            score += 15

        elif work_duration >= 7200:

            score += 10

        # High idle time
        if idle_time >= 3600:

            score += 20

        elif idle_time >= 1800:

            score += 10

        # Very little break time
        if work_duration > 0:

            break_ratio = (
                break_duration / work_duration
            )

            if break_ratio < 0.05:

                score += 15

            elif break_ratio < 0.10:

                score += 10

        # High keyboard activity
        if keyboard_count >= 5000:

            score += 10

        elif keyboard_count >= 3000:

            score += 5

        # High mouse activity
        if mouse_clicks >= 1500:

            score += 10

        elif mouse_clicks >= 1000:

            score += 5

        # ==========================================
        # LIMIT SCORE
        # ==========================================

        score = min(score, 100)

        # ==========================================
        # BURNOUT LEVEL
        # ==========================================

        if score >= 70:

            level = "High"

        elif score >= 40:

            level = "Medium"

        else:

            level = "Low"

        # ==========================================
        # RETURN RESULT
        # ==========================================

        return {

            "burnout_score": score,

            "burnout_level": level
        }