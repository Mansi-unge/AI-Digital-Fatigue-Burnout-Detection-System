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

        # Prevent simultaneous database activity saves
        self.activity_save_lock = threading.Lock()

        # Allows the activity logger to stop immediately
        self.activity_stop_event = threading.Event()

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
            # ==========================================
        # REAL MONITORING TRANSITION STATUS
        # ==========================================

        self.transition_lock = threading.Lock()

        self.transition_status = {
            "phase": "idle",
            "steps": {},
            "message": "",
            "updated_at": None,
            "error": None
        }

        self.camera_frame_received = False
        self.camera_ai_frame_processed = False
    # ==========================================================
    # SET CURRENT USER
    # ==========================================================

    def set_user(self, user_id, session_id=None):

        self.user_id = user_id
        self.session_id = session_id
        with self.iot_lock:
            self.iot_last_received_at = None
            self.iot_last_received_monotonic = None
        # ==========================================================
    # REAL TRANSITION STATUS
    # ==========================================================

    # ==========================================================
    # REAL MONITORING TRANSITION STATUS
    # ==========================================================

    def start_transition(self):
        from datetime import datetime, timezone

        with self.transition_lock:
            self.transition_status = {
                "phase": "starting",
                "steps": {
                    "desktop": {"status": "pending", "message": "Waiting for desktop monitors."},
                    "iot": {"status": "pending", "message": "Waiting for the first valid ESP32 packet."},
                    "camera_ai": {"status": "pending", "message": "Waiting for a camera frame and AI processing."},
                    "session": {"status": "pending", "message": "Waiting for the database session to become active."}
                },
                "message": "Starting monitoring...",
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "error": None
            }

        self.camera_frame_received = False
        self.camera_ai_frame_processed = False

    def stop_transition(self):
        from datetime import datetime, timezone

        with self.transition_lock:
            self.transition_status = {
                "phase": "stopping",
                "steps": {
                    "save_data": {"status": "pending", "message": "Waiting to save the final activity snapshot."},
                    "stop_camera_ai": {"status": "pending", "message": "Waiting to stop camera AI and its stream."},
                    "stop_desktop": {"status": "pending", "message": "Waiting to stop desktop monitors."},
                    "stop_iot": {"status": "pending", "message": "Waiting to stop the ESP32 listener."},
                    "close_session": {"status": "pending", "message": "Waiting for the database session to close."}
                },
                "message": "Stopping monitoring...",
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "error": None
            }

    def update_transition_step(self, step, status, message=None):
        """
        Update one transition step.

        `status` accepts: pending, in_progress, completed, skipped, error.
        For compatibility with older call sites, True maps to completed
        and False maps to pending.
        """
        from datetime import datetime, timezone

        if isinstance(status, bool):
            status = "completed" if status else "pending"

        allowed_statuses = {
            "pending", "in_progress", "completed", "skipped", "error"
        }
        if status not in allowed_statuses:
            status = "error"

        with self.transition_lock:
            steps = self.transition_status.get("steps", {})
            if step not in steps:
                return

            existing = steps[step]
            if not isinstance(existing, dict):
                existing = {"status": "pending", "message": ""}

            existing["status"] = status
            if message is not None:
                existing["message"] = str(message)

            steps[step] = existing
            if message is not None:
                self.transition_status["message"] = str(message)

            self.transition_status["updated_at"] = (
                datetime.now(timezone.utc).isoformat()
            )

    def set_transition_phase(self, phase, message=None, error=None):
        from datetime import datetime, timezone

        with self.transition_lock:
            self.transition_status["phase"] = phase

            if message is not None:
                self.transition_status["message"] = message

            self.transition_status["error"] = error
            self.transition_status["updated_at"] = (
                datetime.now(timezone.utc).isoformat()
            )

    def get_transition_status(self):
        with self.transition_lock:
            return {
                "phase": self.transition_status["phase"],
                "steps": {
                    key: dict(value) if isinstance(value, dict) else {
                        "status": "completed" if value else "pending",
                        "message": ""
                    }
                    for key, value in self.transition_status["steps"].items()
                },
                "message": self.transition_status["message"],
                "updated_at": self.transition_status["updated_at"],
                "error": self.transition_status["error"]
            }

    # ==========================================================
    # CHECK ACTUAL DESKTOP MONITOR STATUS
    # ==========================================================

    def get_desktop_monitor_status(self):

        settings = self.get_user_settings()

        if settings is None:
            return False

        setting_mapping = [
            ("keyboard_monitoring", self.keyboard),
            ("mouse_monitoring", self.mouse),
            ("screen_monitoring", self.screen),
            ("idle_monitoring", self.idle),
            ("application_monitoring", self.application)
        ]

        for setting_name, monitor in setting_mapping:

            if settings.get(setting_name, False):

                if not getattr(monitor, "running", False):
                    return False

        return True
        
    def mark_iot_data_received(self):
        """Record a valid ESP32 packet received by the backend."""

        from datetime import datetime, timezone

        with self.iot_lock:
            self.iot_last_received_at = datetime.now(timezone.utc)
            self.iot_last_received_monotonic = time.monotonic()

        if self.running:
            self.update_transition_step(
                "iot",
                "completed",
                "ESP32 sensor data received successfully."
            )

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

            self.update_transition_step(
                "camera_ai",
                "skipped",
                "Camera AI is disabled in monitoring settings."
            )

            # ----------------------------------------------
            # STOP CAMERA PROCESSING
            # ----------------------------------------------

            self.camera_processing = False

            if self.camera_thread is not None:

                self.camera_thread.join(timeout=2)
                if self.camera_thread.is_alive():
                    raise RuntimeError(
                        "Camera processing thread did not stop."
                    )
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

                    self.camera_thread.join(timeout=5)
                    if self.camera_thread.is_alive():
                        raise RuntimeError(
                            "Camera processing thread did not stop."
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

            self.camera_thread.join(timeout=5)
            if self.camera_thread.is_alive():
                return {
                    "success": False,
                    "enabled": True,
                    "message": "Camera processing thread did not stop."
                }
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

        self.camera_frame_received = False
        self.camera_ai_frame_processed = False
        # ==========================================
        # DESKTOP
        # ==========================================

        # self.keyboard.start()
        # self.mouse.start()
        # self.screen.start()
        # self.idle.start()
        # self.application.start()
        self.apply_settings()

        desktop_ok = self.get_desktop_monitor_status()
        self.update_transition_step(
            "desktop",
            "completed" if desktop_ok else "error",
            "Desktop monitors are running." if desktop_ok
            else "One or more enabled desktop monitors did not start."
        )

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

        self.activity_stop_event.clear()
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
    # ==========================================================
    # CAMERA PROCESSING LOOP
    # ==========================================================

    def _camera_processing_loop(self):

        print("AI Camera processing thread started.")

        while self.camera_processing:

            try:

                # --------------------------------------
                # GET REAL CAMERA FRAME
                # --------------------------------------

                frame = self.camera_stream.read_frame()

                if frame is None:
                    time.sleep(0.03)
                    continue

                self.camera_frame_received = True

                # --------------------------------------
                # PROCESS FRAME WITH AI
                # --------------------------------------

                camera_data = self.camera.process_frame(frame)

                self.camera_ai_frame_processed = True

                self.update_transition_step(
                    "camera_ai",
                    "completed",
                    "Camera frame received and AI processing completed."
                )

                # --------------------------------------
                # SAVE LATEST CAMERA DATA
                # --------------------------------------

                if camera_data is None:
                    camera_data = {}

                with self.camera_data_lock:
                    self.latest_camera_data = dict(camera_data)

                time.sleep(0.03)

            except Exception as e:

                print(
                    "Camera processing error:",
                    str(e)
                )

                time.sleep(0.1)

        print("AI Camera processing thread stopped.")
    
    def _save_activity_snapshot(self, force=False):

        with self.activity_save_lock:

            if self.activity_stop_event.is_set() and not force:
                return False

            try:
                data = self.get_data()

                if (
                    data.get("user_id") is None
                    or data.get("session_id") is None
                ):
                    print("Activity save skipped: no active session.")
                    return False

                result = self.monitoring_service.save_activity(
                    user_id=data["user_id"],
                    session_id=data["session_id"],

                    screen_time=data.get("screen_time", 0),
                    active_time=data.get("active_time", 0),
                    idle_time=data.get("idle_time", 0),

                    keyboard_count=data.get("keyboard_count", 0),
                    mouse_clicks=data.get("mouse_clicks", 0),
                    scroll_count=data.get("scroll_count", 0),

                    active_application=data.get(
                        "active_application", "Unknown"
                    ),
                    application_switches=data.get(
                        "application_switches", 0
                    ),

                    blink_rate=data.get("blink_rate", 0),
                    eye_closure=data.get("eye_closure", 0),
                    yawn_count=data.get("yawn_count", 0),
                    head_pose=data.get("head_pose", "UNKNOWN"),

                    brightness=data.get("brightness", 50),
                    battery_percentage=data.get(
                        "battery_percentage", 100
                    ),
                    charging_status=data.get("charging_status", False),

                    temperature=data.get("temperature"),
                    humidity=data.get("humidity"),
                    light=data.get("light"),
                    distance=data.get("distance"),
                    motion=data.get("motion")
                )

                if not isinstance(result, dict) or not result.get("success"):
                    print(
                        "Activity save failed:",
                        result.get("message") if isinstance(result, dict)
                        else "Invalid save response"
                    )
                    return False

                print(
                    "Activity saved successfully | "
                    f"session={data['session_id']} | "
                    f"activity={result.get('activity_id')}"
                )

                return True

            except Exception as e:
                print("Activity snapshot error:", str(e))
                return False
        
        
    # ==========================================================
    # ACTIVITY DATABASE LOGGING LOOP
    # ==========================================================

    def _activity_logging_loop(self):

        print("Activity database logging thread started.")

        while not self.activity_stop_event.is_set():

            # Save one regular activity snapshot
            self._save_activity_snapshot()

            # Wait 10 seconds, but wake immediately on shutdown
            if self.activity_stop_event.wait(10):
                break

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
        """
        Stop all monitoring components and return a structured result.

        IMPORTANT:
        Do not clear self.session_id here. The Flask /monitoring/stop route
        still needs it to close the database MonitoringSession after the
        final activity snapshot has been saved.
        """
        if not self.running:
            message = "Monitor Manager is not running."
            print(message)
            return {
                "success": False,
                "message": message,
                "errors": [message]
            }

        print()
        print("================================")
        print("Stopping all monitors...")
        print("================================")

        errors = []

        # 1. Stop new periodic logger iterations and wait for any current save.
        self.activity_logging = False
        self.activity_stop_event.set()

        if self.activity_thread is not None:
            self.activity_thread.join(timeout=15)
            if self.activity_thread.is_alive():
                errors.append("Activity logger thread did not stop.")
            else:
                self.activity_thread = None

        # 2. Save the final snapshot while the camera and other data sources
        #    are still available. Do not mark the step completed on failure.
        self.update_transition_step(
            "save_data", "in_progress", "Saving the final activity snapshot."
        )
        print("Saving final activity snapshot...")
        snapshot_saved = self._save_activity_snapshot(force=True)

        if snapshot_saved:
            self.update_transition_step(
                "save_data", "completed",
                "Final activity snapshot saved successfully."
            )
        else:
            errors.append("Final activity snapshot could not be saved.")
            self.update_transition_step(
                "save_data", "error",
                "Final activity snapshot could not be saved."
            )

        # 3. Stop the AI processing thread before releasing camera resources.
        self.update_transition_step(
            "stop_camera_ai", "in_progress",
            "Stopping camera AI processing and camera stream."
        )
        self.camera_processing = False

        camera_thread_stopped = True
        if self.camera_thread is not None:
            self.camera_thread.join(timeout=5)
            camera_thread_stopped = not self.camera_thread.is_alive()
            if camera_thread_stopped:
                self.camera_thread = None
            else:
                errors.append("Camera processing thread did not stop.")

        if camera_thread_stopped:
            try:
                self.camera.close()
                self.camera_stream.stop()
                with self.camera_data_lock:
                    self.latest_camera_data = {}
                self.update_transition_step(
                    "stop_camera_ai", "completed",
                    "Camera AI processing and stream stopped."
                )
            except Exception as exc:
                errors.append(f"Camera shutdown failed: {exc}")
                self.update_transition_step(
                    "stop_camera_ai", "error",
                    f"Camera shutdown failed: {exc}"
                )
        else:
            self.update_transition_step(
                "stop_camera_ai", "error",
                "Camera processing thread is still running; camera resources were not released."
            )

        # 4. Stop desktop monitors and verify their running flags.
        self.update_transition_step(
            "stop_desktop", "in_progress", "Stopping desktop monitors."
        )
        desktop_stop_errors = []
        for name, monitor in (
            ("keyboard", self.keyboard),
            ("mouse", self.mouse),
            ("screen", self.screen),
            ("idle", self.idle),
            ("application", self.application),
        ):
            try:
                monitor.stop()
                if getattr(monitor, "running", False):
                    desktop_stop_errors.append(f"{name} monitor is still running.")
            except Exception as exc:
                desktop_stop_errors.append(f"{name} monitor stop failed: {exc}")

        if desktop_stop_errors:
            errors.extend(desktop_stop_errors)
            self.update_transition_step(
                "stop_desktop", "error", " ".join(desktop_stop_errors)
            )
        else:
            self.update_transition_step(
                "stop_desktop", "completed", "All desktop monitors stopped."
            )

        # 5. Stop IoT and system monitors.
        self.update_transition_step(
            "stop_iot", "in_progress", "Stopping the ESP32 listener."
        )
        try:
            self.iot.stop()
            iot_running = (
                self.iot.is_running()
                if callable(getattr(self.iot, "is_running", None))
                else bool(getattr(self.iot, "running", False))
            )
            if iot_running:
                raise RuntimeError("IoT monitor is still running.")

            self.update_transition_step(
                "stop_iot", "completed", "ESP32 listener stopped."
            )
        except Exception as exc:
            errors.append(f"IoT shutdown failed: {exc}")
            self.update_transition_step(
                "stop_iot", "error", f"IoT shutdown failed: {exc}"
            )

        for monitor_name, monitor in (
            ("brightness", self.brightness),
            ("battery", self.battery),
        ):
            try:
                monitor.stop()
            except Exception as exc:
                errors.append(f"{monitor_name} monitor stop failed: {exc}")

        # Keep the session_id intact for the Flask route to close the DB row.
        self.running = False

        if errors:
            message = "Monitoring stopped with one or more errors."
            self.set_transition_phase(
                "error", message=message, error="; ".join(errors)
            )
            print(message)
            for error in errors:
                print("STOP ERROR:", error)
            return {
                "success": False,
                "message": message,
                "errors": errors
            }

        message = "All monitoring components stopped successfully."
        self.set_transition_phase("stopped", message=message, error=None)

        print()
        print("================================")
        print("All monitors stopped")
        print("================================")

        return {
            "success": True,
            "message": message,
            "errors": []
        }

    # ==========================================================
    # STATUS
    # ==========================================================

    def is_running(self):

        return self.running


# ==============================================================
# SHARED MONITOR MANAGER INSTANCE
# ==============================================================

monitor_manager = MonitorManager()