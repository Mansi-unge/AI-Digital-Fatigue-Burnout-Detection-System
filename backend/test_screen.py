import time

from backend.monitoring.screen import ScreenMonitor


monitor = ScreenMonitor()

print("Starting screen monitor...")

monitor.start()

print("Screen time is being tracked for 10 seconds.")


try:

    for i in range(10):

        time.sleep(1)

        print(
            "Screen time:",
            monitor.get_screen_time(),
            "seconds"
        )


except KeyboardInterrupt:

    print("Stopping...")


finally:

    monitor.stop()

    print()
    print(
        "Final screen time:",
        monitor.get_screen_time(),
        "seconds"
    )