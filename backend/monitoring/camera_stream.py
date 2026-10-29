import cv2
import threading


class CameraStream:

    def __init__(self):

        self.camera = None

        self.running = False

        self.latest_frame = None

        self.frame_lock = threading.Lock()

    # ==========================================================
    # START
    # ==========================================================

    def start(self):

        if self.running:
            return

        self.camera = cv2.VideoCapture(0)

        if not self.camera.isOpened():

            self.camera.release()

            self.camera = None

            raise RuntimeError(
                "Unable to open webcam."
            )

        self.running = True

        print("==============================")
        print("CAMERA STREAM STARTED")
        print("==============================")

    # ==========================================================
    # READ FRAME
    # ==========================================================

    def read_frame(self):

        if (
            self.camera is None
            or not self.running
        ):

            return None

        success, frame = (
            self.camera.read()
        )

        if not success:

            return None

        with self.frame_lock:

            self.latest_frame = (
                frame.copy()
            )

        return frame

    # ==========================================================
    # GET LATEST FRAME
    # ==========================================================

    def get_latest_frame(self):

        with self.frame_lock:

            if self.latest_frame is None:

                return None

            return self.latest_frame.copy()

    # ==========================================================
    # STATUS
    # ==========================================================

    def is_running(self):

        return self.running

    # ==========================================================
    # STOP
    # ==========================================================

    def stop(self):

        self.running = False

        if self.camera is not None:

            self.camera.release()

            self.camera = None

        with self.frame_lock:

            self.latest_frame = None

        print("==============================")
        print("CAMERA STREAM STOPPED")
        print("==============================")