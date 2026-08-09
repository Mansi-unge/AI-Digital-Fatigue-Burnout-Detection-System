from flask import Flask, request

from backend.middleware.auth_middleware import require_user


app = Flask(__name__)


@app.route("/test-protected")
@require_user
def test_protected():

    return {
        "success": True,
        "message": "Authentication middleware is working",
        "user_id": request.user_id
    }


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )