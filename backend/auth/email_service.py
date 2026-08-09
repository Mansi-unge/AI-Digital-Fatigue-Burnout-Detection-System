import smtplib

from email.mime.text import MIMEText


EMAIL = "your_email@gmail.com"

PASSWORD = "your_app_password"


def send_otp(email, otp):

    subject = "Password Reset OTP"

    body = f"""

Hello,

Your OTP is:

{otp}

It expires in 5 minutes.

"""

    message = MIMEText(body)

    message["Subject"] = subject
    message["From"] = EMAIL
    message["To"] = email

    server = smtplib.SMTP("smtp.gmail.com", 587)

    server.starttls()

    server.login(EMAIL, PASSWORD)

    server.send_message(message)

    server.quit()