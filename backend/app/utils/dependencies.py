"""
Dependencies module for Impact ID application.
"""


from typing import Optional, List
import logging

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Activity
from app.models import TaskSubmission
from app.auth import get_current_user_async  # Import from your existing auth module
from app.utils.token import TokenSecurityManager, TokenType
from app.database import get_db
from app.models import User

# Create a simple get_client_ip function since app.security doesn't exist
def get_client_ip(request) -> str:
    """Get client IP address from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# Placeholder for verify_token and SecurityContext since app.security doesn't exist
_token_manager = TokenSecurityManager()

def verify_token(token: str, token_type: str):
    """Minimal wrapper delegating to TokenSecurityManager for access tokens.

    Returns a payload-like object with at least 'sub' attribute (user id) for
    compatibility with existing code expecting payload.sub.
    """
    expected = TokenType.ACCESS if token_type == "access" else None
    payload = _token_manager.verify_token(token, expected_type=expected)
    # Provide attribute access alias used downstream (sub)
    class _PayloadProxy:
        def __init__(self, p):
            self._p = p
            self.sub = p.user_id
            self.iat = p.issued_at
        def __getattr__(self, item):
            return getattr(self._p, item)
    return _PayloadProxy(payload)

class SecurityContext:
    """Placeholder for SecurityContext."""
    def __init__(self, request):
        self.request = request


logger = logging.getLogger(__name__)

# ================================
# 🔐 AUTHENTICATION DEPENDENCIES
# ================================

# OAuth2 scheme for token extraction
oauth2_scheme = HTTPBearer(auto_error=True)
oauth2_scheme_optional = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> User:
    """
    🎯 Get current authenticated user from JWT token.
    """
    try:
        # Verify token
        payload = verify_token(credentials.credentials, "access")
        user_id = getattr(payload, "sub", None)

        if user_id is None:
            logger.warning("Token missing user ID")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        stmt = select(User).where(User.id == int(user_id))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            logger.warning("User %s not found in database", user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check user status
        if user.status not in ["active", "verified"]:
            logger.warning("User %s has status: %s", user_id, user.status)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}"
            )

        # Update last active timestamp
        user.last_active = getattr(payload, "iat", None)
        await db.commit()

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Authentication error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db),
    request: Request = None
) -> Optional[User]:
    """
    🔓 Get current user if token is provided and valid, otherwise return None.
    """
    if not credentials:
        return None

    try:
        # Use the main get_current_user function but handle exceptions
        return await get_current_user(credentials, db, request)
    except HTTPException:
        # Return None for invalid tokens instead of raising exception
        return None

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    ✅ Get current active user (must be active status).
    """
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    return current_user

# ================================
# 🎭 ROLE-BASED ACCESS CONTROL
# ================================

def require_role(required_role: str):
    """
    🎭 Dependency factory for role-based access control.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        role_hierarchy = {
            "user": 1,
            "moderator": 2,
            "admin": 3,
            "superadmin": 4
        }

        user_level = role_hierarchy.get(current_user.role, 0)
        required_level = role_hierarchy.get(required_role, 999)

        if user_level < required_level:
            logger.warning(
                "User %s attempted to access {required_role} endpoint with role {current_user.role}",
                current_user.id
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. {required_role} role required."
            )

        return current_user

    return role_checker

def require_roles(required_roles: List[str]):
    """
    🎭 Dependency factory for multiple role access control.
    """
    def roles_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            logger.warning(
                "User %s attempted to access endpoint requiring roles {required_roles} with role {current_user.role}",
                current_user.id
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. One of these roles required: {', '.join(required_roles)}"
            )

        return current_user

    return roles_checker

# Specific role dependencies
require_admin = require_role("admin")
require_moderator = require_role("moderator")
require_moderator_or_admin = require_roles(["moderator", "admin"])

# ================================
# 🔐 PERMISSION-BASED ACCESS CONTROL
# ================================

def check_user_permission(
    user: User,
    permission: str,
    resource_id: Optional[int] = None
) -> bool:
    """
    🔐 Check if user has specific permission.
    """
    # Admin has all permissions
    if user.role == "admin":
        return True

    # Define permission mappings
    permissions = {
        "user": {
            "read_own_profile", "update_own_profile", "submit_tasks",
            "view_public_content", "participate_activities"
        },
        "moderator": {
            "read_own_profile", "update_own_profile", "submit_tasks",
            "view_public_content", "participate_activities",
            "moderate_submissions", "manage_tasks", "view_user_reports"
        },
        "admin": "*"  # All permissions
    }

    user_permissions = permissions.get(user.role, set())

    if user_permissions == "*" or permission in user_permissions:
        return True

    # Check resource ownership for 'own' permissions
    if permission.endswith("_own_profile") and resource_id == user.id:
        return True

    return False

def require_permission(permission: str, resource_id_param: Optional[str] = None):
    """
    🔐 Dependency factory for permission-based access control.
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user),
        request: Request = None,
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # Extract resource ID from path parameters if specified
        resource_id = None
        if resource_id_param and request:
            resource_id = request.path_params.get(resource_id_param)
            if resource_id:
                try:
                    resource_id = int(resource_id)
                except ValueError as e:
                    resource_id = None

        has_permission = await check_user_permission(
            current_user, permission, resource_id, db
        )

        if not has_permission:
            logger.warning("User %s denied permission {permission}", current_user.id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission}"
            )

        return current_user

    return permission_checker

