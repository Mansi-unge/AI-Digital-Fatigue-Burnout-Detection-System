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
    Send OTP to user's email.
    """

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

    message.attach(
        MIMEText(body, "plain")
    )

    try:

        server = smtplib.SMTP(
            "smtp.gmail.com",
            587
        )

        server.starttls()

        server.login(
            EMAIL_ADDRESS,
            EMAIL_PASSWORD
        )

        server.sendmail(
            EMAIL_ADDRESS,
            receiver_email,
            message.as_string()
        )

        server.quit()

        return True

    except Exception as e:

        print("Email Error:", e)

        return False