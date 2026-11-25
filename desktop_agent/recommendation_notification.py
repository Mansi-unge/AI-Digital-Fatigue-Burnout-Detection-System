
import json
import os

import requests
from winotify import Notification, audio


class RecommendationNotificationManager:
    def __init__(
        self,
        backend_url,
        app_id,
        frontend_notifications_url,
        shown_ids_file,
        request_timeout,
    ):
        self.backend_url = backend_url.rstrip("/")
        self.app_id = app_id
        self.frontend_notifications_url = frontend_notifications_url
        self.shown_ids_file = shown_ids_file
        self.request_timeout = request_timeout

        self.shown_ids = self._load_shown_ids()
        self.initialized = os.path.exists(self.shown_ids_file)

    # ------------------------------------------------------
    # LOAD ALREADY DISPLAYED NOTIFICATION IDS
    # ------------------------------------------------------

    def _load_shown_ids(self):
        if not os.path.exists(self.shown_ids_file):
            return set()

        try:
            with open(
                self.shown_ids_file,
                "r",
                encoding="utf-8",
            ) as file:
                data = json.load(file)

            return {str(notification_id) for notification_id in data}

        except (OSError, json.JSONDecodeError, TypeError) as error:
            print("Could not load displayed notification IDs:", error)
            return set()

    # ------------------------------------------------------
    # SAVE DISPLAYED NOTIFICATION IDS
    # ------------------------------------------------------

    def _save_shown_ids(self):
        try:
            directory = os.path.dirname(self.shown_ids_file)

            if directory:
                os.makedirs(directory, exist_ok=True)

            temporary_file = self.shown_ids_file + ".tmp"

            with open(
                temporary_file,
                "w",
                encoding="utf-8",
            ) as file:
                json.dump(sorted(self.shown_ids), file, indent=4)

            os.replace(temporary_file, self.shown_ids_file)

        except OSError as error:
            print("Could not save displayed notification IDs:", error)

    # ------------------------------------------------------
    # GET UNREAD NOTIFICATIONS
    # ------------------------------------------------------

    def get_unread_notifications(self, user_id):
        try:
            response = requests.get(
                f"{self.backend_url}/notifications/unread",
                params={"user_id": user_id},
                timeout=self.request_timeout,
            )

            response.raise_for_status()
            data = response.json()

            if not data.get("success"):
                print("Unread notification API returned failure:", data)
                return None

            notifications = data.get("notifications", [])

            if not isinstance(notifications, list):
                print("Invalid notifications response from backend.")
                return None

            return notifications

        except requests.RequestException as error:
            print("Recommendation notification API error:", error)

        except (ValueError, TypeError) as error:
            print("Could not read notification API response:", error)

        return None

    # ------------------------------------------------------
    # INITIALIZE EXISTING NOTIFICATIONS
    # ------------------------------------------------------

    def initialize_existing_notifications(self, user_id):
        """
        On the first run, remember notifications that already exist.
        They will remain in the app but will not generate old desktop popups.
        """

        if self.initialized:
            return True

        notifications = self.get_unread_notifications(user_id)

        # Do not create the tracking file if the API request failed.
        # This allows initialization to retry on the next poll.
        if notifications is None:
            return False

        for notification in notifications:
            notification_id = notification.get("id")

            if notification_id is not None:
                self.shown_ids.add(str(notification_id))

        self._save_shown_ids()
        self.initialized = True

        print(
            "Existing unread notifications initialized:",
            len(notifications),
        )

        return True

    # ------------------------------------------------------
    # SHOW WINDOWS RECOMMENDATION POPUP
    # ------------------------------------------------------

    def show_notification(self, notification):
        try:
            title = notification.get(
                "title",
                "VitaSense Recommendation",
            )

            message = notification.get(
                "message",
                "A new recommendation is available.",
            )

            toast = Notification(
                app_id=self.app_id,
                title=str(title),
                msg=str(message),
                duration="long",
            )

            toast.add_actions(
                label="View Notification",
                launch=self.frontend_notifications_url,
            )

            toast.set_audio(
                audio.Default,
                loop=False,
            )

            toast.show()

            print()
            print("======================================")
            print("RECOMMENDATION DESKTOP NOTIFICATION")
            print("======================================")
            print("Notification ID:", notification.get("id"))
            print("Title:", title)
            print("Message:", message)
            print("======================================")

            return True

        except Exception as error:
            print("Could not display recommendation popup:", error)
            return False

    # ------------------------------------------------------
    # CHECK FOR NEW RECOMMENDATION NOTIFICATIONS
    # ------------------------------------------------------

    def check_new_notifications(self, user_id):
        if user_id is None:
            return

        # First run: suppress popups for notifications that already exist.
        if not self.initialize_existing_notifications(user_id):
            return

        notifications = self.get_unread_notifications(user_id)

        if notifications is None:
            return

        for notification in notifications:
            notification_id = notification.get("id")

            if notification_id is None:
                continue

            notification_id = str(notification_id)

            if notification_id in self.shown_ids:
                continue

            popup_success = self.show_notification(notification)

            # Remember the ID only after the popup call succeeds.
            if popup_success:
                self.shown_ids.add(notification_id)
                self._save_shown_ids()
