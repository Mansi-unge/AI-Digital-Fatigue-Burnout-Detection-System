
import os
import smtplib
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH, override=True)

EMAIL = os.getenv("MAIL_USERNAME")
PASSWORD = os.getenv("MAIL_PASSWORD", "").replace(" ", "")

print("ENV file:", ENV_PATH)
print("Email configured:", bool(EMAIL))
print("Password configured:", bool(PASSWORD))

try:
    print("\nConnecting to Gmail...")

    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.set_debuglevel(1)

        server.ehlo()
        print("\nStarting TLS...")
        server.starttls()
        server.ehlo()

        print("\nAuthenticating...")
        server.login(EMAIL, PASSWORD)

        print("\nSUCCESS: Gmail SMTP authentication working!")

except Exception as e:
    print("\nSMTP ERROR:", repr(e))
