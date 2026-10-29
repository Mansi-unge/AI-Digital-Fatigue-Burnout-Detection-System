import time

from backend.monitoring.keyboard import KeyboardMonitor


monitor = KeyboardMonitor()

print("Starting keyboard monitor...")

monitor.start()

print("Type some keys for 10 seconds.")
print("Press CTRL+C to stop.")


try:

    for i in range(10):

        time.sleep(1)

        print(
            "Keyboard count:",
            monitor.get_count()
        )

except KeyboardInterrupt:

    print("Stopping...")


finally:

    monitor.stop()

    print(
        "Final keyboard count:",
        monitor.get_count()
    )