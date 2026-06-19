"""Send the complaint to a controlled demo-safe inbox only."""
import smtplib
from email.message import EmailMessage
from pathlib import Path


def send_demo_safe(
    subject: str,
    body: str,
    attachment: Path | None,
    demo_inbox: str,
    smtp_user: str,
    smtp_password: str,
    host: str,
    port: int,
) -> None:
    """Send to the demo inbox (never to a real authority during the demo)."""
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = demo_inbox
    msg.set_content(body)
    if attachment and attachment.exists():
        msg.add_attachment(
            attachment.read_bytes(), maintype="application", subtype="pdf",
            filename=attachment.name,
        )
    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, demo_inbox, msg.as_string())
