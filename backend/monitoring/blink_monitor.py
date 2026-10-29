import time
import math


class BlinkMonitor:

    def __init__(self):

        # ==========================================
        # BLINK SETTINGS
        # ==========================================

        self.ear_threshold = 0.21

        self.min_blink_duration = 0.05
        self.max_blink_duration = 0.80

        # ==========================================
        # BLINK DATA
        # ==========================================

        self.blink_count = 0

        self.eye_closed = False

        self.eye_close_start = None

        self.total_eye_closure_duration = 0.0

        # ==========================================
        # TIME DATA
        # ==========================================

        self.monitoring_start = None

    # ==========================================
    # START MONITORING
    # ==========================================

    def start(self):

        self.monitoring_start = time.time()

    # ==========================================
    # CALCULATE EAR
    # ==========================================

    def calculate_ear(self, eye_landmarks):

        if len(eye_landmarks) != 6:

            return None

        p1, p2, p3, p4, p5, p6 = eye_landmarks

        # Vertical distances
        vertical_1 = math.dist(p2, p6)
        vertical_2 = math.dist(p3, p5)

        # Horizontal distance
        horizontal = math.dist(p1, p4)

        if horizontal == 0:

            return None

        ear = (
            vertical_1 + vertical_2
        ) / (
            2.0 * horizontal
        )

        return ear

    # ==========================================
    # PROCESS EYES
    # ==========================================

    def process(
        self,
        left_eye_landmarks,
        right_eye_landmarks
    ):

        current_time = time.time()

        left_ear = self.calculate_ear(
            left_eye_landmarks
        )

        right_ear = self.calculate_ear(
            right_eye_landmarks
        )

        if left_ear is None or right_ear is None:

            return None

        # Average EAR of both eyes
        average_ear = (
            left_ear + right_ear
        ) / 2.0

        # ==========================================
        # EYE CLOSED
        # ==========================================

        if average_ear < self.ear_threshold:

            if not self.eye_closed:

                self.eye_closed = True

                self.eye_close_start = current_time

        # ==========================================
        # EYE OPEN
        # ==========================================

        else:

            if self.eye_closed:

                eye_closure_duration = (
                    current_time
                    - self.eye_close_start
                )

                # Add closure duration
                self.total_eye_closure_duration += (
                    eye_closure_duration
                )

                # Count as blink only if duration
                # is within the expected range
                if (
                    eye_closure_duration
                    >= self.min_blink_duration
                    and
                    eye_closure_duration
                    <= self.max_blink_duration
                ):

                    self.blink_count += 1

                self.eye_closed = False

                self.eye_close_start = None

        return average_ear

    # ==========================================
    # BLINK COUNT
    # ==========================================

    def get_blink_count(self):

        return self.blink_count

    # ==========================================
    # BLINK RATE
    # ==========================================

    def get_blink_rate(self):

        if self.monitoring_start is None:

            return 0.0

        elapsed_time = (
            time.time()
            - self.monitoring_start
        )

        if elapsed_time <= 0:

            return 0.0

        elapsed_minutes = elapsed_time / 60.0

        return self.blink_count / elapsed_minutes

    # ==========================================
    # CURRENT EYE CLOSURE
    # ==========================================

    def get_current_eye_closure_duration(self):

        if not self.eye_closed:

            return 0.0

        return time.time() - self.eye_close_start

    # ==========================================
    # TOTAL EYE CLOSURE
    # ==========================================

    def get_eye_closure_duration(self):

        total_duration = (
            self.total_eye_closure_duration
        )

        # Include currently active closure
        if self.eye_closed:

            total_duration += (
                time.time()
                - self.eye_close_start
            )

        return total_duration

    # ==========================================
    # EYE CLOSURE PERCENTAGE
    # ==========================================

    def get_eye_closure_percentage(self):

        if self.monitoring_start is None:

            return 0.0

        elapsed_time = (
            time.time()
            - self.monitoring_start
        )

        if elapsed_time <= 0:

            return 0.0

        closure_duration = (
            self.get_eye_closure_duration()
        )

        percentage = (
            closure_duration
            / elapsed_time
        ) * 100

        return percentage

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.blink_count = 0

        self.eye_closed = False

        self.eye_close_start = None

        self.total_eye_closure_duration = 0.0

        self.monitoring_start = None