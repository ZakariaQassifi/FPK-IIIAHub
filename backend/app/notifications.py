import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.config import get_settings

settings = get_settings()


def _build_message(
    to_email: str, subject: str, body_text: str, body_html: str | None = None
) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = formataddr(
        ("FPK Academic Hub", settings.smtp_from or "noreply@fpk.ac.ma")
    )
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")
    return msg


def send_email(to_email: str, subject: str, body_text: str, body_html: str | None = None) -> bool:
    """Send a single email via SMTP. Returns True on success."""
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        # SMTP not configured; silently skip
        return False

    msg = _build_message(to_email, subject, body_text, body_html)

    try:
        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10)
            server.login(settings.smtp_user, settings.smtp_password)

        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False


def send_bulk_email(
    recipients: list[str], subject: str, body_text: str, body_html: str | None = None
) -> int:
    """Send an email to multiple recipients. Returns the number of successfully sent emails."""
    sent = 0
    for recipient in recipients:
        if send_email(recipient, subject, body_text, body_html):
            sent += 1
    return sent


def resource_approved_notification(
    student_email: str, resource_title: str, category: str, module_title: str
) -> tuple[str, str, str | None]:
    """Build email content for a resource approval notification."""
    subject = f"[FPK IIIA] Nouvelle ressource disponible : {resource_title}"
    text = f"""
Bonjour,

Une nouvelle ressource académique a été validée et est maintenant disponible sur la plateforme FPK IIIA Academic Hub.

Détails :
- Titre : {resource_title}
- Catégorie : {category}
- Module : {module_title}

Connectez-vous à la bibliothèque pour télécharger cette ressource.

Cordialement,
L'équipe FPK Academic Hub
"""
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1d1d1f; }}
    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
    .card {{ border: 1px solid #aaaaaa; border-radius: 12px; padding: 24px; background: #ffffff; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; border: 1px solid #e5f3ff; background: #e5f3ff; color: #007aff; }}
    .btn {{ display: inline-block; margin-top: 16px; padding: 12px 24px; background: #007aff; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #8e8e93; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Nouvelle ressource disponible</h1>
      <p>Bonjour,</p>
      <p>Une nouvelle ressource académique a été validée et est maintenant disponible sur la plateforme <strong>FPK IIIA Academic Hub</strong>.</p>
      <div style="margin: 16px 0;">
        <span class="badge">{category}</span>
        <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700;">{resource_title}</p>
        <p style="margin: 4px 0 0 0; color: #8e8e93;">Module : {module_title}</p>
      </div>
      <a href="http://localhost:5173/library" class="btn">Accéder à la bibliothèque</a>
      <div class="footer">
        <p>Cordialement,<br>L'équipe FPK Academic Hub</p>
      </div>
    </div>
  </div>
</body>
</html>
"""
    return subject, text, html


def announcement_notification(
    student_email: str, title: str, content: str, category: str
) -> tuple[str, str, str | None]:
    """Build email content for an announcement notification."""
    subject = f"[FPK IIIA] Nouvelle annonce : {title}"
    text = f"""
Bonjour,

Une nouvelle annonce a été publiée sur la plateforme FPK IIIA Academic Hub.

Titre : {title}
Catégorie : {category}

Contenu :
{content}

Connectez-vous à la plateforme pour plus d'informations.

Cordialement,
L'équipe FPK Academic Hub
"""
    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1d1d1f; }}
    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
    .card {{ border: 1px solid #aaaaaa; border-radius: 12px; padding: 24px; background: #ffffff; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; border: 1px solid #e5f3ff; background: #e5f3ff; color: #007aff; }}
    .content-box {{ margin: 16px 0; padding: 16px; background: #f5f5f7; border-radius: 8px; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #8e8e93; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1 style="margin-top: 0; font-size: 24px; font-weight: 800;">Nouvelle annonce officielle</h1>
      <p>Bonjour,</p>
      <p>Une nouvelle annonce a été publiée sur la plateforme <strong>FPK IIIA Academic Hub</strong>.</p>
      <div style="margin: 16px 0;">
        <span class="badge">{category}</span>
        <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700;">{title}</p>
        <div class="content-box">{content}</div>
      </div>
      <div class="footer">
        <p>Cordialement,<br>L'équipe FPK Academic Hub</p>
      </div>
    </div>
  </div>
</body>
</html>
"""
    return subject, text, html
