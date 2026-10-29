import numpy as np


class HeadPoseMonitor:

    def __init__(self):

        # ==========================================
        # CURRENT POSE
        # ==========================================

        self.head_pose = "FRONT"

        # ==========================================
        # VALUES
        # ==========================================

        self.yaw = 0.0
        self.pitch = 0.0
        self.roll = 0.0

        self.raw_yaw = 0.0
        self.raw_pitch = 0.0
        self.raw_roll = 0.0

        # ==========================================
        # YAW DIRECTION
        # ==========================================

        # Your LEFT / RIGHT is already correct.
        self.reverse_yaw = True

        # ==========================================
        # CALIBRATION
        # ==========================================

        self.calibrated = False

        self.calibration_frames = 0

        # Keep your face straight during calibration.
        self.required_calibration_frames = 45

        self.yaw_samples = []
        self.pitch_samples = []
        self.roll_samples = []

        self.neutral_yaw = 0.0
        self.neutral_pitch = 0.0
        self.neutral_roll = 0.0

        # ==========================================
        # SMOOTHING
        # ==========================================

        self.yaw_history = []
        self.pitch_history = []
        self.roll_history = []

        # Median of recent frames
        self.history_size = 7

        # ==========================================
        # STABILITY
        # ==========================================

        self.left_frames = 0
        self.right_frames = 0

        self.up_frames = 0
        self.down_frames = 0

        self.front_frames = 0

        # Direction must be stable for 5 frames
        self.required_frames = 5

    # ==========================================
    # PROCESS
    # ==========================================

    def process(self, face_landmarks, width, height):

        # ==========================================
        # FACE CHECK
        # ==========================================

        if face_landmarks is None:

            self.head_pose = "NO FACE"

            self._reset_frame_counters()

            return self.head_pose

        if len(face_landmarks) < 468:

            self.head_pose = "NO FACE"

            self._reset_frame_counters()

            return self.head_pose

        # ==========================================
        # LANDMARKS
        # ==========================================

        nose = face_landmarks[1]

        left_eye = face_landmarks[33]

        right_eye = face_landmarks[263]

        left_face = face_landmarks[234]

        right_face = face_landmarks[454]

        forehead = face_landmarks[10]

        chin = face_landmarks[152]

        # ==========================================
        # FACE WIDTH
        # ==========================================

        face_width = abs(
            right_face.x - left_face.x
        )

        if face_width < 0.05:

            self.head_pose = "NO FACE"

            self._reset_frame_counters()

            return self.head_pose

        # ==========================================
        # FACE HEIGHT
        # ==========================================

        face_height = abs(
            chin.y - forehead.y
        )

        if face_height < 0.05:

            self.head_pose = "NO FACE"

            self._reset_frame_counters()

            return self.head_pose

        # ==========================================
        # FACE CENTER
        # ==========================================

        face_center_x = (
            left_face.x +
            right_face.x
        ) / 2.0

        # ==========================================
        # EYE CENTER
        # ==========================================

        eye_center_y = (
            left_eye.y +
            right_eye.y
        ) / 2.0

        # ==========================================
        # YAW
        # ==========================================

        yaw_value = (
            nose.x -
            face_center_x
        ) / face_width

        # ==========================================
        # PITCH
        # ==========================================

        pitch_value = (
            nose.y -
            eye_center_y
        ) / face_height

        # ==========================================
        # ROLL
        # ==========================================

        dx = (
            right_eye.x -
            left_eye.x
        )

        dy = (
            right_eye.y -
            left_eye.y
        )

        roll_value = np.degrees(
            np.arctan2(
                dy,
                dx
            )
        )

        # ==========================================
        # RAW VALUES
        # ==========================================

        self.raw_yaw = yaw_value

        self.raw_pitch = pitch_value

        self.raw_roll = roll_value

        # ==========================================
        # CALIBRATION
        # ==========================================

        if not self.calibrated:

            self.yaw_samples.append(
                yaw_value
            )

            self.pitch_samples.append(
                pitch_value
            )

            self.roll_samples.append(
                roll_value
            )

            self.calibration_frames += 1

            # ======================================
            # CALIBRATION COMPLETE
            # ======================================

            if (
                self.calibration_frames
                >=
                self.required_calibration_frames
            ):

                self.neutral_yaw = float(
                    np.median(
                        self.yaw_samples
                    )
                )

                self.neutral_pitch = float(
                    np.median(
                        self.pitch_samples
                    )
                )

                self.neutral_roll = float(
                    np.median(
                        self.roll_samples
                    )
                )

                self.calibrated = True

                # Clear smoothing buffers

                self.yaw_history.clear()

                self.pitch_history.clear()

                self.roll_history.clear()

                print()
                print("==============================")
                print("HEAD POSE CALIBRATION COMPLETE")
                print("==============================")

                print(
                    "Neutral Yaw   :",
                    round(
                        self.neutral_yaw,
                        4
                    )
                )

                print(
                    "Neutral Pitch :",
                    round(
                        self.neutral_pitch,
                        4
                    )
                )

                print(
                    "Neutral Roll  :",
                    round(
                        self.neutral_roll,
                        2
                    )
                )

                print("==============================")
                print()

                self.head_pose = "FRONT"

            else:

                self.head_pose = "CALIBRATING"

                return self.head_pose

        # ==========================================
        # MOVEMENT FROM FRONT
        # ==========================================

        yaw_movement = (
            yaw_value -
            self.neutral_yaw
        )

        # ==========================================
        # PITCH CORRECTION
        # ==========================================
        #
        # Positive = looking UP
        # Negative = looking DOWN
        #
        # because MediaPipe Y increases downward.
        # ==========================================

        pitch_movement = -(
            pitch_value -
            self.neutral_pitch
        )

        roll_movement = (
            roll_value -
            self.neutral_roll
        )

        # ==========================================
        # REVERSE YAW
        # ==========================================

        if self.reverse_yaw:

            yaw_movement = -yaw_movement

        # ==========================================
        # SMOOTH YAW
        # ==========================================

        self.yaw_history.append(
            yaw_movement
        )

        if (
            len(self.yaw_history)
            >
            self.history_size
        ):

            self.yaw_history.pop(0)

        yaw_smooth = float(
            np.median(
                self.yaw_history
            )
        )

        # ==========================================
        # SMOOTH PITCH
        # ==========================================

        self.pitch_history.append(
            pitch_movement
        )

        if (
            len(self.pitch_history)
            >
            self.history_size
        ):

            self.pitch_history.pop(0)

        pitch_smooth = float(
            np.median(
                self.pitch_history
            )
        )

        # ==========================================
        # SMOOTH ROLL
        # ==========================================

        self.roll_history.append(
            roll_movement
        )

        if (
            len(self.roll_history)
            >
            self.history_size
        ):

            self.roll_history.pop(0)

        roll_smooth = float(
            np.median(
                self.roll_history
            )
        )

        # ==========================================
        # SAVE VALUES
        # ==========================================

        self.yaw = yaw_smooth

        self.pitch = pitch_smooth

        self.roll = roll_smooth

        # ==========================================
        # DEBUG VALUES
        # ==========================================

        print(
            f"Yaw: {self.yaw:+.4f} | "
            f"Pitch: {self.pitch:+.4f} | "
            f"Pose: {self.head_pose}"
        )

        # ==========================================
        # CLASSIFY
        # ==========================================

        self._classify_pose(
            yaw_smooth,
            pitch_smooth
        )

        return self.head_pose

    # ==========================================
    # CLASSIFICATION
    # ==========================================

    def _classify_pose(
        self,
        yaw,
        pitch
    ):

        # ==========================================
        # YAW RANGES
        # ==========================================
        #
        # LEFT
        # <= -0.050
        #
        # FRONT
        # -0.030 to +0.030
        #
        # RIGHT
        # >= +0.050
        #
        # ==========================================

        LEFT_LIMIT = -0.050

        RIGHT_LIMIT = 0.050

        FRONT_YAW_MIN = -0.030

        FRONT_YAW_MAX = 0.030

        # ==========================================
        # PITCH RANGES
        # ==========================================
        #
        # UP
        # >= +0.060
        #
        # FRONT
        # -0.030 to +0.030
        #
        # DOWN
        # <= -0.060
        #
        # ==========================================

        UP_LIMIT = 0.060

        DOWN_LIMIT = -0.060

        FRONT_PITCH_MIN = -0.030

        FRONT_PITCH_MAX = 0.030

        # ==========================================
        # LEFT
        # ==========================================

        if yaw <= LEFT_LIMIT:

            self.left_frames += 1

        else:

            self.left_frames = 0

        # ==========================================
        # RIGHT
        # ==========================================

        if yaw >= RIGHT_LIMIT:

            self.right_frames += 1

        else:

            self.right_frames = 0

        # ==========================================
        # UP
        # ==========================================

        if pitch >= UP_LIMIT:

            self.up_frames += 1

        else:

            self.up_frames = 0

        # ==========================================
        # DOWN
        # ==========================================

        if pitch <= DOWN_LIMIT:

            self.down_frames += 1

        else:

            self.down_frames = 0

        # ==========================================
        # LEFT
        # ==========================================

        if (
            self.left_frames
            >=
            self.required_frames
        ):

            self.head_pose = "LEFT"

            self.front_frames = 0

            return

        # ==========================================
        # RIGHT
        # ==========================================

        if (
            self.right_frames
            >=
            self.required_frames
        ):

            self.head_pose = "RIGHT"

            self.front_frames = 0

            return

        # ==========================================
        # UP
        # ==========================================

        if (
            self.up_frames
            >=
            self.required_frames
        ):

            self.head_pose = "UP"

            self.front_frames = 0

            return

        # ==========================================
        # DOWN
        # ==========================================

        if (
            self.down_frames
            >=
            self.required_frames
        ):

            self.head_pose = "DOWN"

            self.front_frames = 0

            return

        # ==========================================
        # FRONT
        # ==========================================

        # IMPORTANT:
        #
        # Anything inside the FRONT range becomes
        # FRONT after 5 stable frames.
        #
        # This fixes the problem where the old pose
        # remained LEFT/RIGHT.

        if (
            FRONT_YAW_MIN
            <=
            yaw
            <=
            FRONT_YAW_MAX

            and

            FRONT_PITCH_MIN
            <=
            pitch
            <=
            FRONT_PITCH_MAX
        ):

            self.front_frames += 1

        else:

            self.front_frames = 0

        # ==========================================
        # FRONT STABILITY
        # ==========================================

        if (
            self.front_frames
            >=
            self.required_frames
        ):

            self.head_pose = "FRONT"

            # Reset direction counters

            self.left_frames = 0

            self.right_frames = 0

            self.up_frames = 0

            self.down_frames = 0

    # ==========================================
    # RESET FRAME COUNTERS
    # ==========================================

    def _reset_frame_counters(self):

        self.left_frames = 0

        self.right_frames = 0

        self.up_frames = 0

        self.down_frames = 0

        self.front_frames = 0

    # ==========================================
    # GET HEAD POSE
    # ==========================================

    def get_head_pose(self):

        return self.head_pose

    # ==========================================
    # GET PITCH
    # ==========================================

    def get_pitch(self):

        return self.pitch

    # ==========================================
    # GET YAW
    # ==========================================

    def get_yaw(self):

        return self.yaw

    # ==========================================
    # GET ROLL
    # ==========================================

    def get_roll(self):

        return self.roll

    # ==========================================
    # GET RAW YAW
    # ==========================================

    def get_raw_yaw(self):

        return self.raw_yaw

    # ==========================================
    # GET RAW PITCH
    # ==========================================

    def get_raw_pitch(self):

        return self.raw_pitch

    # ==========================================
    # GET RAW ROLL
    # ==========================================

    def get_raw_roll(self):

        return self.raw_roll

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.head_pose = "FRONT"

        self.yaw = 0.0

        self.pitch = 0.0

        self.roll = 0.0

        self.raw_yaw = 0.0

        self.raw_pitch = 0.0

        self.raw_roll = 0.0

        self.calibrated = False

        self.calibration_frames = 0

        self.yaw_samples = []

        self.pitch_samples = []

        self.roll_samples = []

        self.yaw_history = []

        self.pitch_history = []

        self.roll_history = []

        self._reset_frame_counters()
