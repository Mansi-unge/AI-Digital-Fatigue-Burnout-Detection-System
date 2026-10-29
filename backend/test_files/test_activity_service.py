import time

from backend.monitor.keyboard import KeyboardMonitor
from backend.monitor.mouse import MouseMonitor
from backend.monitor.screen import ScreenMonitor
from backend.monitor.idle import IdleMonitor
from backend.monitor.applications import ApplicationMonitor
from backend.monitor.activity_service import ActivityService


# Replace this with an existing user ID
USER_ID = 1


keyboard_monitor = KeyboardMonitor()
mouse_monitor = MouseMonitor()
screen_monitor = ScreenMonitor()
idle_monitor = IdleMonitor()
application_monitor = ApplicationMonitor()


keyboard_monitor.start()
mouse_monitor.start()
screen_monitor.start()
idle_monitor.start()


activity_service = ActivityService(

    USER_ID,

    keyboard_monitor,

    mouse_monitor,

    screen_monitor,

    idle_monitor,

    application_monitor

)

activity_service.start()

print("Activity Service Started...")
print("Use keyboard, mouse and switch applications.")
print("Data will be saved every 60 seconds.\n")


try:

    while True:

        print("--------------------------------")

        print("Keyboard :", keyboard_monitor.get_count())

        print("Mouse :", mouse_monitor.get_count())

        print("Screen :", screen_monitor.get_screen_time())

        print("Idle :", idle_monitor.get_idle_time())

        print("Application :", application_monitor.get_active_application())

        print("--------------------------------")

        time.sleep(5)

except KeyboardInterrupt:

    print("\nStopping Activity Service...")

    activity_service.stop()

    keyboard_monitor.stop()

    mouse_monitor.stop()

    screen_monitor.stop()

    idle_monitor.stop()

    print("Stopped Successfully")