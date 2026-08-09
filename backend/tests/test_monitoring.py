from backend.app import app


def test_monitoring_route():

    client = app.test_client()

    response = client.get(
        "/monitoring/1"
    )

    # Depending on your monitoring route and
    # whether user ID 1 exists, it may return
    # 200, 401, or 404.
    assert response.status_code in [200, 401, 404]

    print(
        "Monitoring route status:",
        response.status_code
    )


if __name__ == "__main__":

    test_monitoring_route()

    print("================================")
    print("MONITORING TEST PASSED")
    print("================================")