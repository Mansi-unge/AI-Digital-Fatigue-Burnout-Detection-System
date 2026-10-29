from winotify import Notification, audio

from dotenv import load_dotenv

import os
import time
import requests
import sys
import winreg


# ==========================================================
# PROJECT PATH
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


# ==========================================================
# LOAD ENVIRONMENT
# ==========================================================

backend_env = os.path.join(
    BASE_DIR,
    "backend",
    ".env"
)

root_env = os.path.join(
    BASE_DIR,
    ".env"
)

if os.path.exists(backend_env):
    load_dotenv(backend_env)

elif os.path.exists(root_env):
    load_dotenv(root_env)

else:
    load_dotenv()


# ==========================================================
# CONFIGURATION
# ==========================================================

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:5000"
).rstrip("/")


# ==========================================================
# DEVELOPMENT / PRODUCTION INTERVAL
# ==========================================================

DEVELOPMENT_MODE = os.getenv(
    "DEVELOPMENT_MODE",
    "true"
).lower() == "true"


# Development popup interval
# Default = 60 seconds

DEV_INTERVAL = int(
    os.getenv(
        "DEV_NOTIFICATION_INTERVAL",
        "60"
    )
)


# Production popup interval
# Default = 1500 seconds = 25 minutes

PRODUCTION_INTERVAL = int(
    os.getenv(
        "PRODUCTION_NOTIFICATION_INTERVAL",
        "1500"
    )
)


POPUP_INTERVAL = (
    DEV_INTERVAL
    if DEVELOPMENT_MODE
    else PRODUCTION_INTERVAL
)


# ==========================================================
# CURRENT MONITORING SESSION
# ==========================================================

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
            f"{BACKEND_URL}/monitoring/status",
            timeout=5
        )

        response.raise_for_status()

        data = response.json()

        # --------------------------------------------------
        # CHECK API SUCCESS
        # --------------------------------------------------

        if not data.get("success"):

            print(
                "Monitoring status request failed."
            )

            current_user_id = None
            current_session_id = None
            current_mode = None

            return False


        # --------------------------------------------------
        # CHECK WHETHER MONITORING IS RUNNING
        # --------------------------------------------------

        if not data.get("running"):

            current_user_id = None
            current_session_id = None
            current_mode = None

            print(
                "No active monitoring session."
            )

            return False


        # --------------------------------------------------
        # GET USER ID
        # --------------------------------------------------

        current_user_id = data.get(
            "user_id"
        )


        # --------------------------------------------------
        # GET SESSION ID
        # --------------------------------------------------

        current_session_id = data.get(
            "session_id"
        )


        # --------------------------------------------------
        # GET MODE
        # --------------------------------------------------

        current_mode = data.get(
            "mode"
        )


        # --------------------------------------------------
        # VALIDATE USER ID
        # --------------------------------------------------

        if current_user_id is None:

            print(
                "Active monitoring has no user_id."
            )

            current_user_id = None
            current_session_id = None
            current_mode = None

            return False


        # --------------------------------------------------
        # VALIDATE SESSION ID
        # --------------------------------------------------

        if current_session_id is None:

            print(
                "Active monitoring has no session_id."
            )

            current_user_id = None
            current_session_id = None
            current_mode = None

            return False


        # --------------------------------------------------
        # VALIDATE MODE
        # --------------------------------------------------

        if current_mode is None:

            print(
                "Active monitoring has no mode."
            )

            current_user_id = None
            current_session_id = None
            current_mode = None

            return False


        # --------------------------------------------------
        # DISPLAY CURRENT SESSION
        # --------------------------------------------------

        print(
            f"Active monitoring: "
            f"user_id={current_user_id}, "
            f"session_id={current_session_id}, "
            f"mode={current_mode}"
        )

        return True


    except requests.RequestException as e:

        print(
            "Could not connect to Flask backend."
        )

        print(
            "Error:",
            e
        )

        current_user_id = None
        current_session_id = None
        current_mode = None

        return False


    except Exception as e:

        print(
            "Monitoring status error:",
            e
        )

        current_user_id = None
        current_session_id = None
        current_mode = None

        return False


# ==========================================================
# SAVE FATIGUE RESPONSE
# ==========================================================

