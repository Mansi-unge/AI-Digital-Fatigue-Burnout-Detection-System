import time
import threading

from pynput import keyboard, mouse


class IdleMonitor:

    def __init__(self):

        # ==========================================
        # SETTINGS
        # ==========================================

        # User is considered idle after 5 seconds
        # without keyboard/mouse activity.
        self.IDLE_THRESHOLD = 5.0

        # ==========================================
        # ACTIVITY TRACKING
        # ==========================================

        self.last_activity_time = time.time()

        # Total completed idle time
        self.total_idle_time = 0.0

        # Current continuous idle period
        self.current_idle_time = 0.0

        # ==========================================
        # STATUS
        # ==========================================

        self.running = False

        self.keyboard_listener = None
        self.mouse_listener = None

        self.thread = None

        self.lock = threading.Lock()

    # ==========================================
    # RECORD USER ACTIVITY
    # ==========================================

    def _record_activity(self):

        current_time = time.time()

        with self.lock:

            inactive_duration = (
                current_time
                - self.last_activity_time
            )

            # If the previous period was actually idle,
            # save that completed idle period.
            if inactive_duration >= self.IDLE_THRESHOLD:

                self.total_idle_time += (
                    inactive_duration
                )

            # Start a new activity period
            self.last_activity_time = current_time

            self.current_idle_time = 0.0

    # ==========================================
    # KEYBOARD ACTIVITY
    # ==========================================

    def on_key_press(self, key):

        self._record_activity()

    # ==========================================
    # MOUSE MOVEMENT
    # ==========================================

    def on_mouse_move(self, x, y):

        self._record_activity()

    # ==========================================
    # MOUSE CLICK
    # ==========================================

    def on_mouse_click(
        self,
        x,
        y,
        button,
        pressed
    ):

        if pressed:

            self._record_activity()

    # ==========================================
    # MOUSE SCROLL
    # ==========================================

    def on_mouse_scroll(
        self,
        x,
        y,
        dx,
        dy
    ):

        self._record_activity()

    # ==========================================
    # TRACK CURRENT IDLE PERIOD
    # ==========================================

    def _track_idle_time(self):

        while self.running:

            current_time = time.time()

            with self.lock:

                inactive_duration = (
                    current_time
                    - self.last_activity_time
                )

                if inactive_duration >= self.IDLE_THRESHOLD:

                    self.current_idle_time = (
                        inactive_duration
                    )

                else:

                    self.current_idle_time = 0.0

            time.sleep(0.5)

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("Idle monitor is already running.")

            return

        self.running = True

        with self.lock:

            self.last_activity_time = time.time()

            self.total_idle_time = 0.0

            self.current_idle_time = 0.0

        # ======================================
        # KEYBOARD LISTENER
        # ======================================

        self.keyboard_listener = keyboard.Listener(
            on_press=self.on_key_press
        )

        # ======================================
        # MOUSE LISTENER
        # ======================================

        self.mouse_listener = mouse.Listener(
            on_move=self.on_mouse_move,
            on_click=self.on_mouse_click,
            on_scroll=self.on_mouse_scroll
        )

        self.keyboard_listener.start()
        self.mouse_listener.start()

        # ======================================
        # IDLE THREAD
        # ======================================

        self.thread = threading.Thread(
            target=self._track_idle_time,
            daemon=True
        )

        self.thread.start()

        print("Idle monitor started.")

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        if not self.running:

            return

        # Record currently active idle period
        # before stopping.
        with self.lock:

            current_time = time.time()

            inactive_duration = (
                current_time
                - self.last_activity_time
            )

            if inactive_duration >= self.IDLE_THRESHOLD:

                self.total_idle_time += (
                    inactive_duration
                )

        self.running = False

        # ======================================
        # STOP KEYBOARD
        # ======================================

        if self.keyboard_listener:

            self.keyboard_listener.stop()

            self.keyboard_listener = None

        # ======================================
        # STOP MOUSE
        # ======================================

        if self.mouse_listener:

            self.mouse_listener.stop()

            self.mouse_listener = None

        # ======================================
        # STOP THREAD
        # ======================================

        if self.thread:

            self.thread.join(timeout=2)

            self.thread = None

        print("Idle monitor stopped.")

    # ==========================================
    # CURRENT IDLE TIME
    # ==========================================

    def get_current_idle_time(self):

        with self.lock:

            inactive_duration = (
                time.time()
                - self.last_activity_time
            )

            if inactive_duration >= self.IDLE_THRESHOLD:

                return inactive_duration

            return 0.0

    # ==========================================
    # TOTAL IDLE TIME
    # ==========================================

    def get_total_idle_time(self):

        with self.lock:

            total = self.total_idle_time

            inactive_duration = (
                time.time()
                - self.last_activity_time
            )

            # Include current ongoing idle period.
            if inactive_duration >= self.IDLE_THRESHOLD:

                total += inactive_duration

            return total

    # ==========================================
    # DATABASE VALUE
    # ==========================================

    def get_idle_time(self):

        return self.get_total_idle_time()

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        with self.lock:

            self.last_activity_time = time.time()

            self.total_idle_time = 0.0

            self.current_idle_time = 0.0