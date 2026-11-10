
from flask import Flask
from flask_cors import CORS

from backend.auth.auth_routes import auth_bp
from backend.dashboard.dashboard_routes import dashboard_bp
from backend.monitoring.monitoring_routes import monitoring_bp
from backend.prediction.prediction_routes import prediction_bp
from backend.recommendations.recommendation_routes import recommendation_bp
from backend.reports.report_routes import report_bp
from backend.profile.profile_routes import profile_bp
from backend.settings.settings_routes import settings_bp
from backend.middleware.error_handler import register_error_handlers

# Database imports
from backend.database.database import Base, engine

# Import all models
from backend.database.models import User, Activity

app = Flask(__name__)

# Enable CORS
CORS(app)

# Register centralized error handlers
register_error_handlers(app)

# Create all database tables
Base.metadata.create_all(bind=engine)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(monitoring_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(report_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(settings_bp)

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
