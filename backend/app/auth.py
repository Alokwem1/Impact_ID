"""
Auth module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import logging

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models
from app.database import get_db
from app.utils.token import (


    verify_token,
    TokenPayload,
    TokenType,
    TokenScope,
    get_user_sessions,
    revoke_user_sessions
)
# Correct import for utcnow utility (previous path caused NameError during auth flows)
from app.utils.common import utcnow
logger = logging.getLogger(__name__)

# ================================
# 🔐 Enhanced Password Security
# ================================

# Advanced bcrypt configuration for production security
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Higher rounds for better security
    bcrypt__ident="2b"  # Use the latest bcrypt variant
)

def hash_password(password: str) -> str:
    """
    🔒 Hash password using production-grade bcrypt settings.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    ✅ Verify password against hash with timing attack protection.
    """
    return pwd_context.verify(plain_password, hashed_password)

def check_password_strength(password: str) -> tuple[bool, List[str]]:
    """
    🛡️ Check password strength and return issues.
    """
    issues = []

    if len(password) < 8:
        issues.append("Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        issues.append("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        issues.append("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        issues.append("Password must contain at least one number")
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        issues.append("Password must contain at least one special character")

    return len(issues) == 0, issues

# =========================================
# 🎫 Enhanced OAuth2 Bearer Scheme
# =========================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login",
    scopes={
        "user": "Basic user access",
        "admin": "Administrative access",
        "moderator": "Moderation access",
        "read_only": "Read-only access",
        "api_access": "API access",
        "elevated": "Elevated permissions"
    }
)

# Optional OAuth2 scheme for endpoints that work with or without auth
oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/users/login",
    auto_error=False
)

# ================================
# 🔍 Security Context Extraction
# ================================

def get_security_context(request: Request) -> Dict[str, Any]:
    """
    🕵️ Extract security context from request for token validation.
    """
    return {
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent", None),
        "device_fingerprint": request.headers.get("x-device-fingerprint", None),
        "request_path": str(request.url.path),
        "request_method": request.method
    }

# ================================
# 🧠 Enhanced User Authentication
# ================================

async def get_current_user_async(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> models.User:
    """
    🎯 Advanced async user authentication with comprehensive security.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Get security context
        security_context = get_security_context(request) if request else None

        # Verify token with enhanced security
        payload = verify_token(
            token=token,
            credentials_exception=credentials_exception,
            expected_type=TokenType.ACCESS,
            security_context=security_context
        )

        # Get user from database
        stmt = select(models.User).where(models.User.id == payload.user_id)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if user is None:
            logger.warning("Token valid but user %s not found", payload.user_id)
            raise credentials_exception

        # Enhanced status checking
        if user.status not in ["active", "verified"]:
            status_messages = {
                "pending": "Account pending verification",
                "suspended": "Account temporarily suspended",
                "banned": "Account has been banned",
                "inactive": "Account is inactive"
            }
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=status_messages.get(user.status, "Account access denied")
            )

        # Update last seen activity
        user.last_active = utcnow()
        await db.commit()

        # Add token payload to user for access in endpoints
        user._token_payload = payload

        return user

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Authentication error: %s", e)
        raise credentials_exception

async def get_current_user_optional_async(
    token: str = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> Optional[models.User]:
    """
    🔓 Optional authentication - returns user if token is valid, None otherwise.
    """
    if not token:
        return None

    try:
        return await get_current_user_async(token, db, request)
    except HTTPException:
        return None

# ================================
# 🛡️ Advanced Role-Based Access Control
# ================================

def has_role_async(required_role: str):
    """
    🎭 Async role checker with enhanced permissions.
    """
    def checker(current_user: models.User = Depends(get_current_user_async)) -> models.User:
        """checker function."""
        if not _check_role_permission(current_user.role, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires '{required_role}' role or higher."
            )
        return current_user
    return checker

def has_scope_async(required_scopes: List[str]):
    """
    🔑 Check for specific token scopes.
    """
    def checker(current_user: models.User = Depends(get_current_user_async)) -> models.User:
        """checker function."""
        token_payload = getattr(current_user, '_token_payload', None)
        if not token_payload:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token payload not available"
            )

        user_scopes = token_payload.scopes
        if not all(scope in user_scopes for scope in required_scopes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Requires scopes: {required_scopes}"
            )
        return current_user
    return checker

def has_permission_async(permission: str):
    """
    🎫 Check for specific permissions (can be extended with a permission system).
    """
    def checker(current_user: models.User = Depends(get_current_user_async)) -> models.User:
        """checker function."""
        # Basic permission mapping - extend this for complex permission systems
        permission_map = {
            "create_tasks": ["admin", "moderator"],
            "approve_submissions": ["admin", "moderator"],
            "manage_users": ["admin"],
            "view_analytics": ["admin", "moderator"],
            "moderate_content": ["admin", "moderator"],
            "system_settings": ["admin"]
        }

        allowed_roles = permission_map.get(permission, [])
        if not allowed_roles or current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' denied"
            )
        return current_user
    return checker

