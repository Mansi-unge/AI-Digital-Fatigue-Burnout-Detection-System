from backend.monitoring.webcam import WebcamMonitor


monitor = WebcamMonitor()

print("Starting webcam monitor...")

monitor.start()

print()
print("Webcam available:", monitor.get_status())
print()

monitor.stop()

print("Test completed.")