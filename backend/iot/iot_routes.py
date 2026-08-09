from flask import Blueprint, request, jsonify

from backend.database.database import SessionLocal
from backend.database.models.iot_data import IoTData


iot_bp = Blueprint("iot", __name__)


@iot_bp.route("/iot-data", methods=["POST"])
def receive_iot_data():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No JSON data received"
        }), 400

    # Get values
    temperature = data.get("temperature")
    humidity = data.get("humidity")
    light = data.get("light")
    distance = data.get("distance")
    motion = data.get("motion")

    # Convert invalid sensor values to None
    if temperature is not None:
        temperature = float(temperature)

    if humidity is not None:
        humidity = float(humidity)

    if light is not None:
        light = float(light)

    if distance is not None:
        distance = float(distance)

    if motion is not None:
        motion = bool(motion)

    # Print received data
    print("\n==============================")
    print("IoT DATA RECEIVED")
    print("==============================")

    print("Temperature :", temperature)
    print("Humidity    :", humidity)
    print("Light       :", light)
    print("Distance    :", distance)
    print("Motion      :", motion)

    # Save to database
    db = SessionLocal()

    try:

        new_data = IoTData(
            temperature=temperature,
            humidity=humidity,
            light=light,
            distance=distance,
            motion=motion
        )

        db.add(new_data)
        db.commit()
        db.refresh(new_data)

        print("------------------------------")
        print("Saved to PostgreSQL!")
        print("Database ID :", new_data.id)
        print("==============================\n")

        return jsonify({
            "message": "IoT data received and saved successfully",
            "data": {
                "id": new_data.id,
                "temperature": new_data.temperature,
                "humidity": new_data.humidity,
                "light": new_data.light,
                "distance": new_data.distance,
                "motion": new_data.motion,
                "created_at": new_data.created_at.isoformat()
            }
        }), 200

    except Exception as e:

        db.rollback()

        print("\n==============================")
        print("DATABASE ERROR")
        print("==============================")
        print(e)
        print("==============================\n")

        return jsonify({
            "error": "Failed to save IoT data",
            "details": str(e)
        }), 500

    finally:
        db.close()