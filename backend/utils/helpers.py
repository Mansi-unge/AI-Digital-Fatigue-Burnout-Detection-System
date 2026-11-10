from datetime import datetime


# ==========================================
# SAFE INTEGER
# ==========================================

def safe_int(value, default=0):

    try:
        return int(value)

    except (TypeError, ValueError):
        return default


# ==========================================
# SAFE FLOAT
# ==========================================

def safe_float(value, default=0.0):

    try:
        return float(value)

    except (TypeError, ValueError):
        return default


# ==========================================
# SAFE BOOLEAN
# ==========================================

def safe_bool(value, default=False):

    if isinstance(value, bool):
        return value

    if isinstance(value, str):

        value = value.lower().strip()

        if value in ("true", "1", "yes", "on"):
            return True

        if value in ("false", "0", "no", "off"):
            return False

    if isinstance(value, int):

        return value != 0

    return default


# ==========================================
# FORMAT DATETIME
# ==========================================

def format_datetime(value):

    if not value:
        return None

    if isinstance(value, datetime):
        return value.isoformat()

    return str(value)


# ==========================================
# CURRENT TIMESTAMP
# ==========================================

def current_timestamp():

    return datetime.utcnow()


# ==========================================
# FORMAT SECONDS
# ==========================================

def format_seconds(seconds):

    seconds = safe_int(seconds)

    hours = seconds // 3600

    minutes = (seconds % 3600) // 60

    remaining_seconds = seconds % 60

    return {
        "hours": hours,
        "minutes": minutes,
        "seconds": remaining_seconds
    }


# ==========================================
# CALCULATE PERCENTAGE
# ==========================================

def calculate_percentage(value, total):

    value = safe_float(value)

    total = safe_float(total)

    if total <= 0:
        return 0.0

    percentage = (value / total) * 100

    return round(percentage, 2)


# ==========================================
# LIMIT SCORE
# ==========================================

def limit_score(score):

    score = safe_float(score)

    if score < 0:
        return 0.0

    if score > 100:
        return 100.0

    return round(score, 2)