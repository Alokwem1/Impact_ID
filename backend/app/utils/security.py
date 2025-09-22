"""
Security module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import hashlib
import logging
import os
import secrets

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.utils.common import utcnow


logger = logging.getLogger(__name__)

# ================================
# 🔐 PASSWORD SECURITY
# ================================

# Advanced bcrypt configuration for production security
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Higher rounds for better security
    bcrypt__ident="2b"  # Use the latest bcrypt variant
)

def get_password_hash(password: str) -> str:
    """
    🔒 Hash password using production-grade bcrypt settings.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    ✅ Verify password against hash with timing attack protection.
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error("Password verification error: %s", e)
        return False

def check_password_strength(password: str) -> tuple[bool, List[str]]:
    """
    🛡️ Check password strength and return issues.
    """
    issues = []

    if len(password) < 8:
        issues.append("Password must be at least 8 characters long")

    if len(password) > 128:
        issues.append("Password must be less than 128 characters")

    if not any(c.isupper() for c in password):
        issues.append("Password must contain at least one uppercase letter")

    if not any(c.islower() for c in password):
        issues.append("Password must contain at least one lowercase letter")

    if not any(c.isdigit() for c in password):
        issues.append("Password must contain at least one number")

    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        issues.append("Password must contain at least one special character")

    # Check for common patterns
    common_patterns = ["123456", "password", "qwerty", "admin", "letmein"]
    if any(pattern in password.lower() for pattern in common_patterns):
        issues.append("Password contains common patterns")

    return len(issues) == 0, issues

# ================================
# 🎫 JWT TOKEN MANAGEMENT
# ================================

"""Unified token system wrapper.

This module historically contained standalone JWT helpers. We now delegate token
creation/verification to the advanced manager in `app.utils.token` while retaining
the original function names for backward compatibility with existing router imports.
"""

from app.utils import token as unified_token
from app.utils.token import TokenType

