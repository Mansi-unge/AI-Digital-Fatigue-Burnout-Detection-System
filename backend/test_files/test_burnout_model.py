from backend.prediction.burnout_model import BurnoutModel


model = BurnoutModel()


activity_data = {

    "screen_time": 18000,

    "idle_time": 2400,

    "active_time": 15600,

    "work_duration": 16000,

    "break_duration": 500,

    "keyboard_count": 3500,

    "mouse_clicks": 1100
}


result = model.predict(activity_data)


print("================================")
print("BURNOUT PREDICTION")
print("================================")

print(
    "Burnout Score:",
    result["burnout_score"]
)

print(
    "Burnout Level:",
    result["burnout_level"]
)

print("================================")