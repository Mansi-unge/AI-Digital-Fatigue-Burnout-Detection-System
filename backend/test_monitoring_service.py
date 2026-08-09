from backend.monitoring.monitoring_service import MonitoringService


USER_ID = 4


service = MonitoringService()


result = service.save_activity(

    user_id=USER_ID,

    screen_time=300,

    active_time=250,

    idle_time=50,

    keyboard_count=120,

    typing_speed=35,

    mouse_clicks=40,

    mouse_distance=200,

    scroll_count=15,

    active_application="Visual Studio Code",

    application_switches=4,

    work_duration=250,

    break_duration=50,

    brightness=70,

    battery_percentage=85,

    charging_status=True
)


print(result)