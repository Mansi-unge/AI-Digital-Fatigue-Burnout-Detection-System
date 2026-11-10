from backend.monitoring.keyboard import KeyboardMonitor
from backend.monitoring.mouse import MouseMonitor
from backend.monitoring.screen import ScreenMonitor
from backend.monitoring.idle import IdleMonitor
from backend.monitoring.applications import ApplicationMonitor
from backend.monitoring.webcam import WebcamMonitor
from backend.monitoring.brightness import BrightnessMonitor
from backend.monitoring.battery import BatteryMonitor


class MonitorManager:

    def __init__(self):

        # ==========================================
        # CREATE ALL MONITORS
        # ==========================================

        self.keyboard = KeyboardMonitor()

        self.mouse = MouseMonitor()

        self.screen = ScreenMonitor()

        self.idle = IdleMonitor()

        self.application = ApplicationMonitor()

        self.webcam = WebcamMonitor()

        self.brightness = BrightnessMonitor()

        self.battery = BatteryMonitor()

        self.running = False

    # ==========================================
    # START ALL MONITORS
    # ==========================================

    def start(self):

        if self.running:

            print("Monitor Manager is already running.")

            return

        print()
        print("================================")
        print("Starting all monitors...")
        print("================================")

        self.keyboard.start()

        self.mouse.start()

        self.screen.start()

        self.idle.start()

        self.application.start()

        self.webcam.start()

        self.brightness.start()

        self.battery.start()

        self.running = True

        print()
        print("================================")
        print("All monitors started successfully")
        print("================================")

    # ==========================================
    # GET ALL MONITOR DATA
    # ==========================================

    def get_data(self):

        application = (
            self.application.get_active_application()
        )

        application_switches = (
            self.application.get_application_switches()
        )

        battery_data = (
            self.battery.get_battery_status()
        )

        return {

            # Keyboard
            "keyboard_count":
                self.keyboard.get_count(),

            # Mouse
            "mouse_clicks":
                self.mouse.get_clicks(),

            "mouse_distance":
                self.mouse.get_distance(),

            "scroll_count":
                self.mouse.get_scroll_count(),

            # Screen
            "screen_time":
                self.screen.get_screen_time(),

            # Idle
            "idle_time":
                self.idle.get_idle_time(),

            # Active application
            "active_application":
                application,

            "application_switches":
                application_switches,

            # Webcam
            "webcam_available":
                self.webcam.get_status(),

            # Brightness
            "brightness":
                self.brightness.get_brightness(),

            # Battery
            "battery_percentage":
                battery_data["battery_percentage"],

            "charging_status":
                battery_data["charging_status"]
        }

    # ==========================================
    # STOP ALL MONITORS
    # ==========================================

    def stop(self):

        if not self.running:

            print("Monitor Manager is not running.")

            return

        print()
        print("================================")
        print("Stopping all monitors...")
        print("================================")

        self.keyboard.stop()

        self.mouse.stop()

        self.screen.stop()

        self.idle.stop()

        self.application.stop()

        self.webcam.stop()

        self.brightness.stop()

        self.battery.stop()

        self.running = False

        print()
        print("================================")
        print("All monitors stopped")
        print("================================")

    # ==========================================
    # STATUS
    # ==========================================

    def is_running(self):

        return self.running