# ================================
# 🔍 SECURITY CONTEXT DEPENDENCY
# ================================

def get_security_context(request: Request) -> SecurityContext:
    """
    🔍 Extract security context from request.
    """
    return SecurityContext(request)

# ================================
# 🎯 RESOURCE OWNERSHIP VALIDATION
# ================================

async def validate_resource_ownership(
    user: User,
    resource_type: str,
    resource_id: int,
    db: AsyncSession
) -> bool:
    """
    🎯 Validate if user owns a specific resource.
    """
    try:
        if resource_type == "task_submission":
            stmt = select(TaskSubmission).where(
                TaskSubmission.id == resource_id,
                TaskSubmission.user_id == user.id
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none() is not None

        elif resource_type == "user_profile":
            return resource_id == user.id

        elif resource_type == "activity":
            stmt = select(Activity).where(
                Activity.id == resource_id,
                Activity.user_id == user.id
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none() is not None

        # Add more resource types as needed
        return False

    except Exception as e:
        logger.error("Resource ownership validation error: %s", e)
        return False

def require_resource_ownership(resource_type: str, resource_id_param: str):
    """
    🎯 Dependency factory for resource ownership validation.
    """
    async def ownership_checker(
        current_user: User = Depends(get_current_user),
        request: Request = None,
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # Extract resource ID from path parameters
        resource_id = request.path_params.get(resource_id_param)

        if not resource_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resource ID not provided"
            )

        try:
            resource_id = int(resource_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid resource ID format"
            )

        # Admin bypass
        if current_user.role == "admin":
            return current_user

        # Check ownership
        is_owner = await validate_resource_ownership(
            current_user, resource_type, resource_id, db
        )

        if not is_owner:
            logger.warning(
                "User %s attempted to access {resource_type} {resource_id} without ownership",
                current_user.id
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )

        return current_user

    return ownership_checker

# ================================
# 🕐 RATE LIMITING DEPENDENCIES
# ================================

def get_user_identifier(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> str:
    """
    🆔 Get unique identifier for rate limiting.
    """
    if current_user:
        return f"user:{current_user.id}"

    # Fallback to IP address for anonymous users
    return f"ip:{get_client_ip(request)}"

# ================================
# 🔍 LOGGING AND AUDIT DEPENDENCIES
# ================================

def log_user_action(
    action: str,
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    📝 Log user action for audit trail.
    """
    try:
        # You can implement audit logging here
        logger.info("User %s performed action: %s", current_user.id, action)

        # Store in audit log table if needed
        # audit_entry = AuditLog(
        #     user_id=current_user.id,
        #     action=action,
        #     ip_address=get_client_ip(request) if request else None,
        #     user_agent=request.headers.get("user-agent", None) if request else None,
        #     timestamp=utcnow()
        # )
        # db.add(audit_entry)
        # await db.commit()

    except Exception as e:
        logger.error("Audit logging error: %s", e)
        # Don't fail the request for logging errors

# ================================
# 🎯 VALIDATION DEPENDENCIES
# ================================

def validate_pagination(
    page: int = 1,
    size: int = 10,
    max_size: int = 100
):
    """
    📄 Validate pagination parameters.
    """
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page number must be greater than 0"
        )

    if size < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be greater than 0"
        )

    if size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Page size cannot exceed {max_size}"
        )

    return {"page": page, "size": size, "offset": (page - 1) * size}

# ================================
# 🎮 FEATURE FLAGS DEPENDENCY
# ================================

def require_feature_enabled(feature_name: str):
    """
    🎮 Dependency factory for feature flag validation.
    """
    def feature_checker():
        # Check if feature is enabled (you can implement feature flags here)
        # For now, all features are enabled
        feature_enabled = True  # You can check from config/database

        if not feature_enabled:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Feature '{feature_name}' is currently disabled"
            )

        return True

    return feature_checker

# ================================
# 🔐 API KEY AUTHENTICATION
# ================================

def get_api_key_user() -> Optional[User]:
    """
    🔑 Authenticate user by API key.
    """
    try:
        # Query user by API key (implement APIKey model if needed)
        # For now, this is a placeholder
        logger.info("API key authentication attempted")
        return None

    except Exception as e:
        logger.error("API key authentication error: %s", e)
        return None

# ================================
# 🏥 HEALTH CHECK DEPENDENCIES
# ================================

async def check_database_health(db: AsyncSession = Depends(get_db)) -> bool:
    """
    🏥 Check database connectivity for health endpoints.
    """
    try:
        await db.execute(select(1))
        return True
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        return False
