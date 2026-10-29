import cv2

from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.eye_monitor import EyeMonitor
from backend.monitoring.head_pose import HeadPoseMonitor


# ==========================================
# CREATE MONITORS
# ==========================================

webcam = WebcamMonitor()

landmark_monitor = EyeMonitor()

head_pose_monitor = HeadPoseMonitor()


# ==========================================
# START WEBCAM
# ==========================================

print("Starting webcam...")

webcam.start()

if not webcam.get_status():

    print("Webcam not available.")

    landmark_monitor.close()

    webcam.stop()

    exit()


print("Webcam started.")

print()
print("==============================")
print("HEAD POSE TEST")
print("==============================")
print()
print("Face camera       -> NORMAL")
print("Turn head LEFT    -> LEFT")
print("Turn head RIGHT   -> RIGHT")
print("Look UP           -> UP")
print("Look DOWN         -> DOWN")
print()
print("Do NOT tilt your head")
print("toward your shoulder.")
print()
print("Press Q to stop.")
print("==============================")


# ==========================================
# CAMERA LOOP
# ==========================================

while (
    webcam.camera is not None
    and webcam.running
):

    success, frame = webcam.camera.read()

    if not success:

        print("Failed to read webcam frame.")

        break

    # ==========================================
    # FACE LANDMARKS
    # ==========================================

    frame = landmark_monitor.process_frame(
        frame
    )

    # ==========================================
    # FRAME SIZE
    # ==========================================

    height, width, _ = frame.shape

    # ==========================================
    # HEAD POSE
    # ==========================================

    if landmark_monitor.is_face_detected():

        face_landmarks = (
            landmark_monitor.get_face_landmarks()
        )

        pose = head_pose_monitor.process(
            face_landmarks,
            width,
            height
        )

        face_status = "FACE DETECTED"

    else:

        pose = "NO FACE"

        face_status = "FACE LOST"

    # ==========================================
    # GET ANGLES
    # ==========================================

    pitch = head_pose_monitor.get_pitch()

    yaw = head_pose_monitor.get_yaw()

    roll = head_pose_monitor.get_roll()

    # ==========================================
    # DISPLAY FACE STATUS
    # ==========================================

    cv2.putText(
        frame,
        face_status,
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 0),
        2
    )

    # ==========================================
    # DISPLAY HEAD POSE
    # ==========================================

    cv2.putText(
        frame,
        f"Head Pose: {pose}",
        (20, 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    # ==========================================
    # DISPLAY PITCH
    # ==========================================

    cv2.putText(
        frame,
        f"Pitch: {pitch:.1f}",
        (20, 105),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 0),
        2
    )

    # ==========================================
    # DISPLAY YAW
    # ==========================================

    cv2.putText(
        frame,
        f"Yaw: {yaw:.1f}",
        (20, 135),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 0),
        2
    )

    # ==========================================
    # DISPLAY ROLL
    # ==========================================

    cv2.putText(
        frame,
        f"Roll: {roll:.1f}",
        (20, 165),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 0),
        2
    )

    # ==========================================
    # SHOW CAMERA
    # ==========================================

    cv2.imshow(
        "Head Pose Detection",
        frame
    )

    # ==========================================
    # PRESS Q
    # ==========================================

    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

landmark_monitor.close()

webcam.stop()

cv2.destroyAllWindows()


# ==========================================
# FINAL RESULT
# ==========================================

print()

print("==============================")
print("HEAD POSE TEST COMPLETED")
print("==============================")

print(
    "Final Head Pose:",
    head_pose_monitor.get_head_pose()
)

print(
    "Pitch:",
    round(
        head_pose_monitor.get_pitch(),
        2
    )
)

print(
    "Yaw:",
    round(
        head_pose_monitor.get_yaw(),
        2
    )
)

print(
    "Roll:",
    round(
        head_pose_monitor.get_roll(),
        2
    )
)

print("==============================")