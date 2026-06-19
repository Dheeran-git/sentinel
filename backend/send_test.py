"""Manual check for the demo-safe email send.

After setting SMTP_USER + SMTP_PASSWORD (a Gmail App Password) and DEMO_INBOX in
.env, run:

    uv run python send_test.py

It sends one test email to DEMO_INBOX so you can confirm the pipeline works
before the live demo. The same path runs automatically at the end of a mission
(execute_node) when SMTP is configured.
"""
from sentinel.config import settings
from sentinel.delivery.email import send_demo_safe


def main() -> None:
    fields = {
        "DEMO_INBOX": settings.demo_inbox,
        "SMTP_USER": settings.smtp_user,
        "SMTP_PASSWORD": settings.smtp_password,
    }
    missing = [k for k, v in fields.items() if not v or v.startswith("your-")]
    if missing:
        print("Not configured yet. Set these in backend/.env:", ", ".join(missing))
        print("SMTP_PASSWORD must be a Gmail App Password (not your normal password).")
        return

    send_demo_safe(
        subject="SENTINEL test email",
        body="If you can read this, SENTINEL's demo-safe email send works.",
        attachment=None,
        demo_inbox=settings.demo_inbox,
        smtp_user=settings.smtp_user,
        smtp_password=settings.smtp_password,
        host=settings.smtp_host,
        port=settings.smtp_port,
    )
    print(f"Sent a test email to {settings.demo_inbox}. Check that inbox.")


if __name__ == "__main__":
    main()
