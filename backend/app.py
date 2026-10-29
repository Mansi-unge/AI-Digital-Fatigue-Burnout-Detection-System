from flask import Flask
from flask_cors import CORS

from backend.auth.auth_routes import auth_bp

# Database
from backend.database.database import Base, engine

# # Import ALL models
# from backend.database.models import User, Activity

# Monitoring
from backend.monitoring.monitoring_routes import monitoring_bp
from backend.prediction.prediction_routes import prediction_bp
from backend.recommendations.recommendation_routes import recommendation_bp
from backend.profile.profile_routes import profile_bp
from backend.settings.settings_routes import settings_bp
from backend.notifications.notification_routes import notification_bp
from backend.monitoring.monitoring_service import MonitoringService
from backend.monitoring.monitor_manager import monitor_manager



app = Flask(__name__)

# Enable CORS
CORS(app)


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)
# ==========================================
# RECOVER STALE MONITORING SESSIONS
# ==========================================
monitoring_service = MonitoringService()
monitoring_service.recover_stale_sessions()



# ==========================================
# RESET MONITOR MANAGER STATE
# ==========================================
monitor_manager.user_id = None
monitor_manager.session_id = None

# ==========================================
# REGISTER BLUEPRINTS
# ==========================================

app.register_blueprint(auth_bp)

app.register_blueprint(monitoring_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(notification_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(settings_bp)


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False
    )