def save_fatigue_response(response):

    global current_user_id
    global current_session_id
    global current_mode


    print()
    print("======================================")
    print("       FATIGUE RESPONSE")
    print("======================================")

    print(
        f"Response   : {response}"
    )

    print(
        f"User ID    : {current_user_id}"
    )

    print(
        f"Session ID : {current_session_id}"
    )

    print(
        f"Mode       : {current_mode}"
    )

    print("======================================")


    # ------------------------------------------------------
    # VALIDATE USER
    # ------------------------------------------------------

    if current_user_id is None:

        print(
            "No active user."
        )

        return False


    # ------------------------------------------------------
    # VALIDATE SESSION
    # ------------------------------------------------------

    if current_session_id is None:

        print(
            "No active session."
        )

        return False


    # ------------------------------------------------------
    # IMPORTANT:
    # FATIGUE SELF-REPORT IS ONLY FOR
    # DATA COLLECTION MODE
    # ------------------------------------------------------

    if current_mode != "DATA_COLLECTION":

        print(
            "Fatigue response ignored."
        )

        print(
            "Current mode:",
            current_mode
        )

        return False


    try:

        payload = {
            "user_id": current_user_id,
            "session_id": current_session_id,
            "level": response
        }


        result = requests.post(

            f"{BACKEND_URL}/monitoring/fatigue",

            json=payload,

            timeout=5
        )


        print(
            "Backend status:",
            result.status_code
        )

        print(
            "Backend response:",
            result.text
        )


        if result.ok:

            print(
                "Fatigue response "
                "saved successfully."
            )

            return True


        else:

            print(
                "Failed to save fatigue response."
            )

            return False


    except requests.RequestException as e:

        print(
            "Backend connection error:"
        )

        print(e)

        return False


# ==========================================================
# REGISTER VITASENSE CUSTOM PROTOCOL
# ==========================================================

def register_protocol():

    protocol_name = "vitasense"


    # ------------------------------------------------------
    # USE PYTHONW.EXE
    # ------------------------------------------------------

    python_executable = os.path.join(
        os.path.dirname(sys.executable),
        "pythonw.exe"
    )


    # ------------------------------------------------------
    # FALLBACK
    # ------------------------------------------------------

    if not os.path.exists(
        python_executable
    ):

        python_executable = sys.executable


    # ------------------------------------------------------
    # CURRENT SCRIPT
    # ------------------------------------------------------

    script_path = os.path.abspath(
        __file__
    )


    # ------------------------------------------------------
    # WINDOWS PROTOCOL COMMAND
    # ------------------------------------------------------

    command = (
        f'"{python_executable}" '
        f'"{script_path}" '
        f'"%1"'
    )


    try:

        # ==================================================
        # PROTOCOL ROOT
        # ==================================================

        with winreg.CreateKey(
            winreg.HKEY_CURRENT_USER,
            rf"Software\Classes\{protocol_name}"
        ) as key:

            winreg.SetValue(
                key,
                "",
                winreg.REG_SZ,
                "VitaSense Fatigue Response"
            )

            winreg.SetValueEx(
                key,
                "URL Protocol",
                0,
                winreg.REG_SZ,
                ""
            )


        # ==================================================
        # OPEN COMMAND
        # ==================================================

        with winreg.CreateKey(
            winreg.HKEY_CURRENT_USER,
            rf"Software\Classes\{protocol_name}"
            rf"\shell\open\command"
        ) as key:

            winreg.SetValue(
                key,
                "",
                winreg.REG_SZ,
                command
            )


        print(
            "VitaSense protocol registered."
        )


    except Exception as e:

        print(
            "Could not register VitaSense protocol:"
        )

        print(e)


# ==========================================================
# HANDLE VITASENSE PROTOCOL
# ==========================================================

def handle_protocol_url(url):

    # ------------------------------------------------------
    # Validate protocol
    # ------------------------------------------------------

    if not url.startswith(
        "vitasense://fatigue"
    ):

        return


    # ------------------------------------------------------
    # DETERMINE RESPONSE
    # ------------------------------------------------------

    if "response=healthy" in url:

        response = "healthy"


    elif "response=mild" in url:

        response = "mild"


    elif "response=high" in url:

        response = "high"


    else:

        return


    # ------------------------------------------------------
    # GET CURRENT SESSION AGAIN
    #
    # Protocol opens a NEW Python process.
    # Therefore we must query Flask again.
    # ------------------------------------------------------

    if not get_current_monitoring():

        print(
            "No active monitoring session."
        )

        return


    # ------------------------------------------------------
    # IMPORTANT:
    # NEVER SAVE FATIGUE RESPONSE IN AI MODE
    # ------------------------------------------------------

    if current_mode != "DATA_COLLECTION":

        print(
            "Ignoring fatigue response."
        )

        print(
            "Current monitoring mode:",
            current_mode
        )

        return


    # ------------------------------------------------------
    # SAVE RESPONSE
    # ------------------------------------------------------

    save_fatigue_response(
        response
    )


