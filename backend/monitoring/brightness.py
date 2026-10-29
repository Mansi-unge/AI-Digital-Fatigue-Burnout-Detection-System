import screen_brightness_control as sbc


class BrightnessMonitor:

    def __init__(self):

        self.brightness = 0

    # ==========================================
    # GET CURRENT BRIGHTNESS
    # ==========================================

    def get_brightness(self):

        try:

            value = sbc.get_brightness()

            # Some systems return a list
            if isinstance(value, list):

                if len(value) > 0:

                    self.brightness = float(value[0])

                else:

                    self.brightness = 0

            else:

                self.brightness = float(value)

            return self.brightness

        except Exception as e:

            print("Brightness error:", e)

            return 0

    # ==========================================
    # SET BRIGHTNESS
    # ==========================================

    def set_brightness(self, value):

        try:

            value = max(0, min(100, int(value)))

            sbc.set_brightness(value)

            self.brightness = value

            return True

        except Exception as e:

            print("Unable to change brightness:", e)

            return False

    # ==========================================
    # START
    # ==========================================

    def start(self):

        self.get_brightness()

        print(
            "Brightness monitor started.",
            "Current:",
            self.brightness,
            "%"
        )

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        print("Brightness monitor stopped.")

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.brightness = 0