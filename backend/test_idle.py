import time

from backend.monitoring.idle import IdleMonitor


monitor = IdleMonitor()

print("Starting idle monitor...")

monitor.start()

print()
print("Do NOT touch the keyboard or mouse.")
print("Watch idle time increase.")
print()


try:

    for i in range(15):

        time.sleep(1)

        print(
            "Idle time:",
            round(monitor.get_idle_time(), 1),
            "seconds"
        )

except KeyboardInterrupt:

    print("Stopping...")


finally:

    monitor.stop()

    print()
    print("Idle monitor stopped.")