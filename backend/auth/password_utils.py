import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a plain-text password.
    """

    # Convert password to bytes
    password_bytes = password.encode("utf-8")

    # Generate salt
    salt = bcrypt.gensalt()

    # Hash password
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    # Return hash as string
    return hashed_password.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.
    """

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )