from backend.monitoring.brightness import BrightnessMonitor


monitor = BrightnessMonitor()

monitor.start()

print()
print("Current brightness:", monitor.get_brightness(), "%")
print()

monitor.stop()