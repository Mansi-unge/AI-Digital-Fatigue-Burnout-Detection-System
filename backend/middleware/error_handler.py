from flask import jsonify


# ==========================================
# 404 - ROUTE NOT FOUND
# ==========================================

def handle_404(error):

    return jsonify({
        "success": False,
        "message": "The requested route was not found"
    }), 404


# ==========================================
# 400 - BAD REQUEST
# ==========================================

def handle_400(error):

    return jsonify({
        "success": False,
        "message": "Invalid request"
    }), 400


# ==========================================
# 401 - UNAUTHORIZED
# ==========================================

def handle_401(error):

    return jsonify({
        "success": False,
        "message": "Authentication required"
    }), 401


# ==========================================
# 403 - FORBIDDEN
# ==========================================

def handle_403(error):

    return jsonify({
        "success": False,
        "message": "Access forbidden"
    }), 403


# ==========================================
# 500 - INTERNAL SERVER ERROR
# ==========================================

def handle_500(error):

    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


# ==========================================
# REGISTER ERROR HANDLERS
# ==========================================

def register_error_handlers(app):

    app.register_error_handler(
        400,
        handle_400
    )

    app.register_error_handler(
        401,
        handle_401
    )

    app.register_error_handler(
        403,
        handle_403
    )

    app.register_error_handler(
        404,
        handle_404
    )

    app.register_error_handler(
        500,
        handle_500
    )