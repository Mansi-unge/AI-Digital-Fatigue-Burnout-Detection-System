from pathlib import Path
import cv2
import mediapipe as mp


class FaceMonitor:

    def __init__(self):

        self.face_detected = False

        # MediaPipe Tasks API
        BaseOptions = mp.tasks.BaseOptions
        FaceDetector = mp.tasks.vision.FaceDetector
        FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        # Path to face detection model
        project_root = Path(__file__).resolve().parents[2]
        model_path = str(
          project_root / "models" / "blaze_face_short_range.tflite"
        )

        # Configure detector
        options = FaceDetectorOptions(
            base_options=BaseOptions(
                model_asset_path=model_path
            ),
            running_mode=VisionRunningMode.IMAGE,
            min_detection_confidence=0.5
        )

        # Create detector
        self.detector = FaceDetector.create_from_options(options)

    def process_frame(self, frame):

        # OpenCV uses BGR
        # MediaPipe expects RGB
        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # Convert OpenCV image to MediaPipe image
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # Detect faces
        result = self.detector.detect(mp_image)

        # Update face status
        if result.detections:

            self.face_detected = True

            # Draw bounding boxes
            for detection in result.detections:

                bbox = detection.bounding_box

                x = bbox.origin_x
                y = bbox.origin_y
                width = bbox.width
                height = bbox.height

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x + width, y + height),
                    (0, 255, 0),
                    2
                )

        else:

            self.face_detected = False

        return frame

    def is_face_detected(self):

        return self.face_detected

    def close(self):

        if self.detector is not None:

            self.detector.close()

            self.detector = None