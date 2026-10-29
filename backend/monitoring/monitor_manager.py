import threading
import time

from backend.monitoring.keyboard import KeyboardMonitor
from backend.monitoring.mouse import MouseMonitor
from backend.monitoring.screen import ScreenMonitor
from backend.monitoring.idle import IdleMonitor
from backend.monitoring.applications import ApplicationMonitor

from backend.monitoring.brightness import BrightnessMonitor
from backend.monitoring.battery import BatteryMonitor

from backend.monitoring.camera_stream import CameraStream
from backend.monitoring.camera_monitor import CameraMonitor

from backend.monitoring.iot_monitor import IoTMonitor

from backend.monitoring.monitoring_service import MonitoringService
from backend.database.database import SessionLocal
from backend.database.models.settings import Settings

class MonitorManager:

    def __init__(self):

        # ==========================================
        # CURRENT USER
        # ==========================================

        self.user_id = None
        self.session_id = None

        # ==========================================
        # DESKTOP MONITORS
        # ==========================================

        self.keyboard = KeyboardMonitor()
        self.mouse = MouseMonitor()
        self.screen = ScreenMonitor()
        self.idle = IdleMonitor()
        self.application = ApplicationMonitor()

        # ==========================================
        # CAMERA STREAM
        # ==========================================

        self.camera_stream = CameraStream()

        # ==========================================
        # AI CAMERA
        # ==========================================

        self.camera = CameraMonitor()

        # ==========================================
        # AI CAMERA THREAD
        # ==========================================

        self.camera_thread = None
        self.camera_processing = False


        # ==========================================
        # ACTIVITY DATABASE LOGGER
        # ==========================================

        self.monitoring_service = MonitoringService()

        self.activity_thread = None
        self.activity_logging = False

        # ==========================================
        # LATEST CAMERA DATA
        # ==========================================

        self.latest_camera_data = {}

        self.camera_data_lock = threading.Lock()

        # ==========================================
        # IoT
        # ==========================================

        self.iot = IoTMonitor()
        self.iot_last_received_at = None
        self.iot_last_received_monotonic = None
        self.iot_lock = threading.Lock()
        self.IOT_FRESHNESS_SECONDS = 25
        # ==========================================
        # SYSTEM
        # ==========================================

        self.brightness = BrightnessMonitor()
        self.battery = BatteryMonitor()

        # ==========================================
        # MONITORING STATUS
        # ==========================================

        self.running = False

    # ==========================================================
    # SET CURRENT USER
    # ==========================================================

    def set_user(self, user_id, session_id=None):

        self.user_id = user_id
        self.session_id = session_id
        with self.iot_lock:
            self.iot_last_received_at = None
            self.iot_last_received_monotonic = None


    def mark_iot_data_received(self):
        """Mark the exact moment a valid ESP32 packet reached the backend."""
        from datetime import datetime, timezone

        with self.iot_lock:
            self.iot_last_received_at = datetime.now(timezone.utc)
            self.iot_last_received_monotonic = time.monotonic()

    def get_iot_status(self):
        """Return true IoT connectivity based on the last ESP32 packet."""
        from datetime import timezone

        with self.iot_lock:
            last_received_at = self.iot_last_received_at
            last_received_monotonic = self.iot_last_received_monotonic

        if last_received_at is None or last_received_monotonic is None:
            return {
                "iot_live": False,
                "iot_last_received": None,
                "iot_age_seconds": None,
            }

        age = max(0.0, time.monotonic() - last_received_monotonic)
        live = self.running and age <= self.IOT_FRESHNESS_SECONDS

        return {
            "iot_live": live,
            "iot_last_received": last_received_at.isoformat(),
            "iot_age_seconds": round(age, 1),
        }
    # ==========================================================
    # GET USER SETTINGS
    # ==========================================================

    def get_user_settings(self):

        if self.user_id is None:
            return None

        db = SessionLocal()

        try:

            settings = (
                db.query(Settings)
                .filter(
                    Settings.user_id == self.user_id
                )
                .first()
            )

            # Create default settings if missing
            if settings is None:

                settings = Settings(
                    user_id=self.user_id,

                    monitoring_enabled=True,

                    keyboard_monitoring=True,
                    mouse_monitoring=True,
                    screen_monitoring=True,
                    idle_monitoring=True,
                    application_monitoring=True,
                    webcam_monitoring=True,

                    notifications_enabled=True,
                    break_reminders=True,
                    fatigue_alerts=True,

                    theme="light"
                )

                db.add(settings)
                db.commit()
                db.refresh(settings)

            return {
                "keyboard_monitoring":
                    settings.keyboard_monitoring,

                "mouse_monitoring":
                    settings.mouse_monitoring,

                "screen_monitoring":
                    settings.screen_monitoring,

                "idle_monitoring":
                    settings.idle_monitoring,

                "application_monitoring":
                    settings.application_monitoring,

                "webcam_monitoring":
                    settings.webcam_monitoring,

                "notifications_enabled":
                    settings.notifications_enabled,

                "break_reminders":
                    settings.break_reminders,

                "fatigue_alerts":
                    settings.fatigue_alerts
            }

        finally:
            db.close()
    



    # ==========================================================
    # APPLY MONITORING SETTINGS
    # ==========================================================
    def apply_settings(self):

        settings = self.get_user_settings()

        if settings is None:
            return

        print()
        print("================================")
        print("Applying monitoring settings")
        print("================================")

        # ======================================================
        # KEYBOARD
        # ======================================================

        if settings["keyboard_monitoring"]:

            if not self.keyboard.running:
                self.keyboard.start()

            print("Keyboard Monitoring : ON")

        else:

            self.keyboard.stop()

            print("Keyboard Monitoring : OFF")

        # ======================================================
        # MOUSE
        # ======================================================

        if settings["mouse_monitoring"]:

            if not self.mouse.running:
                self.mouse.start()

            print("Mouse Monitoring    : ON")

        else:

            self.mouse.stop()

            print("Mouse Monitoring    : OFF")

        # ======================================================
        # SCREEN
        # ======================================================

        if settings["screen_monitoring"]:

            if not self.screen.running:
                self.screen.start()

            print("Screen Monitoring   : ON")

        else:

            self.screen.stop()

            print("Screen Monitoring   : OFF")

        # ======================================================
        # IDLE
        # ======================================================

        if settings["idle_monitoring"]:

            if not self.idle.running:
                self.idle.start()

            print("Idle Monitoring     : ON")

        else:

            self.idle.stop()

            print("Idle Monitoring     : OFF")

        # ======================================================
        # APPLICATION
        # ======================================================

        if settings["application_monitoring"]:

            if not self.application.running:
                self.application.start()

            print("Application Monitor : ON")

        else:

            self.application.stop()

            print("Application Monitor : OFF")

        # ======================================================
        # WEBCAM
        # ======================================================

        if settings["webcam_monitoring"]:

            # ----------------------------------------------
            # START CAMERA STREAM
            # ----------------------------------------------

            if not self.camera_stream.is_running():

                self.camera_stream.start()

            # ----------------------------------------------
            # START CAMERA MONITOR
            # ----------------------------------------------

            self.camera.start()

            # ----------------------------------------------
            # START CAMERA PROCESSING THREAD
            # ----------------------------------------------

            if not self.camera_processing:

                self.camera_processing = True

                self.camera_thread = threading.Thread(
                    target=self._camera_processing_loop,
                    daemon=True
                )

                self.camera_thread.start()

            print("Webcam Monitoring   : ON")

        else:

            # ----------------------------------------------
            # STOP CAMERA PROCESSING
            # ----------------------------------------------

            self.camera_processing = False

            if self.camera_thread is not None:

                self.camera_thread.join(timeout=2)

                self.camera_thread = None

            # ----------------------------------------------
            # RESET CAMERA MONITOR
            # ----------------------------------------------

            self.camera.reset()

            # ----------------------------------------------
            # STOP CAMERA STREAM
            # ----------------------------------------------

            self.camera_stream.stop()

            # ----------------------------------------------
            # CLEAR CAMERA DATA
            # ----------------------------------------------

            with self.camera_data_lock:

                self.latest_camera_data = {}

            print("Webcam Monitoring   : OFF")

        print("================================")


        # ==========================================================
    # SET CAMERA ENABLED / DISABLED
    # ==========================================================

    def set_camera_enabled(self, enabled):
        """
        Enable or disable only camera monitoring.

        This is used by the Camera Data page quick toggle.

        It updates the same Settings.webcam_monitoring
        field used by the Settings page.
        """

        if self.user_id is None:

            return {
                "success": False,
                "enabled": False,
                "message": "No active monitoring user."
            }

        enabled = bool(enabled)

        # ======================================================
        # SAVE CAMERA SETTING
        # ======================================================

        db = SessionLocal()

        try:

            settings = (
                db.query(Settings)
                .filter(
                    Settings.user_id == self.user_id
                )
                .first()
            )

            if settings is None:

                settings = Settings(
                    user_id=self.user_id,
                    monitoring_enabled=True,
                    keyboard_monitoring=True,
                    mouse_monitoring=True,
                    screen_monitoring=True,
                    idle_monitoring=True,
                    application_monitoring=True,
                    webcam_monitoring=enabled,
                    notifications_enabled=True,
                    break_reminders=True,
                    fatigue_alerts=True,
                    theme="light"
                )

                db.add(settings)

            else:

                settings.webcam_monitoring = enabled

            db.commit()

        except Exception as e:

            db.rollback()

            print(
                "Camera setting update error:",
                str(e)
            )

            return {
                "success": False,
                "enabled": not enabled,
                "message": "Unable to update camera setting."
            }

        finally:

            db.close()

        # ======================================================
        # CAMERA ON
        # ======================================================

        if enabled:

            try:

                # ----------------------------------------------
                # START CAMERA STREAM
                # ----------------------------------------------

                if not self.camera_stream.is_running():

                    self.camera_stream.start()

                # ----------------------------------------------
                # START CAMERA AI
                # ----------------------------------------------

                self.camera.start()

                # ----------------------------------------------
                # START PROCESSING THREAD
                # ----------------------------------------------

                if not self.camera_processing:

                    self.camera_processing = True

                    self.camera_thread = threading.Thread(
                        target=self._camera_processing_loop,
                        daemon=True
                    )

                    self.camera_thread.start()

                print()
                print("==============================")
                print("CAMERA ENABLED")
                print("==============================")
                print()

                return {
                    "success": True,
                    "enabled": True,
                    "message": "Camera monitoring enabled."
                }

            except Exception as e:

                print(
                    "Camera start error:",
                    str(e)
                )

                # ----------------------------------------------
                # CLEAN UP PARTIALLY STARTED CAMERA
                # ----------------------------------------------

                self.camera_processing = False

                if self.camera_thread is not None:

                    self.camera_thread.join(
                        timeout=2
                    )

                    self.camera_thread = None

                self.camera.reset()
                self.camera_stream.stop()

                with self.camera_data_lock:

                    self.latest_camera_data = {}

                # ----------------------------------------------
                # RESTORE DATABASE SETTING
                # ----------------------------------------------

                db = SessionLocal()

                try:

                    settings = (
                        db.query(Settings)
                        .filter(
                            Settings.user_id == self.user_id
                        )
                        .first()
                    )

                    if settings is not None:

                        settings.webcam_monitoring = False
                        db.commit()

                except Exception as db_error:

                    db.rollback()

                    print(
                        "Failed to restore camera setting:",
                        str(db_error)
                    )

                finally:

                    db.close()

                return {
                    "success": False,
                    "enabled": False,
                    "message": "Unable to start camera."
                }

        # ======================================================
        # CAMERA OFF
        # ======================================================

        self.camera_processing = False

        # ----------------------------------------------
        # STOP PROCESSING THREAD
        # ----------------------------------------------

        if self.camera_thread is not None:

            self.camera_thread.join(
                timeout=2
            )

            self.camera_thread = None

        # ----------------------------------------------
        # RESET CAMERA AI
        # ----------------------------------------------

        self.camera.reset()

        # ----------------------------------------------
        # STOP CAMERA STREAM
        # ----------------------------------------------

        self.camera_stream.stop()

        # ----------------------------------------------
        # CLEAR LATEST CAMERA DATA
        # ----------------------------------------------

        with self.camera_data_lock:

            self.latest_camera_data = {}

        print()
        print("==============================")
        print("CAMERA DISABLED")
        print("==============================")
        print()

        return {
            "success": True,
            "enabled": False,
            "message": "Camera monitoring disabled."
        }


    # ==========================================================
    # START ALL MONITORS
    # ==========================================================

    def start(self):

        # ------------------------------------------
        # ALREADY RUNNING
        # ------------------------------------------

        if self.running:

            print("Monitor Manager is already running.")

            return

        print()
        print("================================")
        print("Starting all monitors...")
        print("================================")
        # ==========================================
        # MARK MANAGER RUNNING
        # ==========================================

        self.running = True


        # ==========================================
        # DESKTOP
        # ==========================================

        # self.keyboard.start()
        # self.mouse.start()
        # self.screen.start()
        # self.idle.start()
        # self.application.start()
        self.apply_settings()

        # ==========================================
        # IoT
        # ==========================================

        self.iot.start()

        # ==========================================
        # SYSTEM
        # ==========================================

        self.brightness.start()
        self.battery.start()

        # ==========================================
        # START ACTIVITY DATABASE LOGGER
        # ==========================================

        self.activity_logging = True

        self.activity_thread = threading.Thread(
            target=self._activity_logging_loop,
            daemon=True
        )

        self.activity_thread.start()

        print()
        print("================================")
        print("All monitors started successfully")
        print("================================")

    # ==========================================================
    # CAMERA PROCESSING LOOP
    # ==========================================================

    def _camera_processing_loop(self):

        print("AI Camera processing thread started.")

        while self.camera_processing:

            try:

                # --------------------------------------
                # GET FRAME FROM CAMERA STREAM
                # --------------------------------------

                frame = self.camera_stream.read_frame()

                if frame is None:

                    time.sleep(0.03)

                    continue

                # --------------------------------------
                # PROCESS FRAME WITH AI
                # --------------------------------------

                camera_data = self.camera.process_frame(
                    frame
                )

                # --------------------------------------
                # SAVE LATEST CAMERA DATA
                # --------------------------------------

                if camera_data is None:

                    camera_data = {}

                with self.camera_data_lock:

                    self.latest_camera_data = dict(
                        camera_data
                    )

                # --------------------------------------
                # SMALL DELAY
                # --------------------------------------

                time.sleep(0.03)

            except Exception as e:

                print(
                    "Camera processing error:",
                    str(e)
                )

                time.sleep(0.1)

        print("AI Camera processing thread stopped.")

   
