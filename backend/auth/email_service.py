
import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email_otp(receiver_email: str, otp: str):
    """
    Send an OTP email for VitaSense verification.
    """

    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("Email configuration is missing.")
        return False

    subject = "VitaSense Email Verification"

    body = f"""
Hello,

Your VitaSense verification code is:

{otp}

This OTP is valid for 5 minutes.

If you didn't request this verification, you can safely ignore this email.

Regards,
VitaSense Team
"""

    message = MIMEMultipart()
    message["From"] = EMAIL_ADDRESS
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(
                EMAIL_ADDRESS,
                receiver_email,
                message.as_string()
            )

        return True

    except Exception as e:
        print("Email Error:", e)
        return False


def send_otp(email: str, otp: str):
    """
    Compatibility function for password-reset OTP emails.
    """

    return send_email_otp(email, otp)
