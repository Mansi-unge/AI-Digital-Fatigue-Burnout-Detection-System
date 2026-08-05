from flask import Flask
from flask_cors import CORS

from backend.auth.auth_routes import auth_bp

app = Flask(__name__)

# Enable CORS
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )