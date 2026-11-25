
import os
import sys
import time
from urllib.parse import urlparse, parse_qs

import requests
import winreg
from dotenv import load_dotenv
from winotify import Notification, audio


# ==========================================================
# PROJECT PATHS AND ENVIRONMENT
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

backend_env = os.path.join(BASE_DIR, "backend", ".env")
root_env = os.path.join(BASE_DIR, ".env")

if os.path.exists(backend_env):
    load_dotenv(backend_env)
elif os.path.exists(root_env):
    load_dotenv(root_env)
else:
    load_dotenv()


# ==========================================================
# ENVIRONMENT CONFIGURATION
# ==========================================================

def get_required_env(name):
    value = os.getenv(name)

    if value is None or not value.strip():
        raise RuntimeError(
            f"Missing required environment variable: {name}"
        )

    return value.strip()


VITE_API_URL = get_required_env("VITE_API_URL").rstrip("/")

FRONTEND_NOTIFICATIONS_URL = get_required_env(
    "FRONTEND_NOTIFICATIONS_URL"
)

FATIGUE_APP_ID = get_required_env("FATIGUE_APP_ID")
RECOMMENDATION_APP_ID = get_required_env("RECOMMENDATION_APP_ID")

PROTOCOL_NAME = get_required_env("VITASENSE_PROTOCOL")

REQUEST_TIMEOUT_SECONDS = float(
    get_required_env("REQUEST_TIMEOUT_SECONDS")
)

STATUS_CHECK_INTERVAL = float(
    get_required_env("STATUS_CHECK_INTERVAL_SECONDS")
)

NOTIFICATION_POLL_INTERVAL = float(
    get_required_env("NOTIFICATION_POLL_INTERVAL_SECONDS")
)

LOOP_SLEEP_SECONDS = float(
    get_required_env("AGENT_LOOP_SLEEP_SECONDS")
)

DEVELOPMENT_MODE = (
    get_required_env("DEVELOPMENT_MODE").lower() == "true"
)

DEV_NOTIFICATION_INTERVAL = float(
    get_required_env("DEV_NOTIFICATION_INTERVAL_SECONDS")
)

PRODUCTION_NOTIFICATION_INTERVAL = float(
    get_required_env("PRODUCTION_NOTIFICATION_INTERVAL_SECONDS")
)

POPUP_INTERVAL = (
    DEV_NOTIFICATION_INTERVAL
    if DEVELOPMENT_MODE
    else PRODUCTION_NOTIFICATION_INTERVAL
)

SHOWN_NOTIFICATION_IDS_FILE = get_required_env(
    "SHOWN_RECOMMENDATION_NOTIFICATION_IDS_FILE"
)

if not os.path.isabs(SHOWN_NOTIFICATION_IDS_FILE):
    SHOWN_NOTIFICATION_IDS_FILE = os.path.join(
        BASE_DIR,
        SHOWN_NOTIFICATION_IDS_FILE,
    )


# ==========================================================
# IMPORT RECOMMENDATION NOTIFICATION HELPER
# ==========================================================

from recommendation_notification import RecommendationNotificationManager


recommendation_manager = RecommendationNotificationManager(
    backend_url=VITE_API_URL,
    app_id=RECOMMENDATION_APP_ID,
    frontend_notifications_url=FRONTEND_NOTIFICATIONS_URL,
    shown_ids_file=SHOWN_NOTIFICATION_IDS_FILE,
    request_timeout=REQUEST_TIMEOUT_SECONDS,
)


# ==========================================================
# CURRENT MONITORING SESSION
# ==========================================================

current_user_id = None
current_session_id = None
current_mode = None


def clear_current_monitoring():
    global current_user_id
    global current_session_id
    global current_mode

    current_user_id = None
    current_session_id = None
    current_mode = None


# ==========================================================
# GET CURRENT MONITORING SESSION
# ==========================================================

