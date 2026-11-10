from pynput import mouse


class MouseMonitor:

    def __init__(self):

        self.mouse_clicks = 0
        self.scroll_count = 0

        self.start_x = None
        self.start_y = None

        self.mouse_distance = 0.0

        self.listener = None
        self.running = False

    # ==========================================
    # MOUSE CLICK
    # ==========================================

    def on_click(self, x, y, button, pressed):

        if pressed:
            self.mouse_clicks += 1

    # ==========================================
    # MOUSE MOVEMENT
    # ==========================================

    def on_move(self, x, y):

        if self.start_x is not None:

            distance = (
                (x - self.start_x) ** 2
                + (y - self.start_y) ** 2
            ) ** 0.5

            self.mouse_distance += distance

        self.start_x = x
        self.start_y = y

    # ==========================================
    # MOUSE SCROLL
    # ==========================================

    def on_scroll(self, x, y, dx, dy):

        self.scroll_count += 1

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:
            print("Mouse monitor is already running.")
            return

        self.mouse_clicks = 0
        self.scroll_count = 0
        self.mouse_distance = 0.0

        self.listener = mouse.Listener(
            on_click=self.on_click,
            on_move=self.on_move,
            on_scroll=self.on_scroll
        )

        self.listener.start()

        self.running = True

        print("Mouse monitor started.")

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

        print("Mouse monitor stopped.")

    # ==========================================
    # GET CLICK COUNT
    # ==========================================

    def get_clicks(self):

        return self.mouse_clicks

    # ==========================================
    # GET MOUSE DISTANCE
    # ==========================================

    def get_distance(self):

        return self.mouse_distance

    # ==========================================
    # GET SCROLL COUNT
    # ==========================================

    def get_scroll_count(self):

        return self.scroll_count

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.mouse_clicks = 0
        self.scroll_count = 0
        self.mouse_distance = 0.0