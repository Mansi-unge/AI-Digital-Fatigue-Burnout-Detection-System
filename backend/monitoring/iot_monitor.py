class IoTMonitor:

    def __init__(self):

        self.running = False

        # ==========================================
        # LATEST IoT SENSOR DATA
        # ==========================================

        self.temperature = None
        self.humidity = None
        self.light = None
        self.distance = None
        self.motion = None

    # ==========================================
    # START
    # ==========================================

    def start(self):

        if self.running:

            print("IoT monitor is already running.")

            return

        self.running = True

        print("IoT monitor started.")

    # ==========================================
    # UPDATE SENSOR DATA
    # ==========================================

    def update_data(
        self,
        temperature=None,
        humidity=None,
        light=None,
        distance=None,
        motion=None
    ):

        self.temperature = temperature
        self.humidity = humidity
        self.light = light
        self.distance = distance
        self.motion = motion

    # ==========================================
    # GET SENSOR DATA
    # ==========================================

    def get_data(self):

        if not self.running:

            return {
                "temperature": None,
                "humidity": None,
                "light": None,
                "distance": None,
                "motion": None
            }

        return {

            "temperature": self.temperature,

            "humidity": self.humidity,

            "light": self.light,

            "distance": self.distance,

            "motion": self.motion
        }

    # ==========================================
    # STOP
    # ==========================================

    def stop(self):

        self.running = False

        print("IoT monitor stopped.")

    # ==========================================
    # STATUS
    # ==========================================

    def is_running(self):

        return self.running