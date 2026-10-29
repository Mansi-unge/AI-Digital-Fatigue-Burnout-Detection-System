import cv2
import mediapipe as mp
from pathlib import Path


class EyeMonitor:

    def __init__(self):

        # ==========================================
        # FIND PROJECT ROOT
        # ==========================================

        project_root = Path(__file__).resolve().parents[2]

        # ==========================================
        # FACE LANDMARKER MODEL
        # ==========================================

        self.model_path = (
            project_root
            / "models"
            / "face_landmarker.task"
        )

        # ==========================================
        # CHECK MODEL
        # ==========================================

        if not self.model_path.exists():

            raise FileNotFoundError(
                f"Face Landmarker model not found:\n"
                f"{self.model_path}\n\n"
                f"Please place face_landmarker.task "
                f"inside the models folder."
            )

        # ==========================================
        # MEDIAPIPE TASKS
        # ==========================================

        BaseOptions = mp.tasks.BaseOptions

        FaceLandmarker = (
            mp.tasks.vision.FaceLandmarker
        )

        FaceLandmarkerOptions = (
            mp.tasks.vision.FaceLandmarkerOptions
        )

        RunningMode = (
            mp.tasks.vision.RunningMode
        )

        # ==========================================
        # OPTIONS
        # ==========================================

        options = FaceLandmarkerOptions(

            base_options=BaseOptions(
                model_asset_path=str(
                    self.model_path
                )
            ),

            running_mode=RunningMode.VIDEO,

            num_faces=1,

            # Lower values make tracking
            # more tolerant during head movement.

            min_face_detection_confidence=0.3,

            min_face_presence_confidence=0.3,

            min_tracking_confidence=0.3,

            output_face_blendshapes=False,

            output_facial_transformation_matrixes=False
        )

        # ==========================================
        # CREATE FACE LANDMARKER
        # ==========================================

        self.face_landmarker = (
            FaceLandmarker.create_from_options(
                options
            )
        )

        # ==========================================
        # LANDMARK STORAGE
        # ==========================================

        self.left_eye_landmarks = []

        self.right_eye_landmarks = []

        self.mouth_landmarks = []

        self.face_landmarks = []

        self.face_detected = False

        # ==========================================
        # TIMESTAMP
        # ==========================================

        self.timestamp_ms = 0

    # ==========================================
    # PROCESS FRAME
    # ==========================================

    def process_frame(self, frame):

        # ==========================================
        # RESET CURRENT FRAME VALUES
        # ==========================================

        self.left_eye_landmarks = []

        self.right_eye_landmarks = []

        self.mouth_landmarks = []

        self.face_landmarks = []

        self.face_detected = False

        # ==========================================
        # FRAME SIZE
        # ==========================================

        height, width, _ = frame.shape

        # ==========================================
        # BGR → RGB
        # ==========================================

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # ==========================================
        # MEDIAPIPE IMAGE
        # ==========================================

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # ==========================================
        # TIMESTAMP
        # ==========================================

        self.timestamp_ms += 33

        # ==========================================
        # FACE LANDMARK DETECTION
        # ==========================================

        results = (
            self.face_landmarker.detect_for_video(
                mp_image,
                self.timestamp_ms
            )
        )

        # ==========================================
        # FACE CHECK
        # ==========================================

        if not results.face_landmarks:

            return frame

        # ==========================================
        # FIRST FACE
        # ==========================================

        face_landmarks = (
            results.face_landmarks[0]
        )

        self.face_landmarks = face_landmarks

        self.face_detected = True

        # ==========================================
        # LEFT EYE INDICES
        # ==========================================

        left_eye_indices = [
            33,
            160,
            158,
            133,
            153,
            144
        ]

        # ==========================================
        # RIGHT EYE INDICES
        # ==========================================

        right_eye_indices = [
            362,
            385,
            387,
            263,
            373,
            380
        ]

        # ==========================================
        # MOUTH INDICES
        # ==========================================

        mouth_indices = [
            13,
            14,
            78,
            308
        ]

        # ==========================================
        # LEFT EYE LANDMARKS
        # ==========================================

        for index in left_eye_indices:

            landmark = face_landmarks[index]

            x = int(
                landmark.x * width
            )

            y = int(
                landmark.y * height
            )

            self.left_eye_landmarks.append(
                (x, y)
            )

            cv2.circle(
                frame,
                (x, y),
                4,
                (0, 255, 0),
                -1
            )

        # ==========================================
        # RIGHT EYE LANDMARKS
        # ==========================================

        for index in right_eye_indices:

            landmark = face_landmarks[index]

            x = int(
                landmark.x * width
            )

            y = int(
                landmark.y * height
            )

            self.right_eye_landmarks.append(
                (x, y)
            )

            cv2.circle(
                frame,
                (x, y),
                4,
                (0, 255, 0),
                -1
            )

        # ==========================================
        # MOUTH LANDMARKS
        # ==========================================

        for index in mouth_indices:

            landmark = face_landmarks[index]

            x = int(
                landmark.x * width
            )

            y = int(
                landmark.y * height
            )

            self.mouth_landmarks.append(
                (x, y)
            )

            cv2.circle(
                frame,
                (x, y),
                4,
                (255, 0, 0),
                -1
            )

        return frame

    # ==========================================
    # FACE DETECTION STATUS
    # ==========================================

    def is_face_detected(self):

        return self.face_detected

    # ==========================================
    # LEFT EYE LANDMARKS
    # ==========================================

    def get_left_eye_landmarks(self):

        return self.left_eye_landmarks

    # ==========================================
    # RIGHT EYE LANDMARKS
    # ==========================================

    def get_right_eye_landmarks(self):

        return self.right_eye_landmarks

    # ==========================================
    # MOUTH LANDMARKS
    # ==========================================

    def get_mouth_landmarks(self):

        return self.mouth_landmarks

    # ==========================================
    # ALL FACE LANDMARKS
    # ==========================================

    def get_face_landmarks(self):

        return self.face_landmarks

    # ==========================================
    # CLOSE
    # ==========================================

    def close(self):

        if self.face_landmarker is not None:

            self.face_landmarker.close()

            self.face_landmarker = None