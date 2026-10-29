import math
import time


class YawnMonitor:

    def __init__(self):

        # ==========================================
        # YAWN SETTINGS
        # ==========================================

        self.yawn_threshold = 0.25

        # Mouth must remain open for this duration
        # before it is considered a yawn
        self.min_yawn_duration = 0.80

        # Prevent duplicate counting
        self.min_time_between_yawns = 1.50

        # ==========================================
        # YAWN DATA
        # ==========================================

        self.yawn_count = 0

        self.mouth_open = False

        self.mouth_open_start = None

        self.last_yawn_time = None

    # ==========================================
    # CALCULATE MOUTH RATIO
    # ==========================================

    def calculate_mouth_ratio(
        self,
        mouth_landmarks
    ):

        if len(mouth_landmarks) != 4:

            return None

        upper_lip = mouth_landmarks[0]

        lower_lip = mouth_landmarks[1]

        left_corner = mouth_landmarks[2]

        right_corner = mouth_landmarks[3]

        # Vertical mouth opening
        vertical_distance = math.dist(
            upper_lip,
            lower_lip
        )

        # Horizontal mouth width
        horizontal_distance = math.dist(
            left_corner,
            right_corner
        )

        if horizontal_distance == 0:

            return None

        # Normalize mouth opening
        mouth_ratio = (
            vertical_distance
            / horizontal_distance
        )

        return mouth_ratio

    # ==========================================
    # PROCESS MOUTH
    # ==========================================

    def process(
        self,
        mouth_landmarks
    ):

        if len(mouth_landmarks) != 4:

            return None

        current_time = time.time()

        mouth_ratio = (
            self.calculate_mouth_ratio(
                mouth_landmarks
            )
        )

        if mouth_ratio is None:

            return None

        # ==========================================
        # MOUTH OPEN
        # ==========================================

        if mouth_ratio > self.yawn_threshold:

            if not self.mouth_open:

                self.mouth_open = True

                self.mouth_open_start = (
                    current_time
                )

        # ==========================================
        # MOUTH CLOSED
        # ==========================================

        else:

            if self.mouth_open:

                mouth_open_duration = (
                    current_time
                    - self.mouth_open_start
                )

                # ==================================
                # CHECK YAWN DURATION
                # ==================================

                if (
                    mouth_open_duration
                    >= self.min_yawn_duration
                ):

                    # ==================================
                    # PREVENT DUPLICATE YAWNS
                    # ==================================

                    if (
                        self.last_yawn_time is None
                        or
                        (
                            current_time
                            - self.last_yawn_time
                        )
                        >= self.min_time_between_yawns
                    ):

                        self.yawn_count += 1

                        self.last_yawn_time = (
                            current_time
                        )

                self.mouth_open = False

                self.mouth_open_start = None

        return mouth_ratio

    # ==========================================
    # GET YAWN COUNT
    # ==========================================

    def get_yawn_count(self):

        return self.yawn_count

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.yawn_count = 0

        self.mouth_open = False

        self.mouth_open_start = None

        self.last_yawn_time = None