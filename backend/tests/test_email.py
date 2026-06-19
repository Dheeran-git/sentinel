from unittest.mock import MagicMock, patch
from sentinel.delivery.email import send_demo_safe


def test_send_routes_to_demo_inbox():
    with patch("sentinel.delivery.email.smtplib.SMTP") as smtp:
        instance = MagicMock()
        smtp.return_value.__enter__.return_value = instance
        send_demo_safe(subject="Complaint", body="text", attachment=None,
                       demo_inbox="safe@example.com", smtp_user="s@x.com",
                       smtp_password="pw", host="h", port=587)
        assert instance.sendmail.called
        to_addr = instance.sendmail.call_args[0][1]
        assert to_addr == "safe@example.com"
