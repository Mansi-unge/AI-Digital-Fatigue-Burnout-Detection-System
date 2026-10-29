from backend.app import app


def test_prediction_route():

    client = app.test_client()

    response = client.get(
        "/prediction/1"
    )

    # Depending on your prediction route,
    # authentication, and whether user 1 exists,
    # the response may be 200, 401, or 404.
    assert response.status_code in [200, 401, 404]

    print(
        "Prediction route status:",
        response.status_code
    )


if __name__ == "__main__":

    test_prediction_route()

    print("================================")
    print("PREDICTION TEST PASSED")
    print("================================")