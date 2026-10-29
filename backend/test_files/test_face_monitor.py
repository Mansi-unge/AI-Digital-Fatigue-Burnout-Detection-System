import cv2

from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.face_monitor import FaceMonitor


webcam = WebcamMonitor()
face_monitor = FaceMonitor()

print("Starting webcam...")

webcam.start()

if not webcam.get_status():

    print("Webcam not available.")

    webcam.stop()
    face_monitor.close()

    exit()


print("Webcam started.")
print("Starting face detection...")
print("Press Q to close.")


while True:

    success, frame = webcam.camera.read()

    if not success:

        print("Failed to read webcam frame.")

        break

    # ==========================================
    # FACE DETECTION
    # ==========================================

    frame = face_monitor.process_frame(frame)

    # ==========================================
    # DISPLAY STATUS
    # ==========================================

    if face_monitor.is_face_detected():

        cv2.putText(
            frame,
            "Face Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    else:

        cv2.putText(
            frame,
            "No Face Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

    # ==========================================
    # SHOW WEBCAM
    # ==========================================

    cv2.imshow("Face Detection Test", frame)

    # Press Q to exit
    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

face_monitor.close()
webcam.stop()

cv2.destroyAllWindows()

print("Face detection test completed.")