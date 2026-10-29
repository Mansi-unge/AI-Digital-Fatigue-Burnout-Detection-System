import time

from backend.monitoring.mouse import MouseMonitor


monitor = MouseMonitor()

print("Starting mouse monitor...")

monitor.start()

print("Move your mouse, click and scroll for 10 seconds.")


try:

    for i in range(10):

        time.sleep(1)

        print("--------------------------------")
        print("Mouse clicks :", monitor.get_clicks())
        print("Distance     :", monitor.get_distance())
        print("Scroll count :", monitor.get_scroll_count())
        print("--------------------------------")


except KeyboardInterrupt:

    print("Stopping...")


finally:

    monitor.stop()

    print()
    print("Final results:")
    print("Mouse clicks :", monitor.get_clicks())
    print("Distance     :", monitor.get_distance())
    print("Scroll count :", monitor.get_scroll_count())