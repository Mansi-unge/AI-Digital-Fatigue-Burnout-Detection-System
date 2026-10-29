from datetime import datetime

from backend.database.database import SessionLocal
from backend.database.models.users import User
from backend.database.models.activity import Activity
from backend.database.models.monitoring_sessions import MonitoringSession
from backend.database.models.fatigue_reports import FatigueReport
from backend.prediction.prediction_service import PredictionService

class MonitoringService:

    # ==========================================================
    # START MONITORING SESSION
    # ==========================================================

    def start_monitoring(self, user_id, mode):
        db = SessionLocal()

        try:
            # ------------------------------------------
            # VALIDATE MODE
            # ------------------------------------------

            allowed_modes = {
                "DATA_COLLECTION",
                "AI_MONITORING",
            }

            if mode not in allowed_modes:
                return {
                    "success": False,
                    "message": (
                        "Invalid mode. "
                        "Use DATA_COLLECTION or AI_MONITORING."
                    )
                }

            # ------------------------------------------
            # VALIDATE USER
            # ------------------------------------------

            user = (
                db.query(User)
                .filter(User.id == user_id)
                .first()
            )

            if user is None:
                return {
                    "success": False,
                    "message": "User not found"
                }

            # ------------------------------------------
            # CHECK EXISTING ACTIVE SESSION
            # ------------------------------------------

            active_session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.is_active == True,
                )
                .first()
            )

            # ------------------------------------------
            # RETURN EXISTING SESSION
            # ------------------------------------------

            if active_session is not None:
                return {
                    "success": True,
                    "message": "Monitoring session already active",
                    "session_id": active_session.id,
                    "user_id": active_session.user_id,
                    "mode": active_session.mode,
                    "started_at": (
                        active_session.started_at.isoformat()
                        if active_session.started_at
                        else None
                    ),
                    "ended_at": (
                        active_session.ended_at.isoformat()
                        if active_session.ended_at
                        else None
                    ),
                    "is_active": active_session.is_active,
                    "existing_session": True,
                }

            # ------------------------------------------
            # CREATE NEW SESSION
            # ------------------------------------------

            monitoring_session = MonitoringSession(
                user_id=user_id,
                mode=mode,
                started_at=datetime.utcnow(),
                ended_at=None,
                is_active=True,
            )

            db.add(monitoring_session)
            db.commit()
            db.refresh(monitoring_session)

            # ------------------------------------------
            # SUCCESS
            # ------------------------------------------

            return {
                "success": True,
                "message": "Monitoring started",
                "session_id": monitoring_session.id,
                "user_id": monitoring_session.user_id,
                "mode": monitoring_session.mode,
                "started_at": (
                    monitoring_session.started_at.isoformat()
                    if monitoring_session.started_at
                    else None
                ),
                "ended_at": None,
                "is_active": monitoring_session.is_active,
                "existing_session": False,
            }

        except Exception as e:
            db.rollback()

            print(
                "MonitoringService start error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()

    # ==========================================================
    # STOP MONITORING SESSION
    # ==========================================================

    def stop_monitoring(self, user_id):
        db = SessionLocal()

        try:
            # ------------------------------------------
            # FIND ACTIVE SESSION
            # ------------------------------------------

            active_session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.is_active == True,
                )
                .first()
            )

            # ------------------------------------------
            # NO ACTIVE SESSION
            # ------------------------------------------

            if active_session is None:
                return {
                    "success": False,
                    "message": "No active monitoring session found"
                }

            # ------------------------------------------
            # STOP SESSION
            # ------------------------------------------

            active_session.is_active = False
            active_session.ended_at = datetime.utcnow()

            db.commit()
            db.refresh(active_session)

            # ------------------------------------------
            # SUCCESS
            # ------------------------------------------

            return {
                "success": True,
                "message": "Monitoring stopped",
                "session_id": active_session.id,
                "user_id": active_session.user_id,
                "mode": active_session.mode,
                "started_at": (
                    active_session.started_at.isoformat()
                    if active_session.started_at
                    else None
                ),
                "ended_at": (
                    active_session.ended_at.isoformat()
                    if active_session.ended_at
                    else None
                ),
                "is_active": active_session.is_active,
            }

        except Exception as e:
            db.rollback()

            print(
                "MonitoringService stop error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()

    # ==========================================================
    # SAVE FATIGUE SELF-REPORT
    # ==========================================================

    def save_fatigue_report(self, user_id, level, session_id=None):
        db = SessionLocal()

        try:
            if level not in ("healthy", "mild", "high"):
                return {
                    "success": False,
                    "message": "level must be 'healthy', 'mild', or 'high'"
                }

            report = FatigueReport(
                user_id=user_id,
                session_id=session_id,
                level=level,
                reported_at=datetime.utcnow(),
            )

            db.add(report)
            db.commit()
            db.refresh(report)

            return {
                "success": True,
                "message": "Fatigue report saved",
                "level": report.level,
                "reported_at": report.reported_at.isoformat(),
            }

        except Exception as e:
            db.rollback()
            print("MonitoringService fatigue save error:", str(e))
            return {"success": False, "message": str(e)}

        finally:
            db.close()


    # ==========================================================
    # GET LATEST FATIGUE SELF-REPORT
    # ==========================================================

    def get_latest_fatigue(self, user_id):
        db = SessionLocal()

        try:
            report = (
                db.query(FatigueReport)
                .filter(FatigueReport.user_id == user_id)
                .order_by(FatigueReport.reported_at.desc())
                .first()
            )

            if report is None:
                return {"success": True, "level": None, "reported_at": None}

            return {
                "success": True,
                "level": report.level,
                "reported_at": report.reported_at.isoformat(),
            }

        except Exception as e:
            print("MonitoringService fatigue fetch error:", str(e))
            return {"success": False, "message": str(e)}

        finally:
            db.close()
            
    # ==========================================================
    # GET CURRENT MONITORING SESSION
    # ==========================================================

    def get_current_monitoring(self, user_id,session_id=None):
        db = SessionLocal()

        try:
            # ------------------------------------------
            # FIND ACTIVE SESSION
            # ------------------------------------------

            active_session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.is_active == True,
                )
                .order_by(MonitoringSession.started_at.desc())
                .first()
            )

            # ------------------------------------------
            # NO ACTIVE SESSION
            # ------------------------------------------

            if active_session is None:
                return {
                    "success": True,
                    "has_active_session": False,
                    "session": None,
                }

            # ------------------------------------------
            # ACTIVE SESSION
            # ------------------------------------------

            return {
                "success": True,
                "has_active_session": True,
                "session": {
                    "id": active_session.id,
                    "user_id": active_session.user_id,
                    "mode": active_session.mode,
                    "started_at": (
                        active_session.started_at.isoformat()
                        if active_session.started_at
                        else None
                    ),
                    "ended_at": (
                        active_session.ended_at.isoformat()
                        if active_session.ended_at
                        else None
                    ),
                    "last_sync_at": (
                        active_session.last_sync_at.isoformat()
                        if active_session.last_sync_at
                        else None
                    ),
                    "is_active": active_session.is_active,
                },
            }

        except Exception as e:
            print(
                "MonitoringService current session error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()


    
    
    
    def recover_stale_sessions(self):
        db = SessionLocal()

        try:
            stale_sessions = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.is_active == True
                )
                .all()
            )

            for session in stale_sessions:
                session.is_active = False
                session.ended_at = datetime.utcnow()

            db.commit()

            print(
                f"Recovered {len(stale_sessions)} stale monitoring session(s)."
            )

            return {
                "success": True,
                "recovered": len(stale_sessions)
            }

        except Exception as e:
            db.rollback()

            print(
                "Stale session recovery error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()
    

    # ==========================================================
    # SAVE ACTIVITY
    # ==========================================================

    def save_activity(
        self,
        user_id,
        session_id=None,

        # ==========================================
        # DESKTOP MONITORING
        # ==========================================

        screen_time=0,
        active_time=0,
        idle_time=0,
        keyboard_count=0,
        mouse_clicks=0,
        scroll_count=0,
        active_application="Unknown",
        application_switches=0,

        # ==========================================
        # CAMERA MONITORING
        # ==========================================

        blink_rate=0,
        eye_closure=0,
        yawn_count=0,
        head_pose="UNKNOWN",

        # ==========================================
        # SYSTEM MONITORING
        # ==========================================

        brightness=50,
        battery_percentage=100,
        charging_status=False,

        # ==========================================
        # IoT SENSOR MONITORING
        # ==========================================

        temperature=None,
        humidity=None,
        light=None,
        distance=None,
        motion=None,
    ):
        db = SessionLocal()

        try:
            # ==========================================
            # GET / VALIDATE MONITORING SESSION
            # ==========================================

            if session_id is None:

                active_session = (
                    db.query(MonitoringSession)
                    .filter(
                        MonitoringSession.user_id == user_id,
                        MonitoringSession.is_active == True,
                    )
                    .first()
                )

                if active_session is None:
                    return {
                        "success": False,
                        "message": (
                            "No active monitoring session found"
                        )
                    }

                session_id = active_session.id

            else:

                active_session = (
                    db.query(MonitoringSession)
                    .filter(
                        MonitoringSession.id == session_id,
                        MonitoringSession.user_id == user_id,
                        MonitoringSession.is_active == True,
                    )
                    .first()
                )

                if active_session is None:
                    return {
                        "success": False,
                        "message": (
                            "Invalid or inactive "
                            "monitoring session"
                        )
                    }

            # ==========================================
            # DEBUG CAMERA DATA
            # ==========================================

            print("========== CAMERA DATA ==========")
            print("Blink Rate :", blink_rate)
            print("Eye Closure:", eye_closure)
            print("Yawn Count :", yawn_count)
            print("Head Pose  :", head_pose)
            print("Session ID :", session_id)
            print("=================================")

            # ==========================================
            # CREATE ACTIVITY
            # ==========================================

            activity = Activity(
                user_id=user_id,
                session_id=session_id,

                # --------------------------------------
                # DESKTOP
                # --------------------------------------

                screen_time=screen_time,
                active_time=active_time,
                idle_time=idle_time,
                keyboard_count=keyboard_count,
                mouse_clicks=mouse_clicks,
                scroll_count=scroll_count,
                active_application=active_application,
                application_switches=application_switches,

                # --------------------------------------
                # CAMERA
                # --------------------------------------

                blink_rate=blink_rate,
                eye_closure=eye_closure,
                yawn_count=yawn_count,
                head_pose=head_pose,

                # --------------------------------------
                # IoT
                # --------------------------------------

                temperature=temperature,
                humidity=humidity,
                light=light,
                distance=distance,
                motion=motion,

                # --------------------------------------
                # SYSTEM
                # --------------------------------------

                brightness=brightness,
                battery_percentage=battery_percentage,
                charging_status=charging_status,
            )

            # ==========================================
            # SAVE
            # ==========================================

            db.add(activity)

            # Update last successful synchronization time
            active_session.last_sync_at = datetime.utcnow()

            db.commit()
            db.refresh(activity)

            # ==========================================
            # SUCCESS
            # ==========================================

            return {
                "success": True,
                "message": "Activity saved successfully",
                "activity_id": activity.id,
                "session_id": activity.session_id,
            }

        except Exception as e:
            db.rollback()

            print(
                "MonitoringService save error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()

    # ==========================================================
    # GET ACTIVITY HISTORY
    # ==========================================================
    def get_activity_history(
        self,
        user_id,
        session_id=None
    ):
        db = SessionLocal()

        try:

           
            # ==========================================
            # ORDER BY LATEST
            # ==========================================

            query = (
                db.query(Activity)
                .filter(
                    Activity.user_id == user_id
                )
            )

            if session_id is not None:

                query = query.filter(
                    Activity.session_id == session_id
                )

            activities = (
                query
                .order_by(
                    Activity.created_at.desc(),
                    Activity.id.desc()
                )
                .all()
            )

            # ==========================================
            # CREATE RESPONSE
            # ==========================================

            records = []

            for activity in activities:

                records.append({

                    "id": activity.id,

                    "user_id": activity.user_id,

                    "session_id": activity.session_id,

                    # DESKTOP
                    "screen_time":
                        activity.screen_time,

                    "active_time":
                        activity.active_time,

                    "idle_time":
                        activity.idle_time,

                    "keyboard_count":
                        activity.keyboard_count,

                    "mouse_clicks":
                        activity.mouse_clicks,

                    "scroll_count":
                        activity.scroll_count,

                    "active_application":
                        activity.active_application,

                    "application_switches":
                        activity.application_switches,

                    # CAMERA
                    "blink_rate":
                        activity.blink_rate,

                    "eye_closure":
                        activity.eye_closure,

                    "yawn_count":
                        activity.yawn_count,

                    "head_pose":
                        activity.head_pose,

                    # IoT
                    "temperature":
                        activity.temperature,

                    "humidity":
                        activity.humidity,

                    "light":
                        activity.light,

                    "distance":
                        activity.distance,

                    "motion":
                        activity.motion,

                    # SYSTEM
                    "brightness":
                        activity.brightness,

                    "battery_percentage":
                        activity.battery_percentage,

                    "charging_status":
                        activity.charging_status,

                    # TIMESTAMP
                    "created_at": (
                        activity.created_at.isoformat()
                        if activity.created_at
                        else None
                    )
                })

            return {
                "success": True,
                "data": records
            }

        except Exception as e:

            print(
                "MonitoringService history error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:

            db.close()    





    # ==========================================================
    # GET MONITORING HISTORY
    # ==========================================================

    def get_monitoring_history(
        self,
        user_id,
        mode=None,
        group_by="session",
        start_date=None,
        end_date=None
    ):
        db = SessionLocal()

        try:

            # ======================================================
            # VALIDATE GROUPING
            # ======================================================

            allowed_groupings = {
                "session",
                "day",
                "month"
            }

            if group_by not in allowed_groupings:
                return {
                    "success": False,
                    "message": (
                        "Invalid group_by. "
                        "Use session, day, or month."
                    )
                }

            # ======================================================
            # VALIDATE MODE
            # ======================================================

            allowed_modes = {
                "AI_MONITORING",
                "DATA_COLLECTION"
            }

            if mode is not None and mode not in allowed_modes:
                return {
                    "success": False,
                    "message": (
                        "Invalid mode. "
                        "Use AI_MONITORING or DATA_COLLECTION."
                    )
                }

            # ======================================================
            # BUILD SESSION QUERY
            # ======================================================

            query = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.user_id == user_id
                )
            )

            # ======================================================
            # MODE FILTER
            # ======================================================

            if mode is not None:
                query = query.filter(
                    MonitoringSession.mode == mode
                )

            # ======================================================
            # DATE FILTER
            #
            # We filter using started_at.
            # ======================================================

            parsed_start_date = None
            parsed_end_date = None

            if start_date:

                try:
                    parsed_start_date = datetime.strptime(
                        start_date,
                        "%Y-%m-%d"
                    )
                except ValueError:

                    return {
                        "success": False,
                        "message": (
                            "Invalid start_date format. "
                            "Use YYYY-MM-DD."
                        )
                    }

                query = query.filter(
                    MonitoringSession.started_at
                    >= parsed_start_date
                )

            if end_date:

                try:
                    parsed_end_date = datetime.strptime(
                        end_date,
                        "%Y-%m-%d"
                    )
                except ValueError:

                    return {
                        "success": False,
                        "message": (
                            "Invalid end_date format. "
                            "Use YYYY-MM-DD."
                        )
                    }

                # Include the complete end date.
                from datetime import timedelta

                parsed_end_date_exclusive = (
                    parsed_end_date + timedelta(days=1)
                )

                query = query.filter(
                    MonitoringSession.started_at
                    < parsed_end_date_exclusive
                )

            # ======================================================
            # FETCH SESSIONS
            # ======================================================

            sessions = (
                query
                .order_by(
                    MonitoringSession.started_at.desc()
                )
                .all()
            )

            # ======================================================
            # PREPARE SESSION DATA
            # ======================================================

            session_records = []

            for session in sessions:

                # --------------------------------------------------
                # SESSION END TIME
                # --------------------------------------------------

                end_time = session.ended_at

                # Active session:
                # calculate duration until now.
                if end_time is None:
                    end_time = datetime.utcnow()

                # --------------------------------------------------
                # SESSION DURATION
                # --------------------------------------------------

                duration_seconds = max(
                    0,
                    int(
                        (
                            end_time
                            - session.started_at
                        ).total_seconds()
                    )
                )

                duration_minutes = round(
                    duration_seconds / 60,
                    2
                )

                # --------------------------------------------------
                # FORMATTED DURATION
                # --------------------------------------------------

                hours = duration_seconds // 3600
                minutes = (
                    duration_seconds % 3600
                ) // 60
                seconds = duration_seconds % 60

                if hours > 0:

                    duration_formatted = (
                        f"{hours}h {minutes}m"
                    )

                elif minutes > 0:

                    duration_formatted = (
                        f"{minutes}m {seconds}s"
                    )

                else:

                    duration_formatted = (
                        f"{seconds}s"
                    )

                # --------------------------------------------------
                # GET ACTIVITY RECORDS
                # --------------------------------------------------

                activities = (
                    db.query(Activity)
                    .filter(
                        Activity.user_id == user_id,
                        Activity.session_id == session.id
                    )
                    .order_by(
                        Activity.created_at.asc(),
                        Activity.id.asc()
                    )
                    .all()
                )

                # --------------------------------------------------
                # ACTIVITY SUMMARY
                # --------------------------------------------------

                record_count = len(activities)

                # Activity records are periodic snapshots.
                # The desktop monitors maintain cumulative values
                # during the monitoring session.
                #
                # Therefore, DO NOT SUM these fields across snapshots.
                # Use the latest snapshot for cumulative metrics.

                latest_activity = (
                    activities[-1]
                    if activities
                    else None
                )

                if latest_activity is not None:

                    total_screen_time = (
                        latest_activity.screen_time or 0
                    )

                    total_active_time = (
                        latest_activity.active_time or 0
                    )

                    total_idle_time = (
                        latest_activity.idle_time or 0
                    )

                    total_keyboard = (
                        latest_activity.keyboard_count or 0
                    )

                    total_mouse = (
                        latest_activity.mouse_clicks or 0
                    )

                    total_scroll = (
                        latest_activity.scroll_count or 0
                    )

                    total_application_switches = (
                        latest_activity.application_switches or 0
                    )

                else:

                    total_screen_time = 0
                    total_active_time = 0
                    total_idle_time = 0

                    total_keyboard = 0
                    total_mouse = 0
                    total_scroll = 0
                    total_application_switches = 0


                # --------------------------------------------------
                # APPLICATIONS USED
                # --------------------------------------------------

                applications_used = set()

                for activity in activities:

                    if (
                        activity.active_application
                        and activity.active_application != "Unknown"
                        and activity.active_application != "Disabled"
                    ):
                        applications_used.add(
                            activity.active_application
                        )
                # --------------------------------------------------
                # SESSION RECORD
                # --------------------------------------------------

                session_records.append({

                    "session_id": session.id,

                    "user_id": session.user_id,

                    "mode": session.mode,

                    "started_at": (
                        session.started_at.isoformat()
                        if session.started_at
                        else None
                    ),

                    "ended_at": (
                        session.ended_at.isoformat()
                        if session.ended_at
                        else None
                    ),

                    "is_active": bool(
                        session.is_active
                    ),

                    "last_sync_at": (
                        session.last_sync_at.isoformat()
                        if session.last_sync_at
                        else None
                    ),

                    "duration_seconds":
                        duration_seconds,

                    "duration_minutes":
                        duration_minutes,

                    "duration_formatted":
                        duration_formatted,

                    "activity_summary": {

                        "record_count":
                            record_count,

                        "screen_time":
                            round(
                                total_screen_time,
                                2
                            ),

                        "active_time":
                            round(
                                total_active_time,
                                2
                            ),

                        "idle_time":
                            round(
                                total_idle_time,
                                2
                            ),

                        "keyboard_count":
                            total_keyboard,

                        "mouse_clicks":
                            total_mouse,

                        "scroll_count":
                            total_scroll,

                        "application_switches":
                            total_application_switches,

                        "applications_used":
                            sorted(
                                applications_used
                            )
                    }
                })

            # ======================================================
            # GROUPING
            # ======================================================

            grouped_data = {}

            # ------------------------------------------------------
            # SESSION GROUPING
            # ------------------------------------------------------

            if group_by == "session":

                grouped_data = session_records

            # ------------------------------------------------------
            # DAY GROUPING
            # ------------------------------------------------------

            elif group_by == "day":

                for record in session_records:

                    started_at = record.get(
                        "started_at"
                    )

                    if not started_at:
                        continue

                    day_key = started_at[:10]

                    if day_key not in grouped_data:

                        grouped_data[day_key] = {
                            "date": day_key,
                            "session_count": 0,
                            "total_duration_seconds": 0,
                            "total_duration_minutes": 0,
                            "sessions": []
                        }

                    grouped_data[
                        day_key
                    ]["session_count"] += 1

                    grouped_data[
                        day_key
                    ]["total_duration_seconds"] += (
                        record["duration_seconds"]
                    )

                    grouped_data[
                        day_key
                    ]["total_duration_minutes"] += (
                        record["duration_minutes"]
                    )

                    grouped_data[
                        day_key
                    ]["sessions"].append(record)

                # Convert dictionary to list
                # and round totals.

                grouped_data = list(
                    grouped_data.values()
                )

                for group in grouped_data:

                    group[
                        "total_duration_minutes"
                    ] = round(
                        group[
                            "total_duration_minutes"
                        ],
                        2
                    )

            # ------------------------------------------------------
            # MONTH GROUPING
            # ------------------------------------------------------

            elif group_by == "month":

                for record in session_records:

                    started_at = record.get(
                        "started_at"
                    )

                    if not started_at:
                        continue

                    month_key = started_at[:7]

                    if month_key not in grouped_data:

                        grouped_data[month_key] = {
                            "month": month_key,
                            "session_count": 0,
                            "total_duration_seconds": 0,
                            "total_duration_minutes": 0,
                            "sessions": []
                        }

                    grouped_data[
                        month_key
                    ]["session_count"] += 1

                    grouped_data[
                        month_key
                    ]["total_duration_seconds"] += (
                        record["duration_seconds"]
                    )

                    grouped_data[
                        month_key
                    ]["total_duration_minutes"] += (
                        record["duration_minutes"]
                    )

                    grouped_data[
                        month_key
                    ]["sessions"].append(record)

                grouped_data = list(
                    grouped_data.values()
                )

                for group in grouped_data:

                    group[
                        "total_duration_minutes"
                    ] = round(
                        group[
                            "total_duration_minutes"
                        ],
                        2
                    )

            # ======================================================
            # OVERALL SUMMARY
            # ======================================================

            total_sessions = len(
                session_records
            )

            total_duration_seconds = sum(
                record["duration_seconds"]
                for record in session_records
            )

            total_duration_minutes = round(
                total_duration_seconds / 60,
                2
            )

            ai_sessions = sum(
                1
                for record in session_records
                if record["mode"] == "AI_MONITORING"
            )

            data_collection_sessions = sum(
                1
                for record in session_records
                if record["mode"] == "DATA_COLLECTION"
            )

            total_activity_records = sum(
                record[
                    "activity_summary"
                ]["record_count"]
                for record in session_records
            )

            # ======================================================
            # SUCCESS RESPONSE
            # ======================================================

            return {

                "success": True,

                "filters": {

                    "user_id": user_id,

                    "mode": mode,

                    "group_by": group_by,

                    "start_date": start_date,

                    "end_date": end_date
                },

                "summary": {

                    "total_sessions":
                        total_sessions,

                    "ai_monitoring_sessions":
                        ai_sessions,

                    "data_collection_sessions":
                        data_collection_sessions,

                    "total_activity_records":
                        total_activity_records,

                    "total_duration_seconds":
                        total_duration_seconds,

                    "total_duration_minutes":
                        total_duration_minutes
                },

                "data": grouped_data
            }

        except Exception as e:

            print(
                "MonitoringService history error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:

            db.close()





    # ==========================================================
    # GET SINGLE MONITORING SESSION DETAILS
    # ==========================================================

    def get_monitoring_session_details(self, user_id, session_id):
        db = SessionLocal()

        try:

            # ======================================================
            # FIND SESSION
            # ======================================================

            session = (
                db.query(MonitoringSession)
                .filter(
                    MonitoringSession.id == session_id,
                    MonitoringSession.user_id == user_id
                )
                .first()
            )

            if session is None:
                return {
                    "success": False,
                    "message": "Monitoring session not found"
                }

            # ======================================================
            # SESSION TIME
            # ======================================================

            end_time = session.ended_at

            if end_time is None:
                end_time = datetime.utcnow()

            duration_seconds = max(
                0,
                int(
                    (
                        end_time - session.started_at
                    ).total_seconds()
                )
            )

            duration_minutes = round(
                duration_seconds / 60,
                2
            )

            hours = duration_seconds // 3600
            minutes = (duration_seconds % 3600) // 60
            seconds = duration_seconds % 60

            if hours > 0:
                duration_formatted = (
                    f"{hours}h {minutes}m"
                )
            elif minutes > 0:
                duration_formatted = (
                    f"{minutes}m {seconds}s"
                )
            else:
                duration_formatted = (
                    f"{seconds}s"
                )

            # ======================================================
            # GET SESSION ACTIVITY RECORDS
            # ======================================================

            activities = (
                db.query(Activity)
                .filter(
                    Activity.user_id == user_id,
                    Activity.session_id == session_id
                )
                .order_by(
                    Activity.created_at.asc(),
                    Activity.id.asc()
                )
                .all()
            )

            # ======================================================
            # NO ACTIVITY
            # ======================================================

            latest_activity = (
                activities[-1]
                if activities
                else None
            )

            # ======================================================
            # APPLICATIONS USED
            # ======================================================

            applications_used = set()

            for activity in activities:

                app = activity.active_application

                if (
                    app
                    and app != "Unknown"
                    and app != "Disabled"
                ):
                    applications_used.add(app)

            # ======================================================
            # ACTIVITY DATA
            # ======================================================

            if latest_activity is not None:

                activity_data = {
                    "screen_time": (
                        latest_activity.screen_time or 0
                    ),
                    "active_time": (
                        latest_activity.active_time or 0
                    ),
                    "idle_time": (
                        latest_activity.idle_time or 0
                    ),
                    "keyboard_count": (
                        latest_activity.keyboard_count or 0
                    ),
                    "mouse_clicks": (
                        latest_activity.mouse_clicks or 0
                    ),
                    "scroll_count": (
                        latest_activity.scroll_count or 0
                    ),
                    "active_application": (
                        latest_activity.active_application
                        or "Unknown"
                    ),
                    "application_switches": (
                        latest_activity.application_switches or 0
                    ),
                    "record_count": len(activities),
                    "applications_used": sorted(
                        applications_used
                    ),
                    "last_recorded_at": (
                        latest_activity.created_at.isoformat()
                        if latest_activity.created_at
                        else None
                    )
                }

                # ==================================================
                # CAMERA DATA
                # ==================================================

                camera_data = {
                    "blink_rate": (
                        latest_activity.blink_rate or 0
                    ),
                    "eye_closure": (
                        latest_activity.eye_closure or 0
                    ),
                    "yawn_count": (
                        latest_activity.yawn_count or 0
                    ),
                    "head_pose": (
                        latest_activity.head_pose
                        or "UNKNOWN"
                    )
                }

                # ==================================================
                # ENVIRONMENT DATA
                # ==================================================

                environment_data = {
                    "temperature": (
                        latest_activity.temperature
                    ),
                    "humidity": (
                        latest_activity.humidity
                    ),
                    "light": (
                        latest_activity.light
                    ),
                    "distance": (
                        latest_activity.distance
                    ),
                    "motion": (
                        latest_activity.motion
                    )
                }

                # ==================================================
                # SYSTEM DATA
                # ==================================================

                system_data = {
                    "brightness": (
                        latest_activity.brightness or 0
                    ),
                    "battery_percentage": (
                        latest_activity.battery_percentage
                        if latest_activity.battery_percentage
                        is not None
                        else 0
                    ),
                    "charging_status": bool(
                        latest_activity.charging_status
                    )
                }

            else:

                activity_data = {
                    "screen_time": 0,
                    "active_time": 0,
                    "idle_time": 0,
                    "keyboard_count": 0,
                    "mouse_clicks": 0,
                    "scroll_count": 0,
                    "active_application": "Unknown",
                    "application_switches": 0,
                    "record_count": 0,
                    "applications_used": [],
                    "last_recorded_at": None
                }

                camera_data = {
                    "blink_rate": 0,
                    "eye_closure": 0,
                    "yawn_count": 0,
                    "head_pose": "UNKNOWN"
                }

                environment_data = {
                    "temperature": None,
                    "humidity": None,
                    "light": None,
                    "distance": None,
                    "motion": None
                }

                system_data = {
                    "brightness": 0,
                    "battery_percentage": 0,
                    "charging_status": False
                }

            # ======================================================
            # AI ANALYSIS
            # ======================================================

            ai_analysis = {
                "available": False,
                "fatigue": None,
                "burnout": None,
                "health": None
            }

            if latest_activity is not None:

                try:

                    prediction_service = PredictionService()

                    prediction_input = {
                        "screen_time":
                            latest_activity.screen_time or 0,

                        "active_time":
                            latest_activity.active_time or 0,

                        "idle_time":
                            latest_activity.idle_time or 0,

                        "keyboard_count":
                            latest_activity.keyboard_count or 0,

                        "mouse_clicks":
                            latest_activity.mouse_clicks or 0,

                        "scroll_count":
                            latest_activity.scroll_count or 0,

                        "application_switches":
                            latest_activity.application_switches or 0,

                        "blink_rate":
                            latest_activity.blink_rate or 0,

                        "eye_closure":
                            latest_activity.eye_closure or 0,

                        "yawn_count":
                            latest_activity.yawn_count or 0,

                        "head_pose":
                            latest_activity.head_pose or "UNKNOWN",

                        "temperature":
                            latest_activity.temperature,

                        "humidity":
                            latest_activity.humidity,

                        "light":
                            latest_activity.light,

                        "distance":
                            latest_activity.distance,

                        "motion":
                            latest_activity.motion,

                        "brightness":
                            latest_activity.brightness or 0,

                        "battery_percentage":
                            latest_activity.battery_percentage
                            if latest_activity.battery_percentage
                            is not None
                            else 0,

                        "charging_status":
                            bool(
                                latest_activity.charging_status
                            )
                    }

                    prediction_result = (
                        prediction_service.predict(
                            prediction_input
                        )
                    )

                    ai_analysis = {
                        "available": True,
                        "prediction": prediction_result
                    }

                except Exception as prediction_error:

                    print(
                        "Historical AI prediction error:",
                        str(prediction_error)
                    )

                    ai_analysis = {
                        "available": False,
                        "prediction": None,
                        "message": (
                            "AI analysis could not be generated "
                            "for this session."
                        )
                    }

            # ======================================================
            # FATIGUE SELF-REPORT
            # ======================================================

            fatigue_report = (
                db.query(FatigueReport)
                .filter(
                    FatigueReport.user_id == user_id,
                    FatigueReport.session_id == session_id
                )
                .order_by(
                    FatigueReport.reported_at.desc()
                )
                .first()
            )

            if fatigue_report is not None:

                fatigue_report_data = {
                    "available": True,
                    "level": fatigue_report.level,
                    "reported_at": (
                        fatigue_report.reported_at.isoformat()
                        if fatigue_report.reported_at
                        else None
                    )
                }

            else:

                fatigue_report_data = {
                    "available": False,
                    "level": None,
                    "reported_at": None
                }

            # ======================================================
            # SESSION INFORMATION
            # ======================================================

            session_data = {
                "session_id": session.id,

                "user_id": session.user_id,

                "mode": session.mode,

                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at
                    else None
                ),

                "ended_at": (
                    session.ended_at.isoformat()
                    if session.ended_at
                    else None
                ),

                "last_sync_at": (
                    session.last_sync_at.isoformat()
                    if session.last_sync_at
                    else None
                ),

                "is_active": bool(
                    session.is_active
                ),

                "duration_seconds":
                    duration_seconds,

                "duration_minutes":
                    duration_minutes,

                "duration_formatted":
                    duration_formatted
            }

            # ======================================================
            # FINAL RESPONSE
            # ======================================================

            return {
                "success": True,

                "session": session_data,

                "activity": activity_data,

                "camera": camera_data,

                "environment": environment_data,

                "system": system_data,

                "ai_analysis": ai_analysis,

                "fatigue_report":
                    fatigue_report_data
            }

        except Exception as e:

            db.rollback()

            print(
                "Monitoring session details error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:

            db.close()


            
    # ==========================================================
    # GET DATA COLLECTION PROGRESS
    # ==========================================================

    def get_data_collection_progress(self, user_id):
        db = SessionLocal()

        try:

            count = (
                db.query(Activity)
                .join(
                    MonitoringSession,
                    Activity.session_id == MonitoringSession.id
                )
                .filter(
                    Activity.user_id == user_id,
                    MonitoringSession.user_id == user_id,
                    MonitoringSession.mode == "DATA_COLLECTION"
                )
                .count()
            )

            return {
                "success": True,
                "record_count": count
            }

        except Exception as e:

            print(
                "Data collection progress error:",
                str(e)
            )

            return {
                "success": False,
                "message": str(e)
            }

        finally:
            db.close()