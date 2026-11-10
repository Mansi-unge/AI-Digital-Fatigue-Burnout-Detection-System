import time

from backend.monitoring.monitor_manager import MonitorManager


manager = MonitorManager()

print("Starting Monitor Manager...")

manager.start()

print()
print("Monitor Manager is running.")
print("Use your keyboard and mouse.")
print("Open different applications.")
print()


try:

    for i in range(15):

        time.sleep(2)

        data = manager.get_data()

        print()
        print("================================")
        print("MONITORING DATA")
        print("================================")

        print(
            "Keyboard:",
            data["keyboard_count"]
        )

        print(
            "Mouse clicks:",
            data["mouse_clicks"]
        )

        print(
            "Mouse distance:",
            data["mouse_distance"]
        )

        print(
            "Scroll:",
            data["scroll_count"]
        )

        print(
            "Screen time:",
            data["screen_time"],
            "seconds"
        )

        print(
            "Idle time:",
            data["idle_time"],
            "seconds"
        )

        print(
            "Application:",
            data["active_application"]
        )

        print(
            "Application switches:",
            data["application_switches"]
        )

        print(
            "Webcam:",
            data["webcam_available"]
        )

        print(
            "Brightness:",
            data["brightness"]
        )

        print(
            "Battery:",
            data["battery_percentage"],
            "%"
        )

        print(
            "Charging:",
            data["charging_status"]
        )

        print("================================")


except KeyboardInterrupt:

    print()
    print("Stopping...")


finally:

    manager.stop()

    print()
    print("Test completed.")