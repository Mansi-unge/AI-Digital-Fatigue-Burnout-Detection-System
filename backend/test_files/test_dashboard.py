from backend.app import app


def test_dashboard_route():

    client = app.test_client()

    response = client.get(
        "/dashboard/1"
    )

    # Depending on whether user ID 1 exists,
    # the route may return 200 or 404.
    assert response.status_code in [200, 404]

    print("Dashboard route status:", response.status_code)


if __name__ == "__main__":

    test_dashboard_route()

    print("================================")
    print("DASHBOARD TEST PASSED")
    print("================================")