# Legacy constants kept for backward compatibility (may be removed later)
SECRET_KEY = os.getenv("SECRET_KEY", "development-placeholder-secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create access token (backward compatible wrapper).

    Accepts the historical `data` dict with keys like user_id, username, email, role.
    Delegates to the unified token manager. Additional fields are ignored gracefully.
    """
    # Support legacy keys plus OAuth2 style 'sub'
    raw_user_id = data.get("user_id") or data.get("id") or data.get("sub")
    try:
        user_id = int(raw_user_id) if raw_user_id is not None else 0
    except (TypeError, ValueError):  # ensure safe fallback
        user_id = 0
    return unified_token.create_access_token(
        user_id=user_id,
        username=data.get("username", ""),
        email=data.get("email", ""),
        role=data.get("role", "user"),
        expires_delta=expires_delta,
    )

def create_refresh_token(data: dict) -> str:
    """Create refresh token via unified manager."""
    raw_user_id = data.get("user_id") or data.get("id") or data.get("sub")
    try:
        user_id = int(raw_user_id) if raw_user_id is not None else 0
    except (TypeError, ValueError):
        user_id = 0
    return unified_token.create_refresh_token(
        user_id=user_id,
        username=data.get("username", ""),
        email=data.get("email", ""),
        role=data.get("role", "user"),
    )

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """Verify token via unified manager; returns a plain dict payload.

    token_type argument kept for backward compatibility (access|refresh).
    """
    expected = TokenType.ACCESS if token_type == "access" else (TokenType.REFRESH if token_type == "refresh" else None)
    payload_obj = unified_token.verify_token(token, expected_type=expected)
    # Convert dataclass/object to primitive dict
    if hasattr(payload_obj, "to_dict"):
        data = payload_obj.to_dict()
    else:  # Already a dict-like
        data = dict(payload_obj)
    # Add legacy keys
    data["type"] = payload_obj.token_type.value if hasattr(payload_obj, "token_type") else token_type
    return data

# ================================
# 🔐 SECURITY UTILITIES
# ================================

def generate_secure_token(length: int = 32) -> str:
    """
    🎲 Generate cryptographically secure random token.
    """
    return secrets.token_urlsafe(length)

def generate_api_key() -> str:
    """
    🔑 Generate API key with prefix.
    """
    return f"impactid_{generate_secure_token(32)}"

def hash_sensitive_data(data: str) -> str:
    """
    🔒 Hash sensitive data for storage.
    """
    return hashlib.sha256(data.encode()).hexdigest()

def verify_sensitive_data(data: str, hashed: str) -> bool:
    """
    ✅ Verify sensitive data against hash.
    """
    return hash_sensitive_data(data) == hashed

# ================================
# 🛡️ RATE LIMITING HELPERS
# ================================

def get_client_ip(request) -> str:
    """
    🌐 Extract client IP address from request.
    """
    forwarded = request.headers.get("x-forwarded-for", None)
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip", None)
    if real_ip:
        return real_ip

    return request.client.host if request.client else "unknown"

def create_rate_limit_key(identifier: str, endpoint: str) -> str:
    """
    🔑 Create rate limit key for Redis storage.
    """
    return f"rate_limit:{identifier}:{endpoint}"

# ================================
# 🔐 EMAIL VERIFICATION
# ================================

def create_email_verification_token(user_id: int, email: str) -> str:
    """Delegate to unified token manager for email verification."""
    return unified_token.create_email_verification_token(user_id=user_id, email=email)

def verify_email_token(token: str) -> Dict[str, Any]:
    """Verify email verification token using unified manager."""
    payload_obj = unified_token.verify_token(token, expected_type=TokenType.EMAIL_VERIFICATION)
    return payload_obj.to_dict() if hasattr(payload_obj, "to_dict") else payload_obj

# ================================
# 🔑 PASSWORD RESET
# ================================

def create_password_reset_token(user_id: int, email: str) -> str:
    """Delegate password reset token creation to unified manager."""
    return unified_token.create_password_reset_token(user_id=user_id, email=email)

def verify_password_reset_token(token: str) -> Dict[str, Any]:
    """Verify password reset token using unified manager."""
    payload_obj = unified_token.verify_token(token, expected_type=TokenType.PASSWORD_RESET)
    return payload_obj.to_dict() if hasattr(payload_obj, "to_dict") else payload_obj

# ================================
# 🔐 WALLET SIGNATURE VERIFICATION
# ================================

def verify_ethereum_signature(message: str, signature: str, address: str) -> bool:
    """
    ⚡ Verify Ethereum wallet signature (placeholder for Web3 integration).
    """
    # TODO: Implement actual Ethereum signature verification
    # This would require web3.py or eth_account libraries
    logger.info("Verifying signature for address: %s", address)
    return True  # Placeholder - implement actual verification

# ================================
# 🛡️ SECURITY HEADERS
# ================================

def get_security_headers() -> Dict[str, str]:
    """
    🛡️ Get security headers for responses.
    """
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }

# ================================
# 🔍 INPUT SANITIZATION
# ================================

def sanitize_input(data: str, max_length: int = 1000) -> str:
    """
    🧹 Sanitize user input to prevent injection attacks.
    """
    if not isinstance(data, str):
        return str(data)

    # Remove null bytes
    data = data.replace('\x00', '')

    # Limit length
    if len(data) > max_length:
        data = data[:max_length]

    # Strip whitespace
    data = data.strip()

    return data

def validate_file_upload(filename: str, content_type: str, max_size: int = 10485760) -> bool:
    """
    📁 Validate file upload for security.
    """
    # Check file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.csv'}
    file_ext = os.path.splitext(filename.lower())[1]

    if file_ext not in allowed_extensions:
        return False

    # Check content type
    allowed_types = {
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'text/plain', 'text/csv'
    }

    if content_type not in allowed_types:
        return False

    return True

# ================================
# 🎯 SECURITY CONTEXT
# ================================

class SecurityContext:
    """Security context for request processing."""

    def __init__(self, request=None):
        """__init__ function."""
        self.ip_address = get_client_ip(request) if request else None
        self.user_agent = request.headers.get("user-agent", None) if request else None
        self.timestamp = utcnow()
        self.request_id = generate_secure_token(16)

    def to_dict(self) -> Dict[str, Any]:
        """to_dict function."""
        return {
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "timestamp": self.timestamp.isoformat(),
            "request_id": self.request_id
        }

# ================================
# 🔐 ENVIRONMENT VALIDATION
# ================================

def validate_security_config():
    """
    ⚠️ Validate security configuration on startup.
    """
    issues = []

    if SECRET_KEY == "your-secret-key-change-in-production":
        issues.append("SECRET_KEY is using default value - change in production!")

    if len(SECRET_KEY) < 32:
        issues.append("SECRET_KEY should be at least 32 characters long")

    if ACCESS_TOKEN_EXPIRE_MINUTES > 1440:  # 24 hours
        issues.append("ACCESS_TOKEN_EXPIRE_MINUTES is very long - consider shorter duration")

    if issues:
        for issue in issues:
            logger.warning("Security config issue: %s", issue)
    else:
        logger.info("✅ Security configuration validated")

    return len(issues) == 0

# Initialize security validation
validate_security_config()
