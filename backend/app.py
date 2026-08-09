from flask import Flask
from flask_cors import CORS

from backend.auth.auth_routes import auth_bp
from backend.iot.iot_routes import iot_bp

# Database
from backend.database.database import Base, engine

# Import ALL models so SQLAlchemy knows about them
from backend.database.models import User, Activity, IoTData


app = Flask(__name__)

# Enable CORS
CORS(app)


# Create all database tables
Base.metadata.create_all(bind=engine)


# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(iot_bp)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )