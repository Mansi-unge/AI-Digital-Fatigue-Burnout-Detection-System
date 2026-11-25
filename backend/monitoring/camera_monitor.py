from backend.monitoring.eye_monitor import EyeMonitor
from backend.monitoring.blink_monitor import BlinkMonitor
from backend.monitoring.yawn_monitor import YawnMonitor
from backend.monitoring.head_pose import HeadPoseMonitor


class CameraMonitor:

    def __init__(self):

        # ==========================================
        # EYE / FACE LANDMARK MONITOR
        # ==========================================

        self.eye_monitor = EyeMonitor()

        # ==========================================
        # BLINK MONITOR
        # ==========================================

        self.blink_monitor = BlinkMonitor()

        # ==========================================
        # YAWN MONITOR
        # ==========================================

        self.yawn_monitor = YawnMonitor()

        # ==========================================
        # HEAD POSE MONITOR
        # ==========================================

        self.head_pose_monitor = HeadPoseMonitor()

        # ==========================================
        # MONITORING STATUS
        # ==========================================

        self.monitoring_started = False

    # ==========================================
    # START MONITORING
    # ==========================================

    def start(self):

        # ------------------------------------------
        # RECREATE EYE MONITOR IF PREVIOUSLY CLOSED
        # ------------------------------------------

        if self.eye_monitor is None:
            self.eye_monitor = EyeMonitor()

        # ------------------------------------------
        # START CAMERA MONITOR
        # ------------------------------------------

        if not self.monitoring_started:

            self.blink_monitor.start()

            self.monitoring_started = True

            print()
            print("==============================")
            print("CAMERA MONITOR STARTED")
            print("==============================")
            print()

    # ==========================================
    # PROCESS FRAME
    # ==========================================

    def process_frame(self, frame):

        # IMPORTANT:
        # Do NOT automatically start the camera here.
        #
        # Camera ON/OFF is controlled by MonitorManager.
        # This prevents a stray frame from restarting
        # a camera that the user intentionally turned OFF.

        if not self.monitoring_started:

            return self._get_camera_data()

        # ==========================================
        # FRAME SIZE
        # ==========================================

        height, width, _ = frame.shape

        # ==========================================
        # PROCESS FACE LANDMARKS
        # ==========================================

        frame = self.eye_monitor.process_frame(frame)

        # ==========================================
        # FACE DETECTION
        # ==========================================

        face_detected = (
            self.eye_monitor.is_face_detected()
        )

        # ==========================================
        # IF NO FACE
        # ==========================================

        if not face_detected:

            return self._get_camera_data()

        # ==========================================
        # GET LANDMARKS
        # ==========================================

        left_eye_landmarks = (
            self.eye_monitor.get_left_eye_landmarks()
        )

        right_eye_landmarks = (
            self.eye_monitor.get_right_eye_landmarks()
        )

        mouth_landmarks = (
            self.eye_monitor.get_mouth_landmarks()
        )

        face_landmarks = (
            self.eye_monitor.get_face_landmarks()
        )

        # ==========================================
        # BLINK MONITOR
        # ==========================================

        self.blink_monitor.process(
            left_eye_landmarks,
            right_eye_landmarks
        )

        # ==========================================
        # YAWN MONITOR
        # ==========================================

        self.yawn_monitor.process(
            mouth_landmarks
        )

        # ==========================================
        # HEAD POSE MONITOR
        # ==========================================

        self.head_pose_monitor.process(
            face_landmarks,
            width,
            height
        )

        # ==========================================
        # RETURN COMBINED DATA
        # ==========================================

        return self._get_camera_data()

    # ==========================================
    # COMBINE CAMERA DATA
    # ==========================================

    def _get_camera_data(self):

        blink_rate = (
            self.blink_monitor.get_blink_rate()
        )

        eye_closure = (
            self.blink_monitor.get_eye_closure_percentage()
        )

        yawn_count = (
            self.yawn_monitor.get_yawn_count()
        )

        head_pose = (
            self.head_pose_monitor.get_head_pose()
        )

        return {

            "blink_rate": round(
                blink_rate,
                2
            ),

            "eye_closure": round(
                eye_closure,
                2
            ),

            "yawn_count": yawn_count,

            "head_pose": head_pose
        }

    # ==========================================
    # GET BLINK COUNT
    # ==========================================

    def get_blink_count(self):

        return (
            self.blink_monitor.get_blink_count()
        )

    # ==========================================
    # GET BLINK RATE
    # ==========================================

    def get_blink_rate(self):

        return (
            self.blink_monitor.get_blink_rate()
        )

    # ==========================================
    # GET EYE CLOSURE
    # ==========================================

    def get_eye_closure(self):

        return (
            self.blink_monitor.get_eye_closure_duration()
        )

    # ==========================================
    # GET YAWN COUNT
    # ==========================================

    def get_yawn_count(self):

        return (
            self.yawn_monitor.get_yawn_count()
        )

    # ==========================================
    # GET HEAD POSE
    # ==========================================

    def get_head_pose(self):

        return (
            self.head_pose_monitor.get_head_pose()
        )

    # ==========================================
    # GET HEAD POSE VALUES
    # ==========================================

    def get_yaw(self):

        return (
            self.head_pose_monitor.get_yaw()
        )

    def get_pitch(self):

        return (
            self.head_pose_monitor.get_pitch()
        )

    def get_roll(self):

        return (
            self.head_pose_monitor.get_roll()
        )

    # ==========================================
    # GET ALL DATA
    # ==========================================

    def get_data(self):

        return self._get_camera_data()

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.blink_monitor.reset()

        self.yawn_monitor.reset()

        self.head_pose_monitor.reset()

        self.monitoring_started = False

    # ==========================================
    # CLOSE
    # ==========================================

    def close(self):

        if self.eye_monitor is not None:

            self.eye_monitor.close()

            self.eye_monitor = None