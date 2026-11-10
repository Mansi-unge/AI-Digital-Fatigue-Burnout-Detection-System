import logging
import os


# ==========================================
# LOG DIRECTORY
# ==========================================

LOG_DIR = "logs"

os.makedirs(LOG_DIR, exist_ok=True)


# ==========================================
# LOG FILE
# ==========================================

LOG_FILE = os.path.join(
    LOG_DIR,
    "backend.log"
)


# ==========================================
# LOGGER CONFIGURATION
# ==========================================

logging.basicConfig(
    level=logging.INFO,

    format=(
        "%(asctime)s - "
        "%(levelname)s - "
        "%(name)s - "
        "%(message)s"
    ),

    handlers=[
        logging.FileHandler(
            LOG_FILE,
            encoding="utf-8"
        ),

        logging.StreamHandler()
    ]
)


# ==========================================
# GET LOGGER
# ==========================================

def get_logger(name):

    return logging.getLogger(name)