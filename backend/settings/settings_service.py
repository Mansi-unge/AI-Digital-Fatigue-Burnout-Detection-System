from backend.database.database import SessionLocal
from backend.database.models.settings import Settings


class SettingsService:

    # ==========================================================
    # DEFAULT SETTINGS
    # ==========================================================

    def _create_default_settings(self, user_id):
        return Settings(
            user_id=user_id,

            # Monitoring
            monitoring_enabled=True,
            keyboard_monitoring=True,
            mouse_monitoring=True,
            screen_monitoring=True,
            idle_monitoring=True,
            application_monitoring=True,

            # Camera ON by default
            webcam_monitoring=True,

            # Notifications ON by default
            notifications_enabled=True,
            break_reminders=True,
            fatigue_alerts=True,

            # Appearance
            theme="light"
        )

    # ==========================================================
    # GET SETTINGS
    # ==========================================================

    def get_settings(self, user_id):

        db = SessionLocal()

        try:
            settings = (
                db.query(Settings)
                .filter(Settings.user_id == user_id)
                .first()
            )

            if not settings:
                return None

            return self._settings_to_dict(settings)

        finally:
            db.close()

    # ==========================================================
    # CREATE DEFAULT SETTINGS
    # ==========================================================

    def create_settings(self, user_id):

        db = SessionLocal()

        try:
            existing = (
                db.query(Settings)
                .filter(Settings.user_id == user_id)
                .first()
            )

            if existing:
                return self._settings_to_dict(existing)

            settings = self._create_default_settings(user_id)

            db.add(settings)
            db.commit()
            db.refresh(settings)

            return self._settings_to_dict(settings)

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

    # ==========================================================
    # UPDATE SETTINGS
    # ==========================================================

    def update_settings(self, user_id, data):

        db = SessionLocal()

        try:

            settings = (
                db.query(Settings)
                .filter(Settings.user_id == user_id)
                .first()
            )

            # Create settings automatically if missing
            if not settings:

                settings = self._create_default_settings(user_id)

                db.add(settings)
                db.flush()

            # ==================================================
            # MONITORING
            # ==================================================

            monitoring_fields = [
                "monitoring_enabled",
                "keyboard_monitoring",
                "mouse_monitoring",
                "screen_monitoring",
                "idle_monitoring",
                "application_monitoring",
                "webcam_monitoring",
            ]

            # ==================================================
            # NOTIFICATIONS
            # ==================================================

            notification_fields = [
                "notifications_enabled",
                "break_reminders",
                "fatigue_alerts",
            ]

            # ==================================================
            # UPDATE BOOLEAN SETTINGS
            # ==================================================

            for field in monitoring_fields + notification_fields:
                if field in data:

                    if not isinstance(data[field], bool):
                        raise ValueError(
                            f"{field} must be true or false"
                        )

                    setattr(
                        settings,
                        field,
                        data[field]
                    )

            # ==================================================
            # THEME
            # ==================================================

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

    # ==========================================================
    # CONVERT TO DICTIONARY
    # ==========================================================

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
                else None,
        }