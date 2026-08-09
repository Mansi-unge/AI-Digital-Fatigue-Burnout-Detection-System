import time
import threading


class ScreenMonitor:

    def __init__(self):

        self.screen_time = 0.0

        self.running = False

        self.thread = None

    # ==========================================
    # TRACK SCREEN TIME
    # ==========================================

    def _track_screen_time(self):

        while self.running:

            time.sleep(1)

            self.screen_time += 1

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("Screen monitor is already running.")

            return

        self.screen_time = 0.0

        self.running = True

        self.thread = threading.Thread(
            target=self._track_screen_time,
            daemon=True
        )

        self.thread.start()

        print("Screen monitor started.")

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        if not self.running:

            return

        self.running = False

        if self.thread:

            self.thread.join(timeout=2)

            self.thread = None

        print("Screen monitor stopped.")

    # ==========================================
    # GET SCREEN TIME
    # ==========================================

    def get_screen_time(self):

        return self.screen_time

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.screen_time = 0.0