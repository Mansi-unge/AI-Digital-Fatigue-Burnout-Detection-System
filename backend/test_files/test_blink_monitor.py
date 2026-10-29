import cv2

from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.eye_monitor import EyeMonitor
from backend.monitoring.blink_monitor import BlinkMonitor


webcam = WebcamMonitor()
eye_monitor = EyeMonitor()
blink_monitor = BlinkMonitor()


print("Starting webcam...")

webcam.start()

if not webcam.get_status():

    print("Webcam not available.")

    webcam.stop()
    eye_monitor.close()

    exit()


print("Webcam started.")
print("Starting blink monitoring...")
print("Press Q to close.")


blink_monitor.start()


while webcam.camera is not None and webcam.running:

    success, frame = webcam.camera.read()

    if not success:

        print("Failed to read webcam frame.")

        break

    # ==========================================
    # EYE LANDMARKS
    # ==========================================

    frame = eye_monitor.process_frame(frame)

    # ==========================================
    # BLINK PROCESSING
    # ==========================================

    if eye_monitor.is_face_detected():

        left_eye = (
            eye_monitor.get_left_eye_landmarks()
        )

        right_eye = (
            eye_monitor.get_right_eye_landmarks()
        )

        ear = blink_monitor.process(
            left_eye,
            right_eye
        )

    else:

        ear = None

    # ==========================================
    # DISPLAY DATA
    # ==========================================

    blink_count = (
        blink_monitor.get_blink_count()
    )

    blink_rate = (
        blink_monitor.get_blink_rate()
    )

    eye_closure_duration = (
        blink_monitor.get_eye_closure_duration()
    )

    eye_closure_percentage = (
        blink_monitor.get_eye_closure_percentage()
    )

    # ==========================================
    # DISPLAY ON SCREEN
    # ==========================================

    cv2.putText(
        frame,
        f"Blink Count: {blink_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Blink Rate: {blink_rate:.2f}/min",
        (20, 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Eye Closure: {eye_closure_duration:.2f}s",
        (20, 100),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Closure %: {eye_closure_percentage:.2f}%",
        (20, 130),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    if ear is not None:

        cv2.putText(
            frame,
            f"EAR: {ear:.3f}",
            (20, 160),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )

    # ==========================================
    # SHOW WINDOW
    # ==========================================

    cv2.imshow(
        "Blink Monitoring Test",
        frame
    )

    # Press Q
    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

eye_monitor.close()

webcam.stop()

cv2.destroyAllWindows()

print()
print("==============================")
print("BLINK MONITORING RESULTS")
print("==============================")
print(
    "Blink Count:",
    blink_monitor.get_blink_count()
)
print(
    "Blink Rate:",
    f"{blink_monitor.get_blink_rate():.2f}",
    "blinks/min"
)
print(
    "Eye Closure Duration:",
    f"{blink_monitor.get_eye_closure_duration():.2f}",
    "seconds"
)
print(
    "Eye Closure Percentage:",
    f"{blink_monitor.get_eye_closure_percentage():.2f}%"
)
print("==============================")
print("Blink monitoring test completed.")