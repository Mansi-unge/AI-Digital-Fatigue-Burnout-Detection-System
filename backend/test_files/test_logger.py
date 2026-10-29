from backend.utils.logger import get_logger


logger = get_logger("TestLogger")


logger.info("Logger test started")

logger.warning("This is a warning")

logger.error("This is an error")


print("Logger test completed.")
print("Check logs/backend.log")