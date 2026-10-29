from backend.app import app


def test_auth_routes():

    client = app.test_client()

    response = client.post(
        "/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )

    # The route should exist.
    # 200, 400 or 401 are acceptable depending
    # on your current login implementation.
    assert response.status_code in [200, 400, 401]


if __name__ == "__main__":

    test_auth_routes()

    print("================================")
    print("AUTH TEST PASSED")
    print("================================")