def require_elevated_access_async():
    """
    🚨 Require elevated access (recent authentication or special token).
    """
    def checker(current_user: models.User = Depends(get_current_user_async)) -> models.User:
        """checker function."""
        token_payload = getattr(current_user, '_token_payload', None)
        if not token_payload:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token payload not available"
            )

        # Check if token is elevated or recent
        if not token_payload.is_elevated:
            token_age = utcnow() - token_payload.issued_at
            if token_age > timedelta(minutes=15):  # Require recent authentication
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Elevated access required. Please re-authenticate."
                )
        return current_user
    return checker

# ================================
# 🔐 Session Management
# ================================

async def get_user_session_info(
    current_user: models.User = Depends(get_current_user_async)
) -> Dict[str, Any]:
    """
    📊 Get current user's session information.
    """
    token_payload = getattr(current_user, '_token_payload', None)
    sessions = get_user_sessions(current_user.id)

    return {
        "current_session": {
            "session_id": token_payload.session_id if token_payload else None,
            "issued_at": token_payload.issued_at if token_payload else None,
            "expires_at": token_payload.expires_at if token_payload else None,
            "ip_address": token_payload.ip_address if token_payload else None,
            "user_agent": token_payload.user_agent if token_payload else None
        },
        "all_sessions": sessions,
        "session_count": len(sessions)
    }

async def revoke_other_sessions(
    current_user: models.User = Depends(get_current_user_async)
) -> Dict[str, Any]:
    """
    🔥 Revoke all other sessions except current one.
    """
    token_payload = getattr(current_user, '_token_payload', None)
    current_session_id = token_payload.session_id if token_payload else None

    revoked_count = revoke_user_sessions(current_user.id, current_session_id)

    return {
        "message": f"Revoked {revoked_count} other sessions",
        "revoked_count": revoked_count
    }

# ================================
# 🔧 Utility Functions
# ================================

def _check_role_permission(user_role: str, required_role: str) -> bool:
    """
    🎯 Check if user role has permission for required role.
    Implements role hierarchy: admin > moderator > user
    """
    role_hierarchy = {
        "admin": 3,
        "moderator": 2,
        "user": 1
    }

    user_level = role_hierarchy.get(user_role.lower(), 0)
    required_level = role_hierarchy.get(required_role.lower(), 0)

    return user_level >= required_level

async def validate_password_reset_permission(
    user_id: int,
    current_user: models.User = Depends(get_current_user_async)
) -> bool:
    """
    🔑 Check if user can reset password for given user_id.
    """
    # Users can reset their own password, admins can reset any password
    return current_user.id == user_id or current_user.role == "admin"

# ================================
# 🔄 Token Refresh Dependency
# ================================

async def get_current_user_from_refresh_token(
    token: str,
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> models.User:
    """
    🔄 Get user from refresh token for token refresh endpoints.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Get security context
        security_context = get_security_context(request) if request else None

        # Verify refresh token
        payload = verify_token(
            token=token,
            credentials_exception=credentials_exception,
            expected_type=TokenType.REFRESH,
            security_context=security_context
        )

        # Get user from database
        stmt = select(models.User).where(models.User.id == payload.user_id)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if user is None or user.status not in ["active", "verified"]:
            raise credentials_exception

        user._token_payload = payload
        return user

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Refresh token validation error: %s", e)
        raise credentials_exception
# ================================
# 🚦 Rate Limiting for Auth
# ================================

class AuthRateLimiter:
    """Simple in-memory rate limiter for authentication attempts."""
    
    def __init__(self):
        self.attempts = {}
        self.lockouts = {}

    def can_attempt(self, identifier: str, max_attempts: int = 5, window_minutes: int = 15) -> bool:
        """Check if authentication attempt is allowed."""
        now = utcnow()
        window_start = now - timedelta(minutes=window_minutes)

        # Clean old attempts
        if identifier in self.attempts:
            self.attempts[identifier] = [
                attempt for attempt in self.attempts[identifier]
                if attempt > window_start
            ]

        # Check lockout
        if identifier in self.lockouts and self.lockouts[identifier] > now:
            return False

        # Check attempts
        current_attempts = len(self.attempts.get(identifier, []))
        return current_attempts < max_attempts
    def record_attempt(self, identifier: str, failed: bool = False):
        """Record an authentication attempt."""
        now = utcnow()

        if identifier not in self.attempts:
            self.attempts[identifier] = []

        if failed:
            self.attempts[identifier].append(now)

            # Lock out after too many failures
            if len(self.attempts[identifier]) >= 5:
                self.lockouts[identifier] = now + timedelta(hours=1)

# Global rate limiter instance
auth_rate_limiter = AuthRateLimiter()

# ================================
# 🎯 Backward Compatibility
# ================================

# Sync versions for backward compatibility (deprecated)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> models.User:
    """
    ⚠️ DEPRECATED: Use get_current_user_async instead.
    Sync version maintained for backward compatibility.
    """
    logger.warning("Using deprecated sync get_current_user. Upgrade to async version.")
    # This would need to be implemented differently for true backward compatibility
    # For now, we'll raise an error to encourage migration
    raise RuntimeError("Sync authentication is deprecated. Use get_current_user_async.")

def has_role(required_role: str):
    """
    ⚠️ DEPRECATED: Use has_role_async instead.
    """
    logger.warning("Using deprecated sync has_role. Upgrade to async version.")
    raise RuntimeError("Sync role checking is deprecated. Use has_role_async.")
