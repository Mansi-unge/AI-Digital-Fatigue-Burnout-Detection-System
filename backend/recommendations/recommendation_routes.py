
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

from backend.database.database import SessionLocal
from backend.database.models.recommendations import Recommendation
from backend.database.models.notification import Notification

recommendation_bp = Blueprint(
    "recommendations",
    __name__,
    url_prefix="/recommendations"
)
def delete_expired_recommendations(db):
    cutoff_time = datetime.utcnow() - timedelta(hours=23)

    expired_ids = [
        row[0]
        for row in (
            db.query(Recommendation.id)
            .filter(Recommendation.created_at < cutoff_time)
            .all()
        )
    ]

    if not expired_ids:
        return 0

    # Keep notifications, but remove their link to the deleted recommendation.
    # This allows the notification's own seen/one-hour lifecycle to continue.
    db.query(Notification).filter(
        Notification.recommendation_id.in_(expired_ids)
    ).update(
        {Notification.recommendation_id: None},
        synchronize_session=False
    )

    deleted_count = (
        db.query(Recommendation)
        .filter(Recommendation.id.in_(expired_ids))
        .delete(synchronize_session=False)
    )

    db.commit()
    return deleted_count

# ==========================================================
# GET SAVED RECOMMENDATIONS (LAST 23 HOURS)
# ==========================================================

@recommendation_bp.route("/current", methods=["GET"])
def current_recommendations():

    db = SessionLocal()

    try:

        # ==================================================
        # GET USER ID
        # ==================================================

        user_id = request.args.get(
            "user_id",
            type=int
        )

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "user_id is required"
            }), 400

        # ==================================================
        # CALCULATE 23-HOUR RETENTION WINDOW
        # ==================================================

        current_time = datetime.utcnow()

        cutoff_time = (
            current_time - timedelta(hours=23)
        )
        delete_expired_recommendations(db)
        # ==================================================
        # FETCH SAVED RECOMMENDATIONS
        # ==================================================

        recommendations = (
            db.query(Recommendation)
            .filter(
                Recommendation.user_id == user_id,
                Recommendation.created_at >= cutoff_time,
                Recommendation.created_at <= current_time
            )
            .order_by(
                Recommendation.created_at.desc()
            )
            .all()
        )

        # ==================================================
        # SERIALIZE RECOMMENDATIONS
        # ==================================================

        recommendation_list = []

        for recommendation in recommendations:

            recommendation_list.append({

                "id": recommendation.id,

                "title": recommendation.title,

                "type": (
                    recommendation.category
                    or "General"
                ),

                "message": recommendation.description,

                "priority": recommendation.priority,

                "created_at": (
                    recommendation.created_at.isoformat()
                    if recommendation.created_at
                    else None
                ),

                "is_completed": recommendation.is_completed

            })

        # ==================================================
        # RESPONSE
        # ==================================================

        return jsonify({

            "success": True,

            "has_recommendations": (
                len(recommendation_list) > 0
            ),

            "recommendations": recommendation_list,

            "total": len(recommendation_list),

            "retention_hours": 23

        }), 200

    except Exception as e:

        db.rollback()

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500

    finally:

        db.close()
