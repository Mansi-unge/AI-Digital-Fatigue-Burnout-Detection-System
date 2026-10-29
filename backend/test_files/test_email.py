from backend.auth.email_service import send_email_otp

result = send_email_otp(
    "mansiunge@gmail.com",
    "654321"
)

print(result)