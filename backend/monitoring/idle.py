import time
import threading

from pynput import keyboard, mouse


class IdleMonitor:

    def __init__(self):

        self.last_activity_time = time.time()

        self.idle_time = 0.0

        self.running = False

        self.keyboard_listener = None
        self.mouse_listener = None

        self.thread = None

    # ==========================================
    # KEYBOARD ACTIVITY
    # ==========================================

    def on_key_press(self, key):

        self.last_activity_time = time.time()

    # ==========================================
    # MOUSE ACTIVITY
    # ==========================================

    def on_mouse_move(self, x, y):

        self.last_activity_time = time.time()

    def on_mouse_click(
        self,
        x,
        y,
        button,
        pressed
    ):

        if pressed:

            self.last_activity_time = time.time()

    def on_mouse_scroll(
        self,
        x,
        y,
        dx,
        dy
    ):

        self.last_activity_time = time.time()

    # ==========================================
    # TRACK IDLE TIME
    # ==========================================

    def _track_idle_time(self):

        while self.running:

            current_time = time.time()

            self.idle_time = (
                current_time
                - self.last_activity_time
            )

            time.sleep(1)

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("Idle monitor is already running.")

            return

        self.running = True

        self.last_activity_time = time.time()

        self.idle_time = 0.0

        # Keyboard listener
        self.keyboard_listener = keyboard.Listener(
            on_press=self.on_key_press
        )

        # Mouse listener
        self.mouse_listener = mouse.Listener(
            on_move=self.on_mouse_move,
            on_click=self.on_mouse_click,
            on_scroll=self.on_mouse_scroll
        )

        self.keyboard_listener.start()

        self.mouse_listener.start()

        # Idle calculation thread
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

        self.running = False

        if self.keyboard_listener:

            self.keyboard_listener.stop()

            self.keyboard_listener = None

        if self.mouse_listener:

            self.mouse_listener.stop()

            self.mouse_listener = None

        if self.thread:

            self.thread.join(timeout=2)

            self.thread = None

        print("Idle monitor stopped.")

    # ==========================================
    # GET IDLE TIME
    # ==========================================

    def get_idle_time(self):

        return self.idle_time

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.last_activity_time = time.time()

        self.idle_time = 0.0