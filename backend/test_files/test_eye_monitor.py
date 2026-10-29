import cv2

from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.eye_monitor import EyeMonitor


webcam = WebcamMonitor()
eye_monitor = EyeMonitor()

print("Starting webcam...")

webcam.start()

if not webcam.get_status():

    print("Webcam not available.")

    webcam.stop()
    eye_monitor.close()

    exit()


print("Webcam started.")
print("Starting eye landmark detection...")
print("Press Q to close.")


while webcam.camera is not None and webcam.running:

    success, frame = webcam.camera.read()

    if not success:

        print("Failed to read webcam frame.")

        break


    # ==========================================
    # EYE LANDMARK DETECTION
    # ==========================================

    frame = eye_monitor.process_frame(frame)


    # ==========================================
    # DISPLAY STATUS
    # ==========================================

    if eye_monitor.is_face_detected():

        cv2.putText(
            frame,
            "Eyes Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    else:

        cv2.putText(
            frame,
            "Face Not Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )


    cv2.imshow(
        "Eye Landmark Test",
        frame
    )


    if cv2.waitKey(1) & 0xFF == ord("q"):

        break


# ==========================================
# CLEANUP
# ==========================================

eye_monitor.close()

webcam.stop()

cv2.destroyAllWindows()

print("Eye landmark test completed.")