# ==========================================================
# SHOW WINDOWS NOTIFICATION
# ==========================================================

def show_fatigue_notification():

    toast = Notification(

        app_id=(
            "AI Digital Fatigue Monitoring"
        ),

        title="Fatigue Check",

        msg=(
            "How are you feeling right now?"
        ),

        duration="long"
    )


    # ------------------------------------------------------
    # NOTIFICATION SOUND
    # ------------------------------------------------------

    toast.set_audio(
        audio.Default,
        loop=False
    )


    # ======================================================
    # HEALTHY
    # ======================================================

    toast.add_actions(

        label="Healthy",

        launch=(
            "vitasense://fatigue"
            "?response=healthy"
        )
    )


    # ======================================================
    # MILD
    # ======================================================

    toast.add_actions(

        label="Mild",

        launch=(
            "vitasense://fatigue"
            "?response=mild"
        )
    )


    # ======================================================
    # HIGH FATIGUE
    # ======================================================

    toast.add_actions(

        label="High Fatigue",

        launch=(
            "vitasense://fatigue"
            "?response=high"
        )
    )


    # ------------------------------------------------------
    # SHOW NOTIFICATION
    # ------------------------------------------------------

    toast.show()


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":


    # ======================================================
    # CHECK FOR PROTOCOL ACTIVATION FIRST
    # ======================================================

    if len(sys.argv) > 1:

        protocol_url = sys.argv[1]

        handle_protocol_url(
            protocol_url
        )

        sys.exit(0)


    # ======================================================
    # NORMAL NOTIFICATION AGENT
    # ======================================================

    print()
    print("======================================")
    print(" AI DIGITAL FATIGUE MONITORING")
    print(" Native Windows Fatigue Notification")
    print("======================================")
    print()


    print(
        "Backend URL:",
        BACKEND_URL
    )

    print()


    # ======================================================
    # DISPLAY MODE
    # ======================================================

    if DEVELOPMENT_MODE:

        print(
            "MODE: DEVELOPMENT"
        )

        print(
            "Popup interval:",
            DEV_INTERVAL,
            "seconds"
        )

    else:

        print(
            "MODE: PRODUCTION"
        )

        print(
            "Popup interval:",
            PRODUCTION_INTERVAL,
            "seconds"
        )


    print()


    # ======================================================
    # REGISTER PROTOCOL
    # ======================================================

    register_protocol()

    print()


    # ======================================================
    # START NORMAL AGENT
    # ======================================================

    print(
        "Notification agent started."
    )

    print(
        "Waiting for active monitoring..."
    )

    print()


    # ======================================================
    # CONTINUOUS LOOP
    # ======================================================

    try:

        while True:

            # ------------------------------------------------
            # CHECK ACTIVE MONITORING
            # ------------------------------------------------

            monitoring_active = (
                get_current_monitoring()
            )


            # ------------------------------------------------
            # SHOW POPUP ONLY IN DATA COLLECTION MODE
            # ------------------------------------------------

            if monitoring_active:

                if current_mode == "DATA_COLLECTION":

                    print(
                        "Data Collection mode detected."
                    )

                    print(
                        "Sending fatigue notification..."
                    )

                    show_fatigue_notification()

                    print(
                        f"Next notification in "
                        f"{POPUP_INTERVAL} seconds."
                    )


                elif current_mode == "AI_MONITORING":

                    print(
                        "AI Monitoring mode detected."
                    )

                    print(
                        "Fatigue self-report popup skipped."
                    )


                else:

                    print(
                        f"Unknown monitoring mode: "
                        f"{current_mode}"
                    )

                    print(
                        "Fatigue popup skipped."
                    )


            else:

                print(
                    "Popup skipped."
                )

                print(
                    "Monitoring is not active."
                )


            # ------------------------------------------------
            # WAIT BEFORE NEXT CHECK
            # ------------------------------------------------

            time.sleep(
                POPUP_INTERVAL
            )


    except KeyboardInterrupt:

        print()

        print(
            "Notification agent stopped."
        )