
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

from backend.database.database import SessionLocal
from backend.database.models.notification import Notification


notification_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/notifications"
)


# ==========================================================
# DELETE SEEN NOTIFICATIONS AFTER 1 HOUR
# ==========================================================

def delete_expired_notifications(db):
    cutoff_time = datetime.utcnow() - timedelta(hours=1)

    deleted_count = (
        db.query(Notification)
        .filter(
            Notification.is_seen == True,
            Notification.seen_at.isnot(None),
            Notification.seen_at < cutoff_time
        )
        .delete(synchronize_session=False)
    )

    if deleted_count > 0:
        db.commit()

    return deleted_count


# ==========================================================
# GET ALL NOTIFICATIONS
# ==========================================================

@notification_bp.route("", methods=["GET"])
def get_notifications():
    db = SessionLocal()

    try:
        user_id = request.args.get("user_id", type=int)

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # Delete notifications seen more than one hour ago
        delete_expired_notifications(db)

        cutoff_time = datetime.utcnow() - timedelta(hours=1)

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                (
                    (Notification.is_seen == False)
                    |
                    (
                        (Notification.is_seen == True)
                        &
                        (Notification.seen_at >= cutoff_time)
                    )
                )
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

        return jsonify({
            "success": True,
            "notifications": [
                {
                    "id": notification.id,
                    "user_id": notification.user_id,
                    "recommendation_id": notification.recommendation_id,
                    "title": notification.title,
                    "message": notification.message,
                    "type": notification.type,
                    "priority": notification.priority,
                    "is_seen": notification.is_seen,
                    "seen_at": (
                        notification.seen_at.isoformat()
                        if notification.seen_at
                        else None
                    ),
                    "created_at": (
                        notification.created_at.isoformat()
                        if notification.created_at
                        else None
                    )
                }
                for notification in notifications
            ]
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        db.close()


# ==========================================================
# GET UNREAD NOTIFICATIONS
# ==========================================================

@notification_bp.route("/unread", methods=["GET"])
def get_unread_notifications():
    db = SessionLocal()

    try:
        user_id = request.args.get("user_id", type=int)

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # Clean up expired seen notifications
        delete_expired_notifications(db)

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_seen == False
            )
            .order_by(Notification.created_at.desc())
            .all()
        )

        return jsonify({
            "success": True,
            "unread_count": len(notifications),
            "notifications": [
                {
                    "id": notification.id,
                    "user_id": notification.user_id,
                    "recommendation_id": notification.recommendation_id,
                    "title": notification.title,
                    "message": notification.message,
                    "type": notification.type,
                    "priority": notification.priority,
                    "is_seen": notification.is_seen,
                    "seen_at": (
                        notification.seen_at.isoformat()
                        if notification.seen_at
                        else None
                    ),
                    "created_at": (
                        notification.created_at.isoformat()
                        if notification.created_at
                        else None
                    )
                }
                for notification in notifications
            ]
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        db.close()


# ==========================================================
# MARK ONE NOTIFICATION AS SEEN
# ==========================================================

@notification_bp.route(
    "/<int:notification_id>/seen",
    methods=["PATCH"]
)
def mark_notification_seen(notification_id):
    db = SessionLocal()

    try:
        user_id = request.args.get("user_id", type=int)

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
            .first()
        )

        if notification is None:
            return jsonify({
                "success": False,
                "message": "Notification not found"
            }), 404

        # Set seen timestamp only the first time
        if not notification.is_seen:
            notification.is_seen = True
            notification.seen_at = datetime.utcnow()

            db.commit()

        return jsonify({
            "success": True,
            "message": "Notification marked as seen",
            "notification_id": notification.id,
            "is_seen": notification.is_seen,
            "seen_at": (
                notification.seen_at.isoformat()
                if notification.seen_at
                else None
            )
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        db.close()


# ==========================================================
# MARK ALL NOTIFICATIONS AS SEEN
# ==========================================================

@notification_bp.route(
    "/seen-all",
    methods=["PATCH"]
)
def mark_all_notifications_seen():
    db = SessionLocal()

    try:
        user_id = request.args.get("user_id", type=int)

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_seen == False
            )
            .all()
        )

        current_time = datetime.utcnow()

        for notification in notifications:
            notification.is_seen = True
            notification.seen_at = current_time

        db.commit()

        return jsonify({
            "success": True,
            "message": "All notifications marked as seen",
            "updated_count": len(notifications)
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:
        db.close()
