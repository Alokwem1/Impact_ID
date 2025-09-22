"""
Token module for Impact ID application.
"""


from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Dict, Any, List, Set
import base64
import hashlib
import json
import logging
import os
import redis
import secrets

from cryptography.fernet import Fernet
from dotenv import load_dotenv
from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.utils.common import utcnow


load_dotenv()
logger = logging.getLogger(__name__)

# =========================
# 🔐 Security Configuration
# =========================

class TokenType(str, Enum):
    """Types of tokens for different purposes."""
    ACCESS = "access"
    REFRESH = "refresh"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    API_KEY = "api_key"
    ADMIN_SESSION = "admin_session"
    TEMPORARY_ACCESS = "temporary_access"

class TokenScope(str, Enum):
    """Token scopes for permission control."""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"
    READ_ONLY = "read_only"
    API_ACCESS = "api_access"
    ELEVATED = "elevated"

@dataclass
class TokenConfig:
    """Token configuration with security settings."""
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    email_verification_expire_hours: int = 24
    password_reset_expire_hours: int = 2
    api_key_expire_days: int = 365
    admin_session_expire_minutes: int = 60
    temp_access_expire_minutes: int = 15

    # Security settings
    enable_token_rotation: bool = True
    enable_blacklisting: bool = True
    max_concurrent_sessions: int = 5
    require_secure_tokens: bool = True

    def __post_init__(self):
        """Validate secret key security; be strict in production, warn in development/test."""
        env = os.getenv("ENVIRONMENT", "development").lower()
        if (not self.secret_key or self.secret_key == "a-very-bad-default-secret-key" or len(self.secret_key) < 32):
            if env in ("production", "staging"):
                raise RuntimeError("SECURITY ERROR: SECRET_KEY is missing or too short (>=32 chars required) in production/staging.")
            # Development fallback – generate ephemeral secret to avoid hard crashes
            generated = base64.urlsafe_b64encode(os.urandom(48)).decode()
            logger.warning("⚠️ Insecure or missing SECRET_KEY detected in %s environment. Generated ephemeral key; set a strong SECRET_KEY env var for production.", env)
            self.secret_key = generated

