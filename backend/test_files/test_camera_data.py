from backend.monitoring.camera_data import CameraDataCollector


# ==========================================
# CREATE CAMERA DATA COLLECTOR
# ==========================================

camera_data = CameraDataCollector()


# ==========================================
# SAMPLE CAMERA VALUES
# ==========================================

blink_rate = 18

eye_closure = 7.2

yawn_count = 3

head_pose = "DOWN"


# ==========================================
# COMBINE CAMERA DATA
# ==========================================

camera_data.update(
    blink_rate=blink_rate,
    eye_closure=eye_closure,
    yawn_count=yawn_count,
    head_pose=head_pose
)


# ==========================================
# GET FINAL DATA
# ==========================================

data = camera_data.get_data()


# ==========================================
# DISPLAY
# ==========================================

print()
print("==============================")
print("CAMERA DATA")
print("==============================")

print(
    "Blink Rate   :",
    data["blink_rate"]
)

print(
    "Eye Closure  :",
    data["eye_closure"]
)

print(
    "Yawn Count   :",
    data["yawn_count"]
)

print(
    "Head Pose    :",
    data["head_pose"]
)

print("==============================")

print()
print("FINAL CAMERA OBJECT")
print("==============================")

print(data)

print("==============================")