import cv2


class WebcamMonitor:

    def __init__(self):

        self.camera = None
        self.running = False
        self.camera_available = False

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("Webcam monitor is already running.")

            return

        self.camera = cv2.VideoCapture(0)

        if self.camera.isOpened():

            self.camera_available = True
            self.running = True

            print("Webcam detected successfully.")

        else:

            self.camera_available = False
            self.running = False

            print("Webcam not available.")

            self.camera.release()
            self.camera = None

    # ==========================================
    # GET FRAME
    # ==========================================

    def get_frame(self):

        if not self.running:

            return None

        if self.camera is None:

            return None

        ret, frame = self.camera.read()

        if not ret:

            return None

        return frame

    # ==========================================
    # CHECK STATUS
    # ==========================================

    def get_status(self):

        return self.camera_available

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        if self.camera is not None:

            self.camera.release()

            self.camera = None

        self.running = False
        self.camera_available = False

        print("Webcam monitor stopped.")

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.stop()