from backend.monitoring.battery import BatteryMonitor


monitor = BatteryMonitor()

print("Starting battery monitor...")

monitor.start()

print()

data = monitor.get_battery_status()

print("================================")
print("Battery percentage :", data["battery_percentage"], "%")
print("Charging status    :", data["charging_status"])
print("================================")

print()

monitor.stop()

print("Test completed.")