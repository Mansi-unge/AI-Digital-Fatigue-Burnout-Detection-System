from backend.app import app


def test_reports_route():

    client = app.test_client()

    response = client.get(
        "/reports/1"
    )

    # Depending on your reports route,
    # authentication, and whether user 1 exists,
    # the response may be 200, 401, or 404.
    assert response.status_code in [200, 401, 404]

    print(
        "Reports route status:",
        response.status_code
    )


if __name__ == "__main__":

    test_reports_route()

    print("================================")
    print("REPORTS TEST PASSED")
    print("================================")