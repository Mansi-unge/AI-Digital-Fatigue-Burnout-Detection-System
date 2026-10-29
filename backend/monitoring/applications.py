import time
import threading
import win32gui


class ApplicationMonitor:

    def __init__(self):

        self.current_application = "Unknown"
        self.previous_application = None

        self.application_switches = 0

        self.running = False
        self.thread = None

        self.lock = threading.Lock()

    # ==========================================
    # GET CURRENT WINDOW
    # ==========================================

    def _get_current_window(self):

        window = win32gui.GetForegroundWindow()

        if not window:
            return "Unknown"

        title = win32gui.GetWindowText(window)

        if title.strip():
            return title.strip()

        return "Desktop"

    # ==========================================
    # MONITOR ACTIVE APPLICATION
    # ==========================================

    def _monitor_applications(self):

        while self.running:

            application = self._get_current_window()

            with self.lock:

                # First application
                if self.previous_application is None:

                    self.previous_application = application
                    self.current_application = application

                # Application changed
                elif application != self.previous_application:

                    self.application_switches += 1

                    print(
                        f"Application switched: "
                        f"{self.previous_application} "
                        f"-> {application}"
                    )

                    self.previous_application = application
                    self.current_application = application

            time.sleep(0.5)

    # ==========================================
    # GET DATA
    # ==========================================

    def get_data(self):

        with self.lock:

            return {
                "active_application":
                    self.current_application,

                "application_switches":
                    self.application_switches
            }

    # ==========================================
    # GET ACTIVE APPLICATION
    # ==========================================

    def get_active_application(self):

        with self.lock:

            return self.current_application

    # ==========================================
    # GET APPLICATION SWITCHES
    # ==========================================

    def get_application_switches(self):

        with self.lock:

            return self.application_switches

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print(
                "Application monitor is already running."
            )

            return

        self.current_application = "Unknown"
        self.previous_application = None
        self.application_switches = 0

        self.running = True

        # Get initial application immediately
        initial_application = self._get_current_window()

        self.current_application = initial_application
        self.previous_application = initial_application

        self.thread = threading.Thread(
            target=self._monitor_applications,
            daemon=True
        )

        self.thread.start()

        print("Application monitor started.")

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

        print("Application monitor stopped.")

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        with self.lock:

            self.application_switches = 0

            current_application = (
                self._get_current_window()
            )

            self.current_application = current_application
            self.previous_application = current_application