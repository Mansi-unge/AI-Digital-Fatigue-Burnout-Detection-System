import re


# ==========================================
# VALIDATE EMAIL
# ==========================================

def validate_email(email):

    if not email:
        return False

    email = email.strip()

    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    return re.match(pattern, email) is not None


# ==========================================
# VALIDATE PASSWORD
# ==========================================

def validate_password(password):

    if not password:
        return False

    if len(password) < 8:
        return False

    return True


# ==========================================
# VALIDATE MOBILE NUMBER
# ==========================================

def validate_mobile_number(mobile_number):

    if not mobile_number:
        return False

    mobile_number = str(mobile_number).strip()

    # Allows 10-digit Indian mobile number
    pattern = r"^[6-9][0-9]{9}$"

    return re.match(pattern, mobile_number) is not None


# ==========================================
# VALIDATE OTP
# ==========================================

def validate_otp(otp):

    if not otp:
        return False

    otp = str(otp).strip()

    return otp.isdigit() and len(otp) == 6


# ==========================================
# VALIDATE USER ID
# ==========================================

def validate_user_id(user_id):

    try:

        user_id = int(user_id)

        return user_id > 0

    except (TypeError, ValueError):

        return False


# ==========================================
# VALIDATE THEME
# ==========================================

def validate_theme(theme):

    if not theme:
        return False

    return theme.lower() in [
        "light",
        "dark"
    ]


# ==========================================
# VALIDATE BOOLEAN
# ==========================================

def validate_boolean(value):

    return isinstance(value, bool)