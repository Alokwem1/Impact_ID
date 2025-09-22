"""
Email module for Impact ID application.
"""


from dataclasses import dataclass
from datetime import datetime, timedelta
from email import encoders
from email.message import EmailMessage
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from enum import Enum
from pathlib import Path
from typing import List, Optional, Dict, Any, Union
import json
import logging
import os
import re

from jinja2 import Environment, FileSystemLoader, select_autoescape
import aiosmtplib
import asyncio
import smtplib

from app.utils.common import utcnow


logger = logging.getLogger(__name__)

# =========================
# 📧 Email Configuration
# =========================

class EmailProvider(str, Enum):
    """EmailProvider class for Impact ID application."""
    SMTP = "smtp"
    SENDGRID = "sendgrid"
    MAILGUN = "mailgun"
    SES = "ses"

@dataclass
class EmailConfig:
    """Email configuration with validation."""
    host: str
    port: int
    username: str
    password: str
    use_tls: bool = True
    use_ssl: bool = False
    timeout: int = 30
    from_email: str = None
    from_name: str = "Impact ID"

    def __post_init__(self):
        """__post_init__ function."""
        if not self.from_email:
            self.from_email = f"noreply@{self.host.replace('smtp.', '')}"

@dataclass
class EmailAttachment:
    """Email attachment structure."""
    filename: str
    content: bytes
    content_type: str = "application/octet-stream"

class EmailTemplate(str, Enum):
    """Available email templates."""
    WELCOME = "welcome"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    TASK_APPROVED = "task_approved"
    TASK_REJECTED = "task_rejected"
    BADGE_EARNED = "badge_earned"
    WEEKLY_SUMMARY = "weekly_summary"
    ADMIN_NOTIFICATION = "admin_notification"

# =========================
# 🎨 Template Engine Setup
# =========================

# Setup Jinja2 templates
TEMPLATE_DIR = Path(__file__).parent.parent / "templates" / "emails"
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml']),
    trim_blocks=True,
    lstrip_blocks=True
)

# =========================
# ⚙️ Email Service Class
# =========================

