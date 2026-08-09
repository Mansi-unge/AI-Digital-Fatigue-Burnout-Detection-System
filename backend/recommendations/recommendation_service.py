class RecommendationService:

    def generate_recommendations(self, data):

        recommendations = []

        # ==========================================
        # FATIGUE
        # ==========================================

        fatigue_score = data.get(
            "fatigue_score",
            0
        )

        if fatigue_score >= 70:

            recommendations.append({
                "type": "Fatigue",
                "priority": "High",
                "message": (
                    "Take a break and reduce continuous "
                    "screen usage."
                )
            })

        elif fatigue_score >= 40:

            recommendations.append({
                "type": "Fatigue",
                "priority": "Medium",
                "message": (
                    "Consider taking a short break "
                    "before continuing work."
                )
            })

        # ==========================================
        # BURNOUT
        # ==========================================

        burnout_score = data.get(
            "burnout_score",
            0
        )

        if burnout_score >= 70:

            recommendations.append({
                "type": "Burnout",
                "priority": "High",
                "message": (
                    "Your workload appears high. "
                    "Take regular breaks and avoid "
                    "extended continuous work."
                )
            })

        elif burnout_score >= 40:

            recommendations.append({
                "type": "Burnout",
                "priority": "Medium",
                "message": (
                    "Maintain a healthy balance between "
                    "work time and break time."
                )
            })

        # ==========================================
        # SCREEN TIME
        # ==========================================

        screen_time = data.get(
            "screen_time",
            0
        )

        if screen_time >= 21600:

            recommendations.append({
                "type": "Screen Time",
                "priority": "High",
                "message": (
                    "Screen time is high. Take regular "
                    "screen breaks."
                )
            })

        elif screen_time >= 14400:

            recommendations.append({
                "type": "Screen Time",
                "priority": "Medium",
                "message": (
                    "Consider following a regular "
                    "screen-break schedule."
                )
            })

        # ==========================================
        # IDLE TIME
        # ==========================================

        idle_time = data.get(
            "idle_time",
            0
        )

        if idle_time >= 3600:

            recommendations.append({
                "type": "Idle Time",
                "priority": "Medium",
                "message": (
                    "There is significant inactive time. "
                    "Consider reviewing your work pattern."
                )
            })

        # ==========================================
        # WORK / BREAK BALANCE
        # ==========================================

        work_duration = data.get(
            "work_duration",
            0
        )

        break_duration = data.get(
            "break_duration",
            0
        )

        if work_duration > 0:

            break_ratio = (
                break_duration /
                work_duration
            )

            if break_ratio < 0.05:

                recommendations.append({
                    "type": "Break",
                    "priority": "High",
                    "message": (
                        "Your break time is very low "
                        "compared with your work duration. "
                        "Take regular breaks."
                    )
                })

            elif break_ratio < 0.10:

                recommendations.append({
                    "type": "Break",
                    "priority": "Medium",
                    "message": (
                        "Try increasing your break time "
                        "during long work sessions."
                    )
                })

        # ==========================================
        # NO PROBLEMS DETECTED
        # ==========================================

        if not recommendations:

            recommendations.append({
                "type": "General",
                "priority": "Low",
                "message": (
                    "Your current activity pattern "
                    "looks normal. Keep maintaining "
                    "healthy work habits."
                )
            })

        return recommendations