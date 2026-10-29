from backend.prediction.fatigue_model import FatigueModel


model = FatigueModel()


activity_data = {

    "screen_time": 2400,

    "idle_time": 300,

    "keyboard_count": 2000,

    "mouse_clicks": 600
}


result = model.predict(activity_data)


print("================================")
print("FATIGUE PREDICTION")
print("================================")

print(
    "Fatigue Score:",
    result["fatigue_score"]
)

print(
    "Fatigue Level:",
    result["fatigue_level"]
)

print("================================")