class EmailService:
    """
    🚀 Production-grade async email service with templates, retries, and monitoring.
    """

    def __init__(self):
        """__init__ function."""
        self.config = self._load_config()
        self.rate_limiter = EmailRateLimiter()
        self.failed_emails = []

    def _load_config(self) -> Optional[EmailConfig]:
        """Load and validate email configuration."""
        try:
            return EmailConfig(
                host=os.getenv("EMAIL_SMTP_HOST"),
                port=int(os.getenv("EMAIL_SMTP_PORT", 587)),
                username=os.getenv("EMAIL_SMTP_USER"),
                password=os.getenv("EMAIL_SMTP_PASSWORD"),
                use_tls=os.getenv("EMAIL_USE_TLS", "true").lower() == "true",
                use_ssl=os.getenv("EMAIL_USE_SSL", "false").lower() == "true",
                timeout=int(os.getenv("EMAIL_TIMEOUT", 30)),
                from_email=os.getenv("EMAIL_FROM"),
                from_name=os.getenv("EMAIL_FROM_NAME", "Impact ID")
            )
        except (TypeError, ValueError) as e:
            logger.error("Email configuration error: %s", e)
            return None

    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        if not self.config:
            return False
        return bool(self.config.host and self.config.username and self.config.password)

    async def send_email(
        self,
        to: Union[str, List[str]],
        subject: str,
        body: str = None,
        html_body: str = None,
        template: EmailTemplate = None,
        template_data: Dict[str, Any] = None,
        attachments: List[EmailAttachment] = None,
        priority: str = "normal",
        retry_count: int = 3,
        track_opens: bool = False
    ) -> bool:
        """
        🎯 Send email with advanced features and error handling.
        """
        if not self.is_configured():
            logger.warning("Email not sent: smtp not configured recipient=%s", to)
            logger.info("Email content preview subject=%s body_len=%s html_len=%s", subject, len(body or ''), len(html_body or ''))
            return False

        # Normalize recipients
        recipients = [to] if isinstance(to, str) else to

        # Validate email addresses
        valid_recipients = []
        for recipient in recipients:
            if self._validate_email(recipient):
                valid_recipients.append(recipient)
            else:
                logger.warning("Invalid email address: %s", recipient)

        if not valid_recipients:
            logger.error("No valid recipients found")
            return False

        # Check rate limits
        if not await self.rate_limiter.can_send(valid_recipients[0]):
            logger.warning("Rate limit exceeded for %s", valid_recipients[0])
            return False

        # Generate email content
        try:
            if template:
                html_body, body = await self._render_template(template, template_data or {})

            # Create message
            msg = await self._create_message(
                recipients=valid_recipients,
                subject=subject,
                body=body,
                html_body=html_body,
                attachments=attachments or [],
                track_opens=track_opens
            )

            # Send with retries
            success = await self._send_with_retries(msg, retry_count)

            if success:
                logger.info("Email sent successfully to %s", valid_recipients)
                await self.rate_limiter.record_send(valid_recipients[0])
            else:
                logger.error("Failed to send email to %s", valid_recipients)
                self._record_failure(valid_recipients, subject, body or html_body)

            return success

        except Exception as e:
            logger.error("Email service error: %s", e)
            return False

    async def _render_template(self, template: EmailTemplate, data: Dict[str, Any]) -> tuple[str, str]:
        """Render email template with data."""
        try:
            # Load HTML template
            html_template = jinja_env.get_template(f"{template.value}.html")
            html_content = html_template.render(**data)

            # Load text template (fallback)
            try:
                text_template = jinja_env.get_template(f"{template.value}.txt")
                text_content = text_template.render(**data)
            except Exception as e:
                # Generate text from HTML if no text template
                text_content = self._html_to_text(html_content)

            return html_content, text_content

        except Exception as e:
            logger.error("Template rendering error: %s", e)
            # Fallback to basic template
            return self._get_fallback_template(template, data)

    def _get_fallback_template(self, template: EmailTemplate, data: Dict[str, Any]) -> tuple[str, str]:
        """Fallback templates when Jinja2 templates are not available."""
        templates = {
            EmailTemplate.WELCOME: {
                "html": """
                <h1>Welcome to Impact ID, {username}!</h1>
                <p>Thanks for joining our platform. Get started by completing your first task!</p>
                <a href="{verification_url}">Verify your email</a>
                """,
                "text": "Welcome to Impact ID, {username}!\n\nThanks for joining our platform. Get started by completing your first task!\n\nVerify your email: {verification_url}"
            },
            EmailTemplate.EMAIL_VERIFICATION: {
                "html": """
                <h2>Verify Your Email Address</h2>
                <p>Hi {username},</p>
                <p>Please click the link below to verify your email address:</p>
                <a href="{verification_url}">Verify Email</a>
                """,
                "text": "Hi {username},\n\nPlease click the link below to verify your email address:\n{verification_url}"
            },
            EmailTemplate.TASK_APPROVED: {
                "html": """
                <h2>Task Approved! 🎉</h2>
                <p>Hi {username},</p>
                <p>Your submission for "<strong>{task_title}</strong>" has been approved!</p>
                <p>You earned <strong>{xp_earned} XP</strong>!</p>
                """,
                "text": "Task Approved!\n\nHi {username},\n\nYour submission for \"{task_title}\" has been approved!\nYou earned {xp_earned} XP!"
            }
        }

        template_data = templates.get(template, {
            "html": "<p>Notification from Impact ID</p>",
            "text": "Notification from Impact ID"
        })

        try:
            html = template_data["html"].format(**data)
            text = template_data["text"].format(**data)
            return html, text
        except KeyError as e:
            logger.error("Missing template data: %s", e)
            return template_data["html"], template_data["text"]

    async def _create_message(
        self,
        recipients: List[str],
        subject: str,
        body: str = None,
        html_body: str = None,
        attachments: List[EmailAttachment] = None,
        track_opens: bool = False
    ) -> MIMEMultipart:
        """Create email message with all components."""
        msg = MIMEMultipart('alternative')
        msg["Subject"] = subject
        msg["From"] = f"{self.config.from_name} <{self.config.from_email}>"
        msg["To"] = ", ".join(recipients)
        msg["Date"] = utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")
        msg["Message-ID"] = f"<{utcnow().timestamp()}@{self.config.host}>"

        # Add tracking pixel for open tracking
        if track_opens and html_body:
            tracking_id = f"track_{utcnow().timestamp()}"
            tracking_pixel = f'<img src="https://your-domain.com/email-tracking/{tracking_id}" width="1" height="1" style="display:none;">'
            html_body += tracking_pixel

        # Add text version
        if body:
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)

        # Add HTML version
        if html_body:
            html_part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(html_part)

        # Add attachments
        for attachment in attachments or []:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.content)
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {attachment.filename}'
            )
            msg.attach(part)

        return msg

    async def _send_with_retries(self, msg: MIMEMultipart, max_retries: int) -> bool:
        """Send email with exponential backoff retries."""
        for attempt in range(max_retries):
            try:
                if self.config.use_ssl:
                    # Use SSL connection
                    await aiosmtplib.send(
                        msg,
                        hostname=self.config.host,
                        port=self.config.port,
                        username=self.config.username,
                        password=self.config.password,
                        use_tls=False,
                        start_tls=False,
                        timeout=self.config.timeout
                    )
                else:
                    # Use TLS connection
                    await aiosmtplib.send(
                        msg,
                        hostname=self.config.host,
                        port=self.config.port,
                        username=self.config.username,
                        password=self.config.password,
                        use_tls=self.config.use_tls,
                        start_tls=self.config.use_tls,
                        timeout=self.config.timeout
                    )

                return True

            except Exception as e:
                logger.warning("Email send attempt %s failed: {e}", attempt + 1)
                if attempt < max_retries - 1:
                    # Exponential backoff
                    await asyncio.sleep(2 ** attempt)
                else:
                    logger.error("All email send attempts failed: %s", e)
                    return False

        return False

    def _validate_email(self, email: str) -> bool:
        """Validate email address format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def _html_to_text(self, html: str) -> str:
        """Convert HTML to plain text (basic implementation)."""
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', html)
        # Clean up whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    def _record_failure(self, recipients: List[str], subject: str, body: str):
        """Record failed email for retry later."""
        failure_record = {
            "timestamp": utcnow().isoformat(),
            "recipients": recipients,
            "subject": subject,
            "body": body[:500]  # Truncate for storage
        }
        self.failed_emails.append(failure_record)

        # Keep only last 100 failures
        if len(self.failed_emails) > 100:
            self.failed_emails = self.failed_emails[-100:]

# =========================
# 🚦 Rate Limiting
# =========================

class EmailRateLimiter:
    """Rate limiter to prevent spam and provider limits."""

    def __init__(self):
        """__init__ function."""
        self.send_history = {}
        self.daily_limit = int(os.getenv("EMAIL_DAILY_LIMIT", 1000))
        self.hourly_limit = int(os.getenv("EMAIL_HOURLY_LIMIT", 100))
        self.per_user_daily_limit = int(os.getenv("EMAIL_PER_USER_DAILY_LIMIT", 10))

    async def can_send(self, recipient: str) -> bool:
        """Check if we can send email to recipient."""
        now = utcnow()
        today = now.date()
        current_hour = now.replace(minute=0, second=0, microsecond=0)

        # Check per-user daily limit
        user_today_count = len([
            timestamp for timestamp in self.send_history.get(recipient, [])
            if timestamp.date() == today
        ])

        if user_today_count >= self.per_user_daily_limit:
            return False

        # Check total hourly limit
        total_hour_count = sum(
            len([
                timestamp for timestamp in timestamps
                if timestamp >= current_hour
            ])
            for timestamps in self.send_history.values()
        )

        if total_hour_count >= self.hourly_limit:
            return False

        # Check total daily limit
        total_today_count = sum(
            len([
                timestamp for timestamp in timestamps
                if timestamp.date() == today
            ])
            for timestamps in self.send_history.values()
        )

        if total_today_count >= self.daily_limit:
            return False

        return True

    async def record_send(self, recipient: str):
        """Record successful email send."""
        now = utcnow()

        if recipient not in self.send_history:
            self.send_history[recipient] = []

        self.send_history[recipient].append(now)

        # Clean old entries (keep only last 7 days)
        cutoff = now - timedelta(days=7)
        self.send_history[recipient] = [
            timestamp for timestamp in self.send_history[recipient]
            if timestamp > cutoff
        ]

# =========================
# 🌟 Global Email Service Instance
# =========================

email_service = EmailService()

# =========================
# 🎯 Public API Functions
# =========================

async def send_email(
    to: Union[str, List[str]],
    subject: str,
    body: str = None,
    html_body: str = None,
    template: EmailTemplate = None,
    template_data: Dict[str, Any] = None,
    attachments: List[EmailAttachment] = None,
    priority: str = "normal"
) -> bool:
    """
    🚀 Main email sending function with full feature support.

    Args:
        to: Recipient email(s)
        subject: Email subject
        body: Plain text body
        html_body: HTML body
        template: Template to use
        template_data: Data for template rendering
        attachments: File attachments
        priority: Email priority

    Returns:
        bool: True if sent successfully
    """
    return await email_service.send_email(
        to=to,
        subject=subject,
        body=body,
        html_body=html_body,
        template=template,
        template_data=template_data,
        attachments=attachments,
        priority=priority
    )

async def send_template_email(
    to: Union[str, List[str]],
    template: EmailTemplate,
    subject: str = None,
    **template_data
) -> bool:
    """
    🎨 Send email using template with automatic subject generation.
    """
    # Auto-generate subject if not provided
    if not subject:
        subject_map = {
            EmailTemplate.WELCOME: "Welcome to Impact ID! 🎉",
            EmailTemplate.EMAIL_VERIFICATION: "Verify Your Email Address",
            EmailTemplate.PASSWORD_RESET: "Reset Your Password",
            EmailTemplate.TASK_APPROVED: "Task Approved! 🎯",
            EmailTemplate.TASK_REJECTED: "Task Needs Revision",
            EmailTemplate.BADGE_EARNED: "New Badge Earned! 🏅",
            EmailTemplate.WEEKLY_SUMMARY: "Your Weekly Impact Summary",
            EmailTemplate.ADMIN_NOTIFICATION: "Admin Notification"
        }
        subject = subject_map.get(template, "Notification from Impact ID")

    return await email_service.send_email(
        to=to,
        subject=subject,
        template=template,
        template_data=template_data
    )

# =========================
# 🔧 Utility Functions
# =========================

async def send_bulk_emails(
    recipients: List[str],
    subject: str,
    template: EmailTemplate,
    template_data_list: List[Dict[str, Any]],
    batch_size: int = 10,
    delay_between_batches: float = 1.0
) -> Dict[str, int]:
    """
    📬 Send bulk emails with batching and rate limiting.
    """
    if len(recipients) != len(template_data_list):
        raise ValueError("Recipients and template data lists must have same length")

    results = {"sent": 0, "failed": 0}

    for i in range(0, len(recipients), batch_size):
        batch_recipients = recipients[i:i + batch_size]
        batch_data = template_data_list[i:i + batch_size]

        # Send batch
        tasks = []
        for recipient, data in zip(batch_recipients, batch_data):
            task = send_template_email(
                to=recipient,
                template=template,
                subject=subject,
                **data
            )
            tasks.append(task)

        # Wait for batch completion
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in batch_results:
            if isinstance(result, Exception) or not result:
                results["failed"] += 1
            else:
                results["sent"] += 1

        # Delay between batches
        if i + batch_size < len(recipients):
            await asyncio.sleep(delay_between_batches)

    logger.info("Bulk email completed: %s sent, {results['failed']} failed", results['sent'])
    return results

def get_email_stats() -> Dict[str, Any]:
    """Get email service statistics."""
    return {
        "is_configured": email_service.is_configured(),
        "failed_emails_count": len(email_service.failed_emails),
        "rate_limiter_history_size": len(email_service.rate_limiter.send_history),
        "config": {
            "host": email_service.config.host if email_service.config else None,
            "port": email_service.config.port if email_service.config else None,
            "from_email": email_service.config.from_email if email_service.config else None
        } if email_service.config else None
    }

# =========================
# 🧪 Development Mode
# =========================

async def send_test_email(to: str) -> bool:
    """Send test email to verify configuration."""
    return await send_template_email(
        to=to,
        template=EmailTemplate.WELCOME,
        username="Test User",
        verification_url="https://example.com/verify"
    )