# ==========================================================
# ACTIVITY DATABASE LOGGING LOOP
# ==========================================================

    def _activity_logging_loop(self):

        print("Activity database logging thread started.")

        while self.activity_logging:

            try:

                # ------------------------------------------
                # GET CURRENT MONITORING DATA
                # ------------------------------------------

                data = self.get_data()

                # ------------------------------------------
                # CHECK USER / SESSION
                # ------------------------------------------

                if (
                    data.get("user_id") is None
                    or data.get("session_id") is None
                ):

                    print(
                        "Activity logging skipped: "
                        "no active user/session."
                    )

                    time.sleep(1)
                    continue

                # ------------------------------------------
                # SAVE TO DATABASE
                # ------------------------------------------

                result = self.monitoring_service.save_activity(

                    user_id=data["user_id"],

                    session_id=data["session_id"],

                    # DESKTOP
                    screen_time=data.get(
                        "screen_time",
                        0
                    ),

                    active_time=data.get(
                        "active_time",
                        0
                    ),

                    idle_time=data.get(
                        "idle_time",
                        0
                    ),

                    keyboard_count=data.get(
                        "keyboard_count",
                        0
                    ),

                    mouse_clicks=data.get(
                        "mouse_clicks",
                        0
                    ),

                    scroll_count=data.get(
                        "scroll_count",
                        0
                    ),

                    active_application=data.get(
                        "active_application",
                        "Unknown"
                    ),

                    application_switches=data.get(
                        "application_switches",
                        0
                    ),

                    # CAMERA
                    blink_rate=data.get(
                        "blink_rate",
                        0
                    ),

                    eye_closure=data.get(
                        "eye_closure",
                        0
                    ),

                    yawn_count=data.get(
                        "yawn_count",
                        0
                    ),

                    head_pose=data.get(
                        "head_pose",
                        "UNKNOWN"
                    ),

                    # SYSTEM
                    brightness=data.get(
                        "brightness",
                        50
                    ),

                    battery_percentage=data.get(
                        "battery_percentage",
                        100
                    ),

                    charging_status=data.get(
                        "charging_status",
                        False
                    ),

                    # IoT
                    temperature=data.get(
                        "temperature"
                    ),

                    humidity=data.get(
                        "humidity"
                    ),

                    light=data.get(
                        "light"
                    ),

                    distance=data.get(
                        "distance"
                    ),

                    motion=data.get(
                        "motion"
                    )
                )

                # ------------------------------------------
                # PRINT RESULT
                # ------------------------------------------

                if result.get("success"):

                    print(
                        "Activity saved successfully | "
                        f"session={data['session_id']} | "
                        f"activity={result.get('activity_id')}"
                    )

                else:

                    print(
                        "Activity save failed:",
                        result.get("message")
                    )

            except Exception as e:

                print(
                    "Activity logging error:",
                    str(e)
                )

            # ------------------------------------------
            # SAVE EVERY 10 SECONDS
            # ------------------------------------------

            time.sleep(10)

        print("Activity database logging thread stopped.")

    # ==========================================================
    # GET LATEST CAMERA DATA
    # ==========================================================

    def get_camera_data(self):

        with self.camera_data_lock:

            return dict(
                self.latest_camera_data
            )

    # ==========================================================
    # GET ALL MONITOR DATA
    # ==========================================================

    def get_data(self):
        settings = self.get_user_settings()
        keyboard_enabled = (
            settings is None
            or settings["keyboard_monitoring"]
        )

        mouse_enabled = (
            settings is None
            or settings["mouse_monitoring"]
        )

        screen_enabled = (
            settings is None
            or settings["screen_monitoring"]
        )

        idle_enabled = (
            settings is None
            or settings["idle_monitoring"]
        )

        application_enabled = (
            settings is None
            or settings["application_monitoring"]
        )

        webcam_enabled = (
            settings is None
            or settings["webcam_monitoring"]
        )
        # ==========================================
        # APPLICATION
        # ==========================================

        # application_data = (
        #     self.application.get_data()
        # )
        if application_enabled:

            application_data = self.application.get_data()

            active_application = application_data.get(
                "active_application",
                "Unknown"
            )

            application_switches = application_data.get(
                "application_switches",
                0
            )

        else:

            active_application = "Disabled"
            application_switches = 0

        # ==========================================
        # SCREEN / IDLE
        # ==========================================

        # screen_time = (
        #     self.screen.get_screen_time()
        # )

        # idle_time = (
        #     self.idle.get_idle_time()
        # )
        if screen_enabled:

            screen_time = self.screen.get_screen_time()

        else:

            screen_time = 0
        if idle_enabled:

            idle_time = self.idle.get_idle_time()

        else:

            idle_time = 0
        # ==========================================
        # ACTIVE TIME
        # ==========================================

        active_time = max(
            0,
            screen_time - idle_time
        )

        # ==========================================
        # BATTERY
        # ==========================================

        battery_data = (
            self.battery.get_battery_status()
        )

        # ==========================================
        # IoT
        # ==========================================

        iot_data = self.iot.get_data()
        iot_status = self.get_iot_status()
        # ==========================================
        # AI CAMERA
        # ==========================================

        camera_data = self.get_camera_data()

        if webcam_enabled:

                camera_data = self.get_camera_data()

                webcam_available = (
                    self.camera_stream.is_running()
                )

                blink_rate = camera_data.get(
                    "blink_rate",
                    0
                )

                eye_closure = camera_data.get(
                    "eye_closure",
                    0
                )

                yawn_count = camera_data.get(
                    "yawn_count",
                    0
                )

                head_pose = camera_data.get(
                    "head_pose",
                    "UNKNOWN"
                )

        else:

                webcam_available = False
                blink_rate = 0
                eye_closure = 0
                yawn_count = 0
                head_pose = "DISABLED"

        # ==========================================
        # RETURN COMPLETE DATA
        # ==========================================

        return {

            # ======================================
            # USER
            # ======================================

            "user_id":
                self.user_id,
            "session_id": self.session_id,

            # ======================================
            # DESKTOP
            # ======================================
            
            "screen_time":
                screen_time,

            "active_time":
                active_time,

            "idle_time":
                idle_time,

            # "keyboard_count":
            #     self.keyboard.get_count(),

            # "mouse_clicks":
            #     self.mouse.get_clicks(),

            # "scroll_count":
            #     self.mouse.get_scroll_count(),
            "keyboard_count":
                self.keyboard.get_count()
                if keyboard_enabled
                else 0,

            "mouse_clicks":
                self.mouse.get_clicks()
                if mouse_enabled
                else 0,

            "scroll_count":
                self.mouse.get_scroll_count()
                if mouse_enabled
                else 0,

            "active_application":
                active_application,

            "application_switches":
                application_switches,

            # ======================================
            # CAMERA
            # ======================================

            # ======================================
            # CAMERA
            # ======================================

            "webcam_available":
                webcam_available,

            "blink_rate":
                blink_rate,

            "eye_closure":
                eye_closure,

            "yawn_count":
                yawn_count,

            "head_pose":
                head_pose,
            
            # ======================================
            # IoT
            # ======================================

            "temperature":
                iot_data.get(
                    "temperature"
                ),

            "humidity":
                iot_data.get(
                    "humidity"
                ),

            "light":
                iot_data.get(
                    "light"
                ),

            "distance":
                iot_data.get(
                    "distance"
                ),

            "motion":
                iot_data.get(
                    "motion"
                ),
            "iot_live": iot_status["iot_live"],
            "iot_last_received": iot_status["iot_last_received"],
            "iot_age_seconds": iot_status["iot_age_seconds"],
            # ======================================
            # SYSTEM
            # ======================================

            "brightness":
                self.brightness.get_brightness(),

            "battery_percentage":
                battery_data.get(
                    "battery_percentage",
                    100
                ),

            "charging_status":
                battery_data.get(
                    "charging_status",
                    False
                )
        }

    # ==========================================================
    # GET LATEST CAMERA FRAME
    # ==========================================================

    def get_frame(self):

        if not self.running:

            return None

        return (
            self.camera_stream.get_latest_frame()
        )

    # ==========================================================
    # STOP ALL MONITORS
    # ==========================================================

    def stop(self):

        if not self.running:

            print(
                "Monitor Manager is not running."
            )

            return
        # ==========================================
        # STOP ACTIVITY DATABASE LOGGER
        # ==========================================

        self.activity_logging = False

        if self.activity_thread is not None:

            self.activity_thread.join(
                timeout=2
            )

            self.activity_thread = None
        print()
        print("================================")
        print("Stopping all monitors...")
        print("================================")

        # ==========================================
        # STOP CAMERA PROCESSING FIRST
        # ==========================================

        self.camera_processing = False

        if self.camera_thread is not None:

            self.camera_thread.join(
                timeout=2
            )

            self.camera_thread = None

        # ==========================================
        # DESKTOP
        # ==========================================

        self.keyboard.stop()
        self.mouse.stop()
        self.screen.stop()
        self.idle.stop()
        self.application.stop()

        # ==========================================
        # CAMERA AI
        # ==========================================

        self.camera.close()

        # ==========================================
        # CAMERA STREAM
        # ==========================================

        self.camera_stream.stop()

        # ==========================================
        # IoT
        # ==========================================

        self.iot.stop()

        # ==========================================
        # SYSTEM
        # ==========================================

        self.brightness.stop()
        self.battery.stop()

        # ==========================================
        # CLEAR CAMERA DATA
        # ==========================================

        with self.camera_data_lock:

            self.latest_camera_data = {}

        # ==========================================
        # MANAGER STATUS
        # ==========================================

        self.running = False
        self.session_id = None

        print()
        print("================================")
        print("All monitors stopped")
        print("================================")

    # ==========================================================
    # STATUS
    # ==========================================================

    def is_running(self):

        return self.running


# ==============================================================
# SHARED MONITOR MANAGER INSTANCE
# ==============================================================

monitor_manager = MonitorManager()