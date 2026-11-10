from backend.database.database import SessionLocal
from backend.database.models.settings import Settings


class SettingsService:

    # ==========================================
    # GET USER SETTINGS
    # ==========================================

    def get_settings(self, user_id):

        db = SessionLocal()

        try:
            settings = db.query(Settings).filter(
                Settings.user_id == user_id
            ).first()

            if not settings:
                return None

            return self._settings_to_dict(settings)

        finally:
            db.close()

    # ==========================================
    # CREATE DEFAULT SETTINGS
    # ==========================================

    def create_settings(self, user_id):

        db = SessionLocal()

        try:
            existing = db.query(Settings).filter(
                Settings.user_id == user_id
            ).first()

            if existing:
                return self._settings_to_dict(existing)

            settings = Settings(
                user_id=user_id,

                # Monitoring
                monitoring_enabled=True,
                keyboard_monitoring=True,
                mouse_monitoring=True,
                screen_monitoring=True,
                idle_monitoring=True,
                application_monitoring=True,
                webcam_monitoring=True,

                # Notifications
                notifications_enabled=True,
                break_reminders=True,
                fatigue_alerts=True,

                # General
                theme="light"
            )

            db.add(settings)
            db.commit()
            db.refresh(settings)

            return self._settings_to_dict(settings)

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

    # ==========================================
    # UPDATE SETTINGS
    # ==========================================

    def update_settings(self, user_id, data):

        db = SessionLocal()

        try:
            settings = db.query(Settings).filter(
                Settings.user_id == user_id
            ).first()

            # Create settings if they don't exist
            if not settings:

                settings = Settings(
                    user_id=user_id,

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

            # ======================================
            # MONITORING SETTINGS
            # ======================================

            if "monitoring_enabled" in data:
                settings.monitoring_enabled = data[
                    "monitoring_enabled"
                ]

            if "keyboard_monitoring" in data:
                settings.keyboard_monitoring = data[
                    "keyboard_monitoring"
                ]

            if "mouse_monitoring" in data:
                settings.mouse_monitoring = data[
                    "mouse_monitoring"
                ]

            if "screen_monitoring" in data:
                settings.screen_monitoring = data[
                    "screen_monitoring"
                ]

            if "idle_monitoring" in data:
                settings.idle_monitoring = data[
                    "idle_monitoring"
                ]

            if "application_monitoring" in data:
                settings.application_monitoring = data[
                    "application_monitoring"
                ]

            if "webcam_monitoring" in data:
                settings.webcam_monitoring = data[
                    "webcam_monitoring"
                ]

            # ======================================
            # NOTIFICATION SETTINGS
            # ======================================

            if "notifications_enabled" in data:
                settings.notifications_enabled = data[
                    "notifications_enabled"
                ]

            if "break_reminders" in data:
                settings.break_reminders = data[
                    "break_reminders"
                ]

            if "fatigue_alerts" in data:
                settings.fatigue_alerts = data[
                    "fatigue_alerts"
                ]

            # ======================================
            # GENERAL SETTINGS
            # ======================================

            if "theme" in data:
                settings.theme = data["theme"]

            db.commit()
            db.refresh(settings)

            return self._settings_to_dict(settings)

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

    # ==========================================
    # CONVERT SETTINGS TO DICTIONARY
    # ==========================================

    def _settings_to_dict(self, settings):

        return {
            "id": settings.id,
            "user_id": settings.user_id,

            # Monitoring
            "monitoring_enabled":
                settings.monitoring_enabled,

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

            # Notifications
            "notifications_enabled":
                settings.notifications_enabled,

            "break_reminders":
                settings.break_reminders,

            "fatigue_alerts":
                settings.fatigue_alerts,

            # General
            "theme":
                settings.theme,

            # Timestamps
            "created_at":
                settings.created_at.isoformat()
                if settings.created_at
                else None,

            "updated_at":
                settings.updated_at.isoformat()
                if settings.updated_at
                else None
        }