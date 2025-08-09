"""
Config module for Impact ID application.
"""


from typing import List, Optional
import os

from functools import lru_cache


class Settings:
    """Application settings with environment-based configuration."""

    def __init__(self):
        """__init__ function."""
        # Application
        self.app_name: str = "Impact ID API"
        self.version: str = "2.0.0"
        self.environment: str = os.getenv("ENVIRONMENT", "development")
        self.debug: bool = os.getenv("DEBUG", "true").lower() == "true"
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")

        # Security
        self.secret_key: str = os.getenv("SECRET_KEY", "development-key-change-in-production")
        self.session_timeout: int = int(os.getenv("SESSION_TIMEOUT", "86400"))
        self.access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        self.refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

        # Database
        self.database_url: Optional[str] = os.getenv("DATABASE_URL")

        # CORS
        origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
        self.allowed_origins: List[str] = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

        hosts_str = os.getenv("ALLOWED_HOSTS", "*")
        self.allowed_hosts: List[str] = [host.strip() for host in hosts_str.split(",") if host.strip()]

        # URLs
        self.base_url: str = os.getenv("BASE_URL", "http://localhost:8000")
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

        # Features
        self.enable_monitoring: bool = os.getenv("ENABLE_MONITORING", "true").lower() == "true"
        self.enable_email: bool = os.getenv("ENABLE_EMAIL", "false").lower() == "true"
        self.enable_background_tasks: bool = os.getenv("ENABLE_BACKGROUND_TASKS", "true").lower() == "true"

        # Email Configuration
        self.email_smtp_host: Optional[str] = os.getenv("EMAIL_SMTP_HOST")
        self.email_smtp_port: int = int(os.getenv("EMAIL_SMTP_PORT", "587"))
        self.email_smtp_user: Optional[str] = os.getenv("EMAIL_SMTP_USER")
        self.email_smtp_password: Optional[str] = os.getenv("EMAIL_SMTP_PASSWORD")
        self.email_from: Optional[str] = os.getenv("EMAIL_FROM")
        self.email_from_name: str = os.getenv("EMAIL_FROM_NAME", "Impact ID")

        # Validate critical settings
        self._validate()

    def _validate(self):
        """Validate critical configuration settings."""
        if self.environment == "production":
            if not self.secret_key or len(self.secret_key) < 32:
                raise ValueError("SECRET_KEY must be at least 32 characters long in production")

            if self.debug:
                raise ValueError("DEBUG must be False in production")

        if not self.database_url:
            if self.environment == "testing":
                self.database_url = "sqlite+aiosqlite:///:memory:"
            else:
                self.database_url = "sqlite+aiosqlite:///./impact.db"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
