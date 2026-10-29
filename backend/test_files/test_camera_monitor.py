import cv2

from backend.monitoring.camera_monitor import CameraMonitor


def main():

    # ==========================================
    # CAMERA
    # ==========================================

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():

        print("ERROR: Could not open webcam.")

        return

    # ==========================================
    # CAMERA MONITOR
    # ==========================================

    monitor = CameraMonitor()

    monitor.start()

    print()
    print("==============================")
    print("CAMERA TEST")
    print("==============================")
    print("Press Q to quit.")
    print()

    try:

        while True:

            ret, frame = cap.read()

            if not ret:

                print("ERROR: Could not read frame.")

                break

            # ==================================
            # PROCESS CAMERA
            # ==================================

            camera_data = (
                monitor.process_frame(frame)
            )

            # ==================================
            # DISPLAY DATA
            # ==================================

            cv2.putText(
                frame,
                f"Blink Rate: {camera_data['blink_rate']}",
                (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Eye Closure: {camera_data['eye_closure']} sec",
                (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Yawns: {camera_data['yawn_count']}",
                (20, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Head Pose: {camera_data['head_pose']}",
                (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            # ==================================
            # PRINT DATA
            # ==================================

            print(
                f"Blink Rate: "
                f"{camera_data['blink_rate']:.2f} | "
                f"Eye Closure: "
                f"{camera_data['eye_closure']:.2f}s | "
                f"Yawns: "
                f"{camera_data['yawn_count']} | "
                f"Head Pose: "
                f"{camera_data['head_pose']}"
            )

            # ==================================
            # SHOW CAMERA
            # ==================================

            cv2.imshow(
                "Camera Monitoring",
                frame
            )

            # ==================================
            # QUIT
            # ==================================

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):

                break

    finally:

        monitor.close()

        cap.release()

        cv2.destroyAllWindows()


if __name__ == "__main__":

    main()