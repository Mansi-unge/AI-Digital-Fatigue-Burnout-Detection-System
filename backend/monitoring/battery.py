import psutil


class BatteryMonitor:

    def __init__(self):

        self.battery_percentage = 100.0

        self.charging_status = False

    # ==========================================
    # GET BATTERY INFORMATION
    # ==========================================

    def get_battery_status(self):

        try:

            battery = psutil.sensors_battery()

            if battery is None:

                print("Battery information is not available.")

                return {
                    "battery_percentage": 0.0,
                    "charging_status": False
                }

            self.battery_percentage = float(
                battery.percent
            )

            self.charging_status = bool(
                battery.power_plugged
            )

            return {
                "battery_percentage":
                    self.battery_percentage,

                "charging_status":
                    self.charging_status
            }

        except Exception as e:

            print("Battery error:", e)

            return {
                "battery_percentage": 0.0,
                "charging_status": False
            }

    # ==========================================
    # GET BATTERY PERCENTAGE
    # ==========================================

    def get_percentage(self):

        self.get_battery_status()

        return self.battery_percentage

    # ==========================================
    # GET CHARGING STATUS
    # ==========================================

    def is_charging(self):

        self.get_battery_status()

        return self.charging_status

    # ==========================================
    # START
    # ==========================================

    def start(self):

        data = self.get_battery_status()

        print("Battery monitor started.")

        print(
            "Battery:",
            data["battery_percentage"],
            "%"
        )

        print(
            "Charging:",
            data["charging_status"]
        )

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        print("Battery monitor stopped.")

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.battery_percentage = 100.0

        self.charging_status = False