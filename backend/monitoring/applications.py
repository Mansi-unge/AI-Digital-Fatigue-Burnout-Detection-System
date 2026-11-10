import win32gui


class ApplicationMonitor:

    def __init__(self):

        self.current_application = "Unknown"

        self.previous_application = None

        self.application_switches = 0

    # ==========================================
    # UPDATE ACTIVE APPLICATION
    # ==========================================

    def update_active_application(self):

        window = win32gui.GetForegroundWindow()

        if not window:

            self.current_application = "Unknown"

            return

        title = win32gui.GetWindowText(window)

        if title.strip():

            application = title.strip()

        else:

            application = "Desktop"

        # Check whether application changed
        if (
            self.previous_application is not None
            and application != self.previous_application
        ):

            self.application_switches += 1

        self.current_application = application

        self.previous_application = application

    # ==========================================
    # GET ACTIVE APPLICATION
    # ==========================================

    def get_active_application(self):

        self.update_active_application()

        return self.current_application

    # ==========================================
    # GET APPLICATION SWITCHES
    # ==========================================

    def get_application_switches(self):

        return self.application_switches

    # ==========================================
    # START
    # ==========================================

    def start(self):

        self.current_application = "Unknown"

        self.previous_application = None

        self.application_switches = 0

        self.update_active_application()

        print("Application monitor started.")

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        print("Application monitor stopped.")

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.previous_application = None

        self.application_switches = 0

        self.update_active_application()