@dataclass
class TokenPayload:
    """Structured token payload with security metadata."""
    user_id: int
    username: str
    email: str
    role: str
    scopes: List[str]
    token_type: TokenType
    session_id: str
    issued_at: datetime
    expires_at: datetime

    # Security metadata
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_fingerprint: Optional[str] = None
    is_elevated: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JWT encoding."""
        data = asdict(self)
        # Convert datetime objects to timestamps
        data["issued_at"] = self.issued_at.timestamp()
        data["expires_at"] = self.expires_at.timestamp()
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TokenPayload":
        """Create from dictionary (JWT decoding)."""
        # Convert timestamps back to datetime
        data["issued_at"] = datetime.fromtimestamp(data["issued_at"])
        data["expires_at"] = datetime.fromtimestamp(data["expires_at"])
        return cls(**data)

# =========================
# 🛡️ Token Security Manager
# =========================

class TokenSecurityManager:
    """Advanced token security with blacklisting and session management."""

    def __init__(self):
        """__init__ function."""
        self.config = self._load_config()
        self.redis_client = self._init_redis()
        self.encryption_key = self._get_encryption_key()

        # Security tracking
        self.failed_verifications = {}
        self.suspicious_activity = []

    def _load_config(self) -> TokenConfig:
        """Load and validate token configuration."""
        return TokenConfig(
            secret_key=os.getenv("SECRET_KEY", "a-very-bad-default-secret-key"),
            algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
            access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)),
            refresh_token_expire_days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 30)),
            email_verification_expire_hours=int(os.getenv("EMAIL_VERIFICATION_EXPIRE_HOURS", 24)),
            password_reset_expire_hours=int(os.getenv("PASSWORD_RESET_EXPIRE_HOURS", 2)),
            enable_token_rotation=os.getenv("ENABLE_TOKEN_ROTATION", "true").lower() == "true",
            enable_blacklisting=os.getenv("ENABLE_TOKEN_BLACKLISTING", "true").lower() == "true",
            max_concurrent_sessions=int(os.getenv("MAX_CONCURRENT_SESSIONS", 5)),
            require_secure_tokens=os.getenv("REQUIRE_SECURE_TOKENS", "true").lower() == "true"
        )

    def _init_redis(self) -> Optional[redis.Redis]:
        """Initialize Redis for token blacklisting and session management."""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            client = redis.from_url(redis_url, decode_responses=True)
            client.ping()  # Test connection
            return client
        except Exception as e:
            logger.warning("Redis not available for token management: %s", e)
            return None

    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key for sensitive token data."""
        key_env = os.getenv("TOKEN_ENCRYPTION_KEY")
        if key_env:
            return base64.urlsafe_b64decode(key_env)
        else:
            # Generate and log warning
            key = Fernet.generate_key()
            logger.warning("Generated new encryption key: %s", base64.urlsafe_b64encode(key).decode())
            logger.warning("Set TOKEN_ENCRYPTION_KEY environment variable for production!")
            return key

    def create_token(
        self,
        user_id: int,
        username: str,
        email: str,
        role: str,
        token_type: TokenType,
        scopes: List[str] = None,
        custom_expiry: Optional[timedelta] = None,
        security_context: Dict[str, Any] = None
    ) -> str:
        """
        🔐 Create secure JWT token with comprehensive metadata.
        """
        # Generate session ID
        session_id = self._generate_session_id(user_id, security_context)

        # Determine expiration
        if custom_expiry:
            expires_at = utcnow() + custom_expiry
        else:
            expires_at = self._get_default_expiry(token_type)

        # Create payload
        payload = TokenPayload(
            user_id=user_id,
            username=username,
            email=email,
            role=role,
            scopes=scopes or [TokenScope.USER.value],
            token_type=token_type,
            session_id=session_id,
            issued_at=utcnow(),
            expires_at=expires_at,
            ip_address=getattr(security_context, "ip_address", None) if security_context else None,
            user_agent=getattr(security_context, "user_agent", None) if security_context else None,
            device_fingerprint=getattr(security_context, "device_fingerprint", None) if security_context else None
        )

        # Encode token
        token_data = payload.to_dict()
        token = jwt.encode(token_data, self.config.secret_key, algorithm=self.config.algorithm)

        # Store session information
        if self.redis_client and token_type in [TokenType.ACCESS, TokenType.ADMIN_SESSION]:
            self._store_session(session_id, payload, token)
            self._manage_concurrent_sessions(user_id, session_id)

        # Log token creation
        logger.info(
            "Token created: user_id=%s type=%s session_id=%s", user_id, token_type.value, session_id
        )

        return token

    def verify_token(
        self,
        token: str,
        expected_type: TokenType = None,
        required_scopes: List[str] = None,
        security_context: Dict[str, Any] = None
    ) -> TokenPayload:
        """
        🔍 Verify token with comprehensive security checks.
        """
        try:
            # Decode token
            payload_dict = jwt.decode(
                token,
                self.config.secret_key,
                algorithms=[self.config.algorithm]
            )
            payload = TokenPayload.from_dict(payload_dict)

            # Basic validation
            if utcnow() > payload.expires_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )

            # Type validation
            if expected_type and payload.token_type != expected_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type. Expected {expected_type.value}"
                )

            # Scope validation
            if required_scopes:
                if not all(scope in payload.scopes for scope in required_scopes):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient token permissions"
                    )

            # Blacklist check
            if self._is_token_blacklisted(token):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )

            # Session validation
            if self.redis_client and payload.token_type in [TokenType.ACCESS, TokenType.ADMIN_SESSION]:
                if not self._validate_session(payload.session_id, token):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid session"
                    )

            # Security context validation
            if security_context and self.config.require_secure_tokens:
                self._validate_security_context(payload, security_context)

            # Update last seen
            if self.redis_client:
                self._update_session_activity(payload.session_id)

            return payload

        except JWTError as e:
            self._record_failed_verification(security_context)
            logger.error("Token verification failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    def refresh_token(self, refresh_token: str, security_context: Dict[str, Any] = None) -> Dict[str, str]:
        """
        🔄 Refresh access token using refresh token.
        """
        # Verify refresh token
        payload = self.verify_token(
            refresh_token,
            expected_type=TokenType.REFRESH,
            security_context=security_context
        )

        # Create new access token
        new_access_token = self.create_token(
            user_id=payload.user_id,
            username=payload.username,
            email=payload.email,
            role=payload.role,
            token_type=TokenType.ACCESS,
            scopes=payload.scopes,
            security_context=security_context
        )

        new_refresh_token = None
        if self.config.enable_token_rotation:
            # Create new refresh token and blacklist old one
            new_refresh_token = self.create_token(
                user_id=payload.user_id,
                username=payload.username,
                email=payload.email,
                role=payload.role,
                token_type=TokenType.REFRESH,
                scopes=payload.scopes,
                security_context=security_context
            )
            self.blacklist_token(refresh_token)

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token or refresh_token,
            "token_type": "bearer"
        }

    def blacklist_token(self, token: str, reason: str = "manual_revocation") -> bool:
        """
        🚫 Blacklist a token to prevent further use.
        """
        if not self.config.enable_blacklisting or not self.redis_client:
            logger.warning("Token blacklisting is disabled or Redis unavailable")
            return False

        try:
            # Get token expiry to set appropriate TTL
            payload_dict = jwt.decode(
                token,
                self.config.secret_key,
                algorithms=[self.config.algorithm],
                options={"verify_exp": False}  # Allow expired tokens for blacklisting
            )
            expires_at = datetime.fromtimestamp(payload_dict["expires_at"])
            ttl = int((expires_at - utcnow()).total_seconds())

            if ttl > 0:
                # Store in blacklist with TTL
                token_hash = hashlib.sha256(token.encode()).hexdigest()
                blacklist_data = {
                    "reason": reason,
                    "blacklisted_at": utcnow().isoformat(),
                    "user_id": getattr(payload_dict, "user_id", None),
                    "session_id": getattr(payload_dict, "session_id", None)
                }

                self.redis_client.setex(
                    f"blacklist:{token_hash}",
                    ttl,
                    json.dumps(blacklist_data)
                )

                # Invalidate session if it exists
                session_id = getattr(payload_dict, "session_id", None)
                if session_id:
                    self._invalidate_session(session_id)

                logger.info("Token blacklisted: reason=%s session_id=%s", reason, session_id)
                return True

        except Exception as e:
            logger.error("Failed to blacklist token: %s", e)
            return False

        return False

    def revoke_user_sessions(self, user_id: int, except_session_id: str = None) -> int:
        """
        🔥 Revoke all sessions for a user (except optionally one).
        """
        if not self.redis_client:
            return 0

        revoked_count = 0
        pattern = f"session:{user_id}:*"

        for key in self.redis_client.scan_iter(match=pattern):
            session_id = key.split(":")[-1]
            if except_session_id and session_id == except_session_id:
                continue

            # Get session data and blacklist associated token
            session_data = self.redis_client.get(key)
            if session_data:
                session_info = json.loads(session_data)
                token = session_info.get("token") if isinstance(session_info, dict) else getattr(session_info, "token", None)
                if token:
                    self.blacklist_token(token, "session_revocation")
            # Delete session (always delete even if no session_data to avoid stale keys)
            self.redis_client.delete(key)
            revoked_count += 1

        logger.info("Revoked %s sessions for user %s", revoked_count, user_id)
        return revoked_count

    def get_user_sessions(self, user_id: int) -> List[Dict[str, Any]]:
        """
        📊 Get active sessions for a user.
        """
        if not self.redis_client:
            return []

        sessions = []
        pattern = f"session:{user_id}:*"

        for key in self.redis_client.scan_iter(match=pattern):
            session_data = self.redis_client.get(key)
            if session_data:
                session_info = json.loads(session_data)
                sessions.append({
                    "session_id": key.split(":")[-1],
                    "created_at": getattr(session_info, "created_at", None),
                    "last_seen": getattr(session_info, "last_seen", None),
                    "ip_address": getattr(session_info, "ip_address", None),
                    "user_agent": getattr(session_info, "user_agent", None),
                    "device_fingerprint": getattr(session_info, "device_fingerprint", None)
                })

        return sorted(sessions, key=lambda x: x["last_seen"], reverse=True)

    # =========================
    # 🔧 Internal Helper Methods
    # =========================

    def _get_default_expiry(self, token_type: TokenType) -> datetime:
        """Get default expiry time for token type."""
        now = utcnow()

        expiry_map = {
            TokenType.ACCESS: timedelta(minutes=self.config.access_token_expire_minutes),
            TokenType.REFRESH: timedelta(days=self.config.refresh_token_expire_days),
            TokenType.EMAIL_VERIFICATION: timedelta(hours=self.config.email_verification_expire_hours),
            TokenType.PASSWORD_RESET: timedelta(hours=self.config.password_reset_expire_hours),
            TokenType.API_KEY: timedelta(days=self.config.api_key_expire_days),
            TokenType.ADMIN_SESSION: timedelta(minutes=self.config.admin_session_expire_minutes),
            TokenType.TEMPORARY_ACCESS: timedelta(minutes=self.config.temp_access_expire_minutes)
        }

        return now + expiry_map.get(token_type, timedelta(hours=1))

    def _generate_session_id(self, user_id: int, security_context: Dict[str, Any] = None) -> str:
        """Generate unique session ID."""
        timestamp = str(utcnow().timestamp())
        random_part = secrets.token_hex(16)
        context_part = ""

        if security_context:
            context_data = f"{security_context.get('ip_address', '')}{security_context.get('user_agent', '')}"
            context_part = hashlib.md5(context_data.encode()).hexdigest()[:8]

        session_data = f"{user_id}:{timestamp}:{random_part}:{context_part}"
        return hashlib.sha256(session_data.encode()).hexdigest()

    def _store_session(self, session_id: str, payload: TokenPayload, token: str):
        """Store session information in Redis."""
        if not self.redis_client:
            return

        session_data = {
            "user_id": payload.user_id,
            "token": token,
            "created_at": payload.issued_at.isoformat(),
            "last_seen": utcnow().isoformat(),
            "ip_address": payload.ip_address,
            "user_agent": payload.user_agent,
            "device_fingerprint": payload.device_fingerprint,
            "token_type": payload.token_type.value
        }

        # Store with expiration
        ttl = int((payload.expires_at - utcnow()).total_seconds())
        if ttl > 0:
            self.redis_client.setex(
                f"session:{payload.user_id}:{session_id}",
                ttl,
                json.dumps(session_data)
            )

    def _manage_concurrent_sessions(self, user_id: int, new_session_id: str):
        """Manage concurrent session limits."""
        if not self.redis_client:
            return

        # Get all user sessions
        sessions = self.get_user_sessions(user_id)

        if len(sessions) >= self.config.max_concurrent_sessions:
            # Remove oldest sessions
            sessions_to_remove = len(sessions) - self.config.max_concurrent_sessions + 1
            oldest_sessions = sorted(sessions, key=lambda x: x["last_seen"])[:sessions_to_remove]

            for session in oldest_sessions:
                if session["session_id"] != new_session_id:
                    self._invalidate_session(session["session_id"])

    def _validate_session(self, session_id: str, token: str) -> bool:
        """Validate session exists and matches token."""
        if not self.redis_client:
            return True  # Skip validation if Redis unavailable

        # Find session key
        for key in self.redis_client.scan_iter(match=f"session:*:{session_id}"):
            session_data = self.redis_client.get(key)
            if session_data:
                session_info = json.loads(session_data)
                return getattr(session_info, "token", None) == token

        return False

    def _invalidate_session(self, session_id: str):
        """Invalidate a specific session."""
        if not self.redis_client:
            return

        for key in self.redis_client.scan_iter(match=f"session:*:{session_id}"):
            self.redis_client.delete(key)

    def _update_session_activity(self, session_id: str):
        """Update last seen timestamp for session."""
        if not self.redis_client:
            return

        for key in self.redis_client.scan_iter(match=f"session:*:{session_id}"):
            session_data = self.redis_client.get(key)
            if session_data:
                session_info = json.loads(session_data)
                session_info["last_seen"] = utcnow().isoformat()

                # Update with same TTL
                ttl = self.redis_client.ttl(key)
                if ttl > 0:
                    self.redis_client.setex(key, ttl, json.dumps(session_info))

    def _is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted."""
        if not self.config.enable_blacklisting or not self.redis_client:
            return False

        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return self.redis_client.exists(f"blacklist:{token_hash}")

    def _validate_security_context(self, payload: TokenPayload, context: Dict[str, Any]):
        """Validate security context matches token."""
        if payload.ip_address and getattr(context, "ip_address", None):
            if payload.ip_address != context["ip_address"]:
                logger.warning("IP address mismatch for session %s", payload.session_id)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Security context validation failed"
                )

    def _record_failed_verification(self, security_context: Dict[str, Any] = None):
        """Record failed token verification for security monitoring."""
        ip_address = security_context.get("ip_address", "unknown") if security_context else "unknown"

        if ip_address not in self.failed_verifications:
            self.failed_verifications[ip_address] = []

        self.failed_verifications[ip_address].append(utcnow())

        # Keep only last hour of failures
        cutoff = utcnow() - timedelta(hours=1)
        self.failed_verifications[ip_address] = [
            timestamp for timestamp in self.failed_verifications[ip_address]
            if timestamp > cutoff
        ]

        # Alert on suspicious activity (more than 10 failures in an hour)
        if len(self.failed_verifications[ip_address]) > 10:
            logger.warning("Suspicious token verification activity from IP: %s", ip_address)

# =========================
# 🌟 Global Token Manager Instance
# =========================

token_manager = TokenSecurityManager()

# =========================
# 🎯 Public API Functions
# =========================

def create_access_token(
    user_id: int,
    username: str,
    email: str,
    role: str,
    scopes: List[str] = None,
    expires_delta: Optional[timedelta] = None,
    security_context: Dict[str, Any] = None
) -> str:
    """🔐 Create access token with security context."""
    return token_manager.create_token(
        user_id=user_id,
        username=username,
        email=email,
        role=role,
        token_type=TokenType.ACCESS,
        scopes=scopes,
        custom_expiry=expires_delta,
        security_context=security_context
    )

def create_refresh_token(
    user_id: int,
    username: str,
    email: str,
    role: str,
    scopes: List[str] = None,
    security_context: Dict[str, Any] = None
) -> str:
    """🔄 Create refresh token."""
    return token_manager.create_token(
        user_id=user_id,
        username=username,
        email=email,
        role=role,
        token_type=TokenType.REFRESH,
        scopes=scopes,
        security_context=security_context
    )

def verify_token(
    token: str,
    credentials_exception: HTTPException = None,
    expected_type: TokenType = None,
    required_scopes: List[str] = None,
    security_context: Dict[str, Any] = None
) -> TokenPayload:
    """🔍 Verify token with comprehensive security checks."""
    if not credentials_exception:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return token_manager.verify_token(
            token=token,
            expected_type=expected_type,
            required_scopes=required_scopes,
            security_context=security_context
        )
    except HTTPException as e:
        # Propagate original HTTPException without invalid chaining pattern
        raise

def refresh_tokens(refresh_token: str, security_context: Dict[str, Any] = None) -> Dict[str, str]:
    """🔄 Refresh access and refresh tokens."""
    return token_manager.refresh_token(refresh_token, security_context)

def revoke_token(token: str, reason: str = "manual_revocation") -> bool:
    """🚫 Revoke a specific token."""
    return token_manager.blacklist_token(token, reason)

def revoke_user_sessions(user_id: int, except_session_id: str = None) -> int:
    """🔥 Revoke all user sessions."""
    return token_manager.revoke_user_sessions(user_id, except_session_id)

def get_user_sessions(user_id: int) -> List[Dict[str, Any]]:
    """📊 Get active sessions for user."""
    return token_manager.get_user_sessions(user_id)

# =========================
# 🧪 Utility Functions
# =========================

def create_email_verification_token(user_id: int, email: str) -> str:
    """📧 Create email verification token."""
    return token_manager.create_token(
        user_id=user_id,
        username="",
        email=email,
        role="user",
        token_type=TokenType.EMAIL_VERIFICATION,
        scopes=["email_verification"]
    )

def create_password_reset_token(user_id: int, email: str) -> str:
    """🔑 Create password reset token."""
    return token_manager.create_token(
        user_id=user_id,
        username="",
        email=email,
        role="user",
        token_type=TokenType.PASSWORD_RESET,
        scopes=["password_reset"]
    )

def get_token_stats() -> Dict[str, Any]:
    """📈 Get token system statistics."""
    stats = {
        "config": {
            "blacklisting_enabled": token_manager.config.enable_blacklisting,
            "rotation_enabled": token_manager.config.enable_token_rotation,
            "max_concurrent_sessions": token_manager.config.max_concurrent_sessions,
            "redis_available": token_manager.redis_client is not None
        },
        "security": {
            "failed_verifications_ips": len(token_manager.failed_verifications),
            "suspicious_activity_count": len(token_manager.suspicious_activity)
        }
    }

    if token_manager.redis_client:
        # Get Redis statistics
        try:
            info = token_manager.redis_client.info()
            stats["redis"] = {
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "total_commands_processed": info.get("total_commands_processed", 0)
            }
        except Exception as e:
            stats["redis"] = {"status": "error"}

    return stats

# Backward compatibility
def create_access_token_legacy(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Legacy function for backward compatibility."""
    logger.warning("Using legacy token creation function. Consider upgrading to new API.")
    return create_access_token(
        user_id=data.get("user_id", 0),
        username=data.get("username", ""),
        email=data.get("email", ""),
        role=data.get("role", "user"),
        expires_delta=expires_delta
    )
