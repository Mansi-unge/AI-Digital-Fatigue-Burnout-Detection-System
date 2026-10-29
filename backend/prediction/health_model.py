class HealthModel:

    def predict(self, activity_data):

        screen_time = activity_data.get("screen_time", 0)
        idle_time = activity_data.get("idle_time", 0)
        application_switches = activity_data.get(
            "application_switches", 0
        )
        eye_closure = activity_data.get("eye_closure", 0)
        yawn_count = activity_data.get("yawn_count", 0)
        blink_rate = activity_data.get("blink_rate", 0)

        # ==========================================
        # START WITH PERFECT HEALTH
        # ==========================================

        score = 100

        # ==========================================
        # EYE CLOSURE
        # ==========================================

        if eye_closure > 40:
            score -= 25
        elif eye_closure > 20:
            score -= 12

        # ==========================================
        # YAWNING
        # ==========================================

        if yawn_count > 5:
            score -= 20
        elif yawn_count > 2:
            score -= 10

        # ==========================================
        # BLINK RATE
        # ==========================================

        if 0 < blink_rate < 10:
            score -= 10

        # ==========================================
        # IDLE TIME / SCREEN TIME
        # ==========================================

        idle_ratio = (
            idle_time / screen_time
            if screen_time > 0
            else 0
        )

        if idle_ratio > 0.5:
            score -= 15
        elif idle_ratio > 0.3:
            score -= 7

        # ==========================================
        # APPLICATION SWITCHING
        # ==========================================

        if application_switches > 10:
            score -= 5

        # ==========================================
        # KEEP SCORE BETWEEN 0 AND 100
        # ==========================================

        score = max(0, min(100, round(score)))

        # ==========================================
        # HEALTH LEVEL
        # ==========================================

        if score >= 80:
            level = "Good"
        elif score >= 60:
            level = "Moderate"
        else:
            level = "Poor"

        return {
            "health_score": score,
            "health_level": level
        }