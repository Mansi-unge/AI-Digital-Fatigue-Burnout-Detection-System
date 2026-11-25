
from backend.database.database import SessionLocal
from backend.database.models.recommendations import Recommendation
from backend.database.models.notification import Notification


class RecommendationService:

    def generate_recommendations(self, prediction_data, user_id):

        recommendations = []

        prediction = prediction_data.get("prediction", {})
        features = prediction_data.get("features", {})

        # FATIGUE
        fatigue_score = prediction.get("fatigue", {}).get("score", 0)

        if fatigue_score >= 70:
            recommendations.append({
                "type": "Fatigue",
                "priority": "High",
                "message": (
                    "Your fatigue level is high. "
                    "Take a break and reduce continuous "
                    "screen usage."
                )
            })

        elif fatigue_score >= 40:
            recommendations.append({
                "type": "Fatigue",
                "priority": "Medium",
                "message": (
                    "Your fatigue level is elevated. "
                    "Consider taking a short break "
                    "before continuing work."
                )
            })

        # BURNOUT
        burnout_score = prediction.get("burnout", {}).get("score", 0)

        if burnout_score >= 70:
            recommendations.append({
                "type": "Burnout",
                "priority": "High",
                "message": (
                    "Your burnout risk is high. "
                    "Take regular breaks and avoid "
                    "extended continuous work."
                )
            })

        elif burnout_score >= 40:
            recommendations.append({
                "type": "Burnout",
                "priority": "Medium",
                "message": (
                    "Your burnout risk is elevated. "
                    "Maintain a healthy balance between "
                    "work time and break time."
                )
            })

        # HEALTH
        health_score = prediction.get("health", {}).get("score", 100)

        if health_score < 60:
            recommendations.append({
                "type": "Health",
                "priority": "High",
                "message": (
                    "Your current health score is low. "
                    "Consider taking a break and "
                    "improving your work-rest balance."
                )
            })

        elif health_score < 80:
            recommendations.append({
                "type": "Health",
                "priority": "Medium",
                "message": (
                    "Your health score is moderate. "
                    "Consider taking regular breaks "
                    "during your work session."
                )
            })

        # SCREEN TIME
        screen_time = features.get("screen_time", 0)

        if screen_time >= 21600:
            recommendations.append({
                "type": "Screen Time",
                "priority": "High",
                "message": (
                    "Your screen time is very high. "
                    "Take regular screen breaks."
                )
            })

        elif screen_time >= 14400:
            recommendations.append({
                "type": "Screen Time",
                "priority": "Medium",
                "message": (
                    "Your screen time is increasing. "
                    "Consider following a regular "
                    "screen-break schedule."
                )
            })

        # IDLE TIME
        idle_time = features.get("idle_time", 0)

        if idle_time >= 3600:
            recommendations.append({
                "type": "Idle Time",
                "priority": "Medium",
                "message": (
                    "There is significant inactive time. "
                    "Consider reviewing your work pattern."
                )
            })

        # WORK / BREAK BALANCE
        work_duration = features.get("work_duration", 0)
        break_duration = features.get("break_duration", 0)

        if work_duration > 0:
            break_ratio = break_duration / work_duration

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

        # GENERAL
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

        db = SessionLocal()

        try:
            # Fetch active recommendations once.
            existing_rows = (
                db.query(Recommendation)
                .filter(
                    Recommendation.user_id == user_id,
                    Recommendation.is_completed.is_(False)
                )
                .all()
            )

            existing_map = {
                (row.category, row.description): row
                for row in existing_rows
            }

            saved_recommendations = []

            for item in recommendations:

                recommendation_type = item["type"]
                priority = item["priority"]
                message = item["message"]

                key = (recommendation_type, message)

                existing = existing_map.get(key)

                if existing:
                    saved_recommendations.append({
                        "id": existing.id,
                        "type": existing.category,
                        "priority": existing.priority,
                        "message": existing.description
                    })
                    continue

                title = f"{recommendation_type} Recommendation"

                new_recommendation = Recommendation(
                    user_id=user_id,
                    title=title,
                    description=message,
                    category=recommendation_type,
                    priority=priority,
                    is_completed=False
                )

                db.add(new_recommendation)
                db.flush()

                new_notification = Notification(
                    user_id=user_id,
                    recommendation_id=new_recommendation.id,
                    title=title,
                    message=message,
                    type=recommendation_type,
                    priority=priority,
                    is_seen=False
                )

                db.add(new_notification)

                saved_recommendations.append({
                    "id": new_recommendation.id,
                    "type": recommendation_type,
                    "priority": priority,
                    "message": message
                })

                # Prevent duplicate additions within this same call.
                existing_map[key] = new_recommendation

            db.commit()

            return saved_recommendations

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()
