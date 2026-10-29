import json
import os
import time
import threading
import webbrowser
from urllib.parse import quote

import requests
from winotify import Notification, audio


# ==========================================================
# CONFIGURATION
# ==========================================================

BACKEND_URL = "http://127.0.0.1:5000"

USER_ID = 4

CHECK_INTERVAL = 10

APP_ID = "VitaSense"

FRONTEND_NOTIFICATIONS_URL = (
    "http://localhost:5173/notifications"
)

SEEN_FILE = os.path.join(
    os.path.dirname(__file__),
    "shown_notification_ids.json"
)


# ==========================================================
# LOAD SHOWN NOTIFICATION IDS
# ==========================================================

def load_shown_ids():

    if not os.path.exists(SEEN_FILE):
        return set()

    try:

        with open(
            SEEN_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

            return set(data)

    except Exception as e:

        print(
            "Could not load shown notification IDs:",
            e
        )

        return set()


# ==========================================================
# SAVE SHOWN NOTIFICATION IDS
# ==========================================================

def save_shown_ids(shown_ids):

    try:

        with open(
            SEEN_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                list(shown_ids),
                file
            )

    except Exception as e:

        print(
            "Could not save shown notification IDs:",
            e
        )


# ==========================================================
# OPEN NOTIFICATIONS PAGE
# ==========================================================

def open_notifications():

    webbrowser.open(
        FRONTEND_NOTIFICATIONS_URL
    )


# ==========================================================
# SHOW WINDOWS NOTIFICATION
# ==========================================================

def show_notification(notification):

    notification_id = notification.get("id")

    title = notification.get(
        "title",
        "VitaSense Recommendation"
    )

    message = notification.get(
        "message",
        "You have a new recommendation."
    )

    priority = notification.get(
        "priority",
        "Medium"
    )

    notification_type = notification.get(
        "type",
        "General"
    )

    toast = Notification(
        app_id=APP_ID,
        title=title,
        msg=message
    )

    # ======================================================
    # OPEN NOTIFICATIONS PAGE
    # ======================================================

    toast.add_actions(
        label="View Notification",
        launch=FRONTEND_NOTIFICATIONS_URL
    )

    # ======================================================
    # SOUND
    # ======================================================

    toast.set_audio(
        audio.Default,
        loop=False
    )

    toast.show()

    print(
        f"Desktop notification shown: "
        f"id={notification_id}, "
        f"type={notification_type}, "
        f"priority={priority}"
    )


# ==========================================================
# GET UNREAD NOTIFICATIONS
# ==========================================================

def get_unread_notifications():

    url = (
        f"{BACKEND_URL}"
        f"/notifications/unread"
    )

    try:

        response = requests.get(
            url,
            params={
                "user_id": USER_ID
            },
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        if not data.get("success"):

            print(
                "Notification API returned failure:",
                data
            )

            return []

        return data.get(
            "notifications",
            []
        )

    except requests.exceptions.RequestException as e:

        print(
            "Notification API unavailable:",
            e
        )

        return []

    except Exception as e:

        print(
            "Notification error:",
            e
        )

        return []


# ==========================================================
# INITIALIZE EXISTING NOTIFICATIONS
# ==========================================================

def initialize_existing_notifications(
    shown_ids
):

    notifications = get_unread_notifications()

    for notification in notifications:

        notification_id = notification.get("id")

        if notification_id is not None:

            shown_ids.add(notification_id)

    save_shown_ids(shown_ids)

    print(
        f"Initialized {len(notifications)} "
        f"existing unread notifications."
    )


# ==========================================================
# MONITOR FOR NEW NOTIFICATIONS
# ==========================================================

def monitor_notifications():

    shown_ids = load_shown_ids()

    # ------------------------------------------------------
    # Important:
    # Existing unread notifications should NOT immediately
    # produce popups when the agent starts.
    # Only newly detected notifications will popup.
    # ------------------------------------------------------

    if not shown_ids:

        initialize_existing_notifications(
            shown_ids
        )

    print(
        "VitaSense desktop notification monitor started."
    )

    print(
        f"Monitoring user_id={USER_ID}"
    )

    print(
        f"Checking every {CHECK_INTERVAL} seconds."
    )

    while True:

        notifications = get_unread_notifications()

        for notification in notifications:

            notification_id = notification.get(
                "id"
            )

            if notification_id is None:
                continue

            # ------------------------------------------------
            # NEW NOTIFICATION
            # ------------------------------------------------

            if notification_id not in shown_ids:

                show_notification(
                    notification
                )

                shown_ids.add(
                    notification_id
                )

                save_shown_ids(
                    shown_ids
                )

        time.sleep(
            CHECK_INTERVAL
        )


# ==========================================================
# START
# ==========================================================

if __name__ == "__main__":

    print(
        "=========================================="
    )

    print(
        "VitaSense Desktop Notification Agent"
    )

    print(
        "=========================================="
    )

    monitor_notifications()