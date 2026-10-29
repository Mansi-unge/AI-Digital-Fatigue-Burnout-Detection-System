import time

from backend.monitoring.applications import ApplicationMonitor


monitor = ApplicationMonitor()

monitor.start()

print()
print("Application monitor is running.")
print("Open different applications such as VS Code, Chrome,")
print("File Explorer, etc.")
print("Press CTRL+C to stop.")
print()


try:

    while True:

        application = monitor.get_active_application()

        switches = monitor.get_application_switches()

        print("--------------------------------")
        print("Active application :", application)
        print("Application switches:", switches)
        print("--------------------------------")

        time.sleep(2)


except KeyboardInterrupt:

    print()
    print("Stopping application monitor...")

finally:

    monitor.stop()