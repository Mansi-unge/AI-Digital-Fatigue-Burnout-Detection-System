# ==========================================
# APPLICATION CONSTANTS
# ==========================================

APP_NAME = "AI Digital Fatigue Burnout Detection System"


# ==========================================
# MONITORING
# ==========================================

MONITORING_INTERVAL = 10

DEFAULT_SCREEN_TIME = 0.0
DEFAULT_ACTIVE_TIME = 0.0
DEFAULT_IDLE_TIME = 0.0

DEFAULT_KEYBOARD_COUNT = 0
DEFAULT_MOUSE_CLICKS = 0
DEFAULT_MOUSE_DISTANCE = 0.0
DEFAULT_SCROLL_COUNT = 0


# ==========================================
# WEBCAM
# ==========================================

WEBCAM_ENABLED = True

WEBCAM_CAMERA_INDEX = 0

WEBCAM_FRAME_WIDTH = 640
WEBCAM_FRAME_HEIGHT = 480


# ==========================================
# FATIGUE
# ==========================================

FATIGUE_LOW = 0
FATIGUE_MEDIUM = 40
FATIGUE_HIGH = 70


# ==========================================
# BURNOUT
# ==========================================

BURNOUT_LOW = 0
BURNOUT_MEDIUM = 40
BURNOUT_HIGH = 70


# ==========================================
# SETTINGS
# ==========================================

DEFAULT_THEME = "light"

DEFAULT_MONITORING_ENABLED = True
DEFAULT_KEYBOARD_MONITORING = True
DEFAULT_MOUSE_MONITORING = True
DEFAULT_SCREEN_MONITORING = True
DEFAULT_IDLE_MONITORING = True
DEFAULT_APPLICATION_MONITORING = True
DEFAULT_WEBCAM_MONITORING = True

DEFAULT_NOTIFICATIONS_ENABLED = True
DEFAULT_BREAK_REMINDERS = True
DEFAULT_FATIGUE_ALERTS = True


# ==========================================
# HTTP STATUS
# ==========================================

HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_INTERNAL_SERVER_ERROR = 500