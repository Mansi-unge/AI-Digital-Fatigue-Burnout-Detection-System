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

        keyboard_count = activity_data.get(
            "keyboard_count",
            0
        )

        mouse_clicks = activity_data.get(
            "mouse_clicks",
            0
        )

        application_switches = activity_data.get(
            "application_switches",
            0
        )

        blink_rate = activity_data.get(
            "blink_rate",
            0
        )

        eye_closure = activity_data.get(
            "eye_closure",
            0
        )

        yawn_count = activity_data.get(
            "yawn_count",
            0
        )

        # ==========================================
        # BURNOUT SCORE
        # ==========================================

        score = 0

        # ------------------------------------------
        # LONG SCREEN TIME
        # ------------------------------------------

        if screen_time >= 21600:
            score += 30

        elif screen_time >= 14400:
            score += 20

        elif screen_time >= 7200:
            score += 10

        # ------------------------------------------
        # HIGH IDLE TIME
        # ------------------------------------------

        if idle_time >= 3600:
            score += 20

        elif idle_time >= 1800:
            score += 10

        # ------------------------------------------
        # LOW ACTIVE / HIGH IDLE RATIO
        # ------------------------------------------

        total_time = active_time + idle_time

        if total_time > 0:

            idle_ratio = idle_time / total_time

            if idle_ratio >= 0.60:
                score += 15

            elif idle_ratio >= 0.40:
                score += 8

        # ------------------------------------------
        # HIGH KEYBOARD ACTIVITY
        # ------------------------------------------

        if keyboard_count >= 5000:
            score += 10

        elif keyboard_count >= 3000:
            score += 5

        # ------------------------------------------
        # HIGH MOUSE ACTIVITY
        # ------------------------------------------

        if mouse_clicks >= 1500:
            score += 10

        elif mouse_clicks >= 1000:
            score += 5

        # ------------------------------------------
        # MANY APPLICATION SWITCHES
        # ------------------------------------------

        if application_switches >= 100:
            score += 10

        elif application_switches >= 50:
            score += 5

        # ------------------------------------------
        # EYE CLOSURE
        # ------------------------------------------

        if eye_closure >= 60:
            score += 10

        elif eye_closure >= 30:
            score += 5

        # ------------------------------------------
        # YAWNING
        # ------------------------------------------

        if yawn_count >= 10:
            score += 10

        elif yawn_count >= 5:
            score += 5

        # ------------------------------------------
        # LOW BLINK RATE
        # ------------------------------------------

        if 0 < blink_rate < 8:
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
        # RETURN
        # ==========================================

        return {
            "burnout_score": score,
            "burnout_level": level
        }