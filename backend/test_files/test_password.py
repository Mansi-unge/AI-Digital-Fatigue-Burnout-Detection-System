from backend.auth.password_utils import (
    hash_password,
    verify_password
)


def main():
    password = "Research@123"

    hashed_password = hash_password(password)

    print("=" * 50)
    print("Original Password :", password)
    print("Hashed Password   :", hashed_password)
    print("=" * 50)

    print("Correct Password :", verify_password(password, hashed_password))
    print("Wrong Password   :", verify_password("Hello123", hashed_password))


if __name__ == "__main__":
    main()