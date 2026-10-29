import cv2

from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.eye_monitor import EyeMonitor
from backend.monitoring.yawn_monitor import YawnMonitor


webcam = WebcamMonitor()
landmark_monitor = EyeMonitor()
yawn_monitor = YawnMonitor()


print("Starting webcam...")

webcam.start()

if not webcam.get_status():

    print("Webcam not available.")

    webcam.stop()
    landmark_monitor.close()

    exit()


print("Webcam started.")
print("Starting yawn detection...")
print("Open your mouth for at least a second to test.")
print("Press Q to close.")


while webcam.camera is not None and webcam.running:

    success, frame = webcam.camera.read()

    if not success:

        print("Failed to read webcam frame.")

        break

    # ==========================================
    # FACE LANDMARKS
    # ==========================================

    frame = landmark_monitor.process_frame(frame)

    # ==========================================
    # YAWN DETECTION
    # ==========================================

    if landmark_monitor.is_face_detected():

        mouth_landmarks = (
            landmark_monitor.get_mouth_landmarks()
        )

        mouth_ratio = yawn_monitor.process(
            mouth_landmarks
        )

    else:

        mouth_ratio = None

    # ==========================================
    # GET YAWN COUNT
    # ==========================================

    yawn_count = (
        yawn_monitor.get_yawn_count()
    )

    # ==========================================
    # DISPLAY
    # ==========================================

    cv2.putText(
        frame,
        f"Yawn Count: {yawn_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    if mouth_ratio is not None:

        cv2.putText(
            frame,
            f"Mouth Opening: {mouth_ratio:.3f}",
            (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 0),
            2
        )

    # ==========================================
    # SHOW VIDEO
    # ==========================================

    cv2.imshow(
        "Yawn Detection Test",
        frame
    )

    # Press Q
    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

landmark_monitor.close()

webcam.stop()

cv2.destroyAllWindows()


print()
print("==============================")
print("YAWN MONITORING RESULTS")
print("==============================")
print(
    "Yawn Count:",
    yawn_monitor.get_yawn_count()
)
print("==============================")
print("Yawn monitoring test completed.")