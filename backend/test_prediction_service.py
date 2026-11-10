from backend.prediction.prediction_service import PredictionService


service = PredictionService()


activity_data = {

    "screen_time": 18000,

    "active_time": 15600,

    "idle_time": 2400,

    "work_duration": 16000,

    "break_duration": 500,

    "keyboard_count": 3500,

    "mouse_clicks": 1100
}


result = service.predict(activity_data)


print("================================")
print("PREDICTION RESULT")
print("================================")

print()

print(
    "Fatigue Score:",
    result["fatigue"]["score"]
)

print(
    "Fatigue Level:",
    result["fatigue"]["level"]
)

print()

print(
    "Burnout Score:",
    result["burnout"]["score"]
)

print(
    "Burnout Level:",
    result["burnout"]["level"]
)

print()
print("================================")