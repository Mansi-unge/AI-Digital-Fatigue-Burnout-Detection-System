import random


def generate_otp(length=6):
    """
    Generate a numeric OTP.

    Default:
        6 digits

    Returns:
        str
    """

    digits = "0123456789"

    otp = "".join(
        random.choice(digits)
        for _ in range(length)
    )

    return otp