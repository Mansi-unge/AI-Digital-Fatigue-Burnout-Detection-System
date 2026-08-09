from backend.utils.validators import (
    validate_email,
    validate_password,
    validate_mobile_number,
    validate_otp,
    validate_user_id,
    validate_theme,
    validate_boolean
)


print("================================")
print("VALIDATORS TEST")
print("================================")

print(
    "Email:",
    validate_email("test@gmail.com")
)

print(
    "Password:",
    validate_password("password123")
)

print(
    "Mobile:",
    validate_mobile_number("9876543210")
)

print(
    "OTP:",
    validate_otp("123456")
)

print(
    "User ID:",
    validate_user_id(1)
)

print(
    "Theme:",
    validate_theme("dark")
)

print(
    "Boolean:",
    validate_boolean(True)
)

print("================================")