from pynput import keyboard


class KeyboardMonitor:

    def __init__(self):

        self.keyboard_count = 0

        self.listener = None

        self.running = False

    # ==========================================
    # KEY PRESSED
    # ==========================================

    def on_press(self, key):

        self.keyboard_count += 1

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("Keyboard monitor is already running.")

            return

        self.keyboard_count = 0

        self.listener = keyboard.Listener(
            on_press=self.on_press
        )

        self.listener.start()

        self.running = True

        print("Keyboard monitor started.")

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        if not self.running:

            return

        if self.listener:

            self.listener.stop()

            self.listener = None

        self.running = False

        print("Keyboard monitor stopped.")

    # ==========================================
    # GET COUNT
    # ==========================================

    def get_count(self):

        return self.keyboard_count

    # ==========================================
    # RESET COUNT
    # ==========================================

    def reset(self):

        self.keyboard_count = 0