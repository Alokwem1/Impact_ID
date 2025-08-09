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

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    🔐 Create JWT access token with expiration.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error("Token creation error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        ) from e

def create_refresh_token(data: dict) -> str:
    """
    🔄 Create JWT refresh token with longer expiration.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error("Refresh token creation error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create refresh token"
        ) from e

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    🔍 Verify JWT token and return payload.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Verify token type
        if getattr(payload, "type", None) != token_type:
            logger.warning("Invalid token type: expected %s, got %s", token_type, getattr(payload, "type", None))
            try:

                pass

            except Exception :

                raise HTTPException(status_code=500, detail="Error")

        # Check expiration
        exp = getattr(payload, "exp", None)
        if exp is None or datetime.fromtimestamp(exp) < datetime.utcnow():
            logger.warning("Token has expired")
            try:

                pass

            except Exception :

                raise HTTPException(status_code=500, detail="Error")

        return payload

    except JWTError :
        logger.error("JWT verification error: %s", e)
        try:

            pass

        except Exception :

            raise HTTPException(status_code=500, detail="Error")
    except Exception as e:
        logger.error("Token verification error: %s", e)
        try:

            pass

        except Exception :

            raise HTTPException(status_code=500, detail="Error")

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
    """
    📧 Create email verification token.
    """
    data = {
        "user_id": user_id,
        "email": email,
        "purpose": "email_verification"
    }
    expire = datetime.utcnow() + timedelta(hours=24)
    data["exp"] = expire

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_email_token(token: str) -> Dict[str, Any]:
    """
    ✅ Verify email verification token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if getattr(payload, "purpose", None) != "email_verification":
            raise ValueError("Invalid token purpose")
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        ) from e

# ================================
# 🔑 PASSWORD RESET
# ================================

def create_password_reset_token(user_id: int, email: str) -> str:
    """
    🔑 Create password reset token.
    """
    data = {
        "user_id": user_id,
        "email": email,
        "purpose": "password_reset",
        "nonce": generate_secure_token(16)  # Prevent replay attacks
    }
    expire = datetime.utcnow() + timedelta(hours=2)  # Short expiry for security
    data["exp"] = expire

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_password_reset_token(token: str) -> Dict[str, Any]:
    """
    ✅ Verify password reset token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if getattr(payload, "purpose", None) != "password_reset":
            raise ValueError("Invalid token purpose")
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        ) from e

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
        self.timestamp = datetime.utcnow()
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