def get_current_monitoring():
    global current_user_id
    global current_session_id
    global current_mode

    try:
        response = requests.get(
            f"{VITE_API_URL}/monitoring/status",
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        response.raise_for_status()
        data = response.json()

        if not data.get("success") or not data.get("running"):
            clear_current_monitoring()
            return False

        user_id = data.get("user_id")
        session_id = data.get("session_id")
        mode = str(data.get("mode") or "").upper()

        if user_id is None or session_id is None or not mode:
            print("Active monitoring session has incomplete information.")
            clear_current_monitoring()
            return False

        current_user_id = user_id
        current_session_id = session_id
        current_mode = mode

        return True

    except requests.RequestException as error:
        print("Could not retrieve monitoring status:", error)
        clear_current_monitoring()
        return False

    except (ValueError, TypeError) as error:
        print("Invalid monitoring status response:", error)
        clear_current_monitoring()
        return False


# ==========================================================
# SAVE DATA COLLECTION FATIGUE RESPONSE
# ==========================================================

def save_fatigue_response(fatigue_level):
    if current_user_id is None or current_session_id is None:
        print("Cannot save fatigue response: no active session.")
        return False

    if current_mode != "DATA_COLLECTION":
        print("Fatigue response ignored outside Data Collection mode.")
        return False

    payload = {
        "user_id": current_user_id,
        "session_id": current_session_id,
        "level": fatigue_level,
    }

    try:
        response = requests.post(
            f"{VITE_API_URL}/monitoring/fatigue",
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )

        print("Fatigue response HTTP status:", response.status_code)
        print("Fatigue response backend result:", response.text)

        if response.ok:
            print("Fatigue response saved successfully.")
            return True

        print("Could not save fatigue response.")
        return False

    except requests.RequestException as error:
        print("Fatigue response request failed:", error)
        return False


# ==========================================================
# REGISTER WINDOWS CUSTOM PROTOCOL
# ==========================================================

def register_protocol():
    python_executable = os.path.join(
        os.path.dirname(sys.executable),
        "pythonw.exe",
    )

    if not os.path.exists(python_executable):
        python_executable = sys.executable

    script_path = os.path.abspath(__file__)

    command = (
        f'"{python_executable}" '
        f'"{script_path}" '
        f'"%1"'
    )

    protocol_registry_path = (
        rf"Software\Classes\{PROTOCOL_NAME}"
    )

    command_registry_path = (
        rf"Software\Classes\{PROTOCOL_NAME}\shell\open\command"
    )

    try:
        with winreg.CreateKey(
            winreg.HKEY_CURRENT_USER,
            protocol_registry_path,
        ) as key:
            winreg.SetValueEx(
                key,
                "",
                0,
                winreg.REG_SZ,
                "VitaSense Fatigue Response",
            )

            winreg.SetValueEx(
                key,
                "URL Protocol",
                0,
                winreg.REG_SZ,
                "",
            )

        with winreg.CreateKey(
            winreg.HKEY_CURRENT_USER,
            command_registry_path,
        ) as key:
            winreg.SetValueEx(
                key,
                "",
                0,
                winreg.REG_SZ,
                command,
            )

        print("VitaSense custom protocol registered.")

    except OSError as error:
        print("Could not register VitaSense protocol:", error)


# ==========================================================
# HANDLE FATIGUE RESPONSE PROTOCOL
# ==========================================================

def handle_protocol_url(protocol_url):
    parsed_url = urlparse(protocol_url)

    if parsed_url.scheme.lower() != PROTOCOL_NAME.lower():
        return

    if parsed_url.netloc.lower() != "fatigue":
        return

    query_parameters = parse_qs(parsed_url.query)
    fatigue_level = query_parameters.get("response", [None])[0]

    allowed_responses = {
        "healthy",
        "mild",
        "high",
    }

    if fatigue_level not in allowed_responses:
        print("Invalid fatigue response received.")
        return

    # The protocol opens a new process, so retrieve the active
    # monitoring session again before saving the response.
    if not get_current_monitoring():
        print("No active monitoring session for fatigue response.")
        return

    if current_mode != "DATA_COLLECTION":
        print("Ignoring fatigue response outside Data Collection mode.")
        return

    save_fatigue_response(fatigue_level)


# ==========================================================
# SHOW DATA COLLECTION FATIGUE POPUP
# ==========================================================

def show_fatigue_notification():
    try:
        toast = Notification(
            app_id=FATIGUE_APP_ID,
            title="Fatigue Check",
            msg="How are you feeling right now?",
            duration="long",
        )

        toast.set_audio(
            audio.Default,
            loop=False,
        )

        toast.add_actions(
            label="Healthy",
            launch=f"{PROTOCOL_NAME}://fatigue?response=healthy",
        )

        toast.add_actions(
            label="Mild",
            launch=f"{PROTOCOL_NAME}://fatigue?response=mild",
        )

        toast.add_actions(
            label="High Fatigue",
            launch=f"{PROTOCOL_NAME}://fatigue?response=high",
        )

        toast.show()

        print("Data Collection fatigue popup displayed.")
        return True

    except Exception as error:
        print("Could not display fatigue popup:", error)
        return False


# ==========================================================
# MAIN AGENT
# ==========================================================

def run_notification_agent():
    print()
    print("======================================")
    print("VITASENSE DESKTOP NOTIFICATION AGENT")
    print("======================================")
    print("Backend URL:", VITE_API_URL)
    print("Development mode:", DEVELOPMENT_MODE)
    print("Data Collection popup interval:", POPUP_INTERVAL)
    print("AI recommendation polling interval:", NOTIFICATION_POLL_INTERVAL)
    print("Monitoring status interval:", STATUS_CHECK_INTERVAL)
    print()

    register_protocol()

    print("Notification agent started.")
    print("Waiting for an active monitoring session...")
    print()

    last_status_check = 0
    last_fatigue_popup = 0
    last_recommendation_poll = 0

    active_session_key = None

    try:
        while True:
            current_time = time.monotonic()

            # ----------------------------------------------
            # REFRESH MONITORING STATUS
            # ----------------------------------------------

            if (
                current_time - last_status_check
                >= STATUS_CHECK_INTERVAL
            ):
                monitoring_active = get_current_monitoring()
                last_status_check = time.monotonic()

                if monitoring_active:
                    new_session_key = (
                        current_user_id,
                        current_session_id,
                        current_mode,
                    )

                    if new_session_key != active_session_key:
                        print(
                            "Monitoring session changed:",
                            new_session_key,
                        )

                        active_session_key = new_session_key
                        last_fatigue_popup = 0
                        last_recommendation_poll = 0

                else:
                    if active_session_key is not None:
                        print("Monitoring session is no longer active.")

                    active_session_key = None

            # ----------------------------------------------
            # DATA COLLECTION MODE
            # ----------------------------------------------

            if (
                current_user_id is not None
                and current_mode == "DATA_COLLECTION"
            ):
                current_time = time.monotonic()

                if (
                    current_time - last_fatigue_popup
                    >= POPUP_INTERVAL
                ):
                    print("Data Collection mode: sending fatigue popup.")

                    show_fatigue_notification()
                    last_fatigue_popup = time.monotonic()

            # ----------------------------------------------
            # AI MONITORING MODE
            # ----------------------------------------------

            elif (
                current_user_id is not None
                and current_mode == "AI_MONITORING"
            ):
                current_time = time.monotonic()

                if (
                    current_time - last_recommendation_poll
                    >= NOTIFICATION_POLL_INTERVAL
                ):
                    print(
                        "AI Monitoring mode: checking recommendation notifications."
                    )

                    recommendation_manager.check_new_notifications(
                        current_user_id
                    )

                    last_recommendation_poll = time.monotonic()

            time.sleep(LOOP_SLEEP_SECONDS)

    except KeyboardInterrupt:
        print()
        print("VitaSense notification agent stopped.")


# ==========================================================
# ENTRY POINT
# ==========================================================

if __name__ == "__main__":
    # Windows launches a new process when a user clicks one of
    # the fatigue response buttons. Handle that URL and exit.
    if len(sys.argv) > 1:
        handle_protocol_url(sys.argv[1])
        sys.exit(0)

    run_notification_agent()
