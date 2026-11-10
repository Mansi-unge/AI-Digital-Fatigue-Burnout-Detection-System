from backend.recommendations.recommendation_service import (
    RecommendationService
)


service = RecommendationService()


data = {

    "fatigue_score": 75,

    "burnout_score": 80,

    "screen_time": 18000,

    "idle_time": 2400,

    "work_duration": 16000,

    "break_duration": 500
}


recommendations = (
    service.generate_recommendations(data)
)


print("================================")
print("RECOMMENDATIONS")
print("================================")


for recommendation in recommendations:

    print()
    print(
        "Type:",
        recommendation["type"]
    )

    print(
        "Priority:",
        recommendation["priority"]
    )

    print(
        "Message:",
        recommendation["message"]
    )


print()
print("================================")