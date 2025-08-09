"""
Auth module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas, models
from app.database import get_db
from app.utils.dependencies import get_current_user
from app.utils.security import verify_password, create_access_token, get_password_hash


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# ================================
# 🔐 AUTHENTICATION ENDPOINTS
# ================================

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    login_data: schemas.UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return access token.

    Supports both username/email and password authentication.
    """
    try:
        # Find user by username or email
        query = select(models.User).where(
            (models.User.username == login_data.username) |
            (models.User.email == login_data.username)
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user or not verify_password(login_data.password, user.hashed_password):
            logger.warning("Failed login attempt for: %s from {request.client.host}", login_data.username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}. Please contact support."
            ) from e

        # Create access token
        access_token_expires = timedelta(hours=24)  # 24 hour expiry
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            expires_delta=access_token_expires
        )

        # Update last login
        user.last_active = datetime.utcnow()
        await db.commit()

        logger.info("Successful login for user: %s", user.username)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds()),
            "scope": ["user"],
            "username": user.username,
            "user_id": user.id
        }

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Login error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service temporarily unavailable"
        ) from e

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: schemas.UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.

    Creates user with email verification required.
    """
    try:
        # Check if user already exists
        existing_user_query = select(models.User).where(
            (models.User.username == user_data.username) |
            (models.User.email == user_data.email)
        )
        result = await db.execute(existing_user_query)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            if existing_user.username == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                ) from e
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                ) from e

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = models.User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            role="user",
            status="active",
            created_at=datetime.utcnow(),
            xp=0,
            level=1,
            streak=0,
            essence_balance=0
        )

        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        logger.info("New user registered: %s", user_data.username)

        return db_user

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Registration error: %s", e)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service temporarily unavailable"
        ) from e

@router.get("/me", response_model=schemas.UserOut)
async def get_current_authenticated_user(
    current_user: models.User = Depends(get_current_user)
):
    """
    Get current authenticated user information.

    Requires valid Bearer token in Authorization header.
    """
    return current_user

@router.post("/refresh", response_model=schemas.Token)
async def refresh_access_token(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token for authenticated user.

    Returns new token with extended expiry.
    """
    try:
        # Create new access token
        access_token_expires = timedelta(hours=24)
        access_token = create_access_token(
            data={
                "sub": str(current_user.id),
                "username": current_user.username,
                "email": current_user.email,
                "role": current_user.role
            },
            expires_delta=access_token_expires
        )

        # Update last active
        current_user.last_active = datetime.utcnow()
        await db.commit()

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": int(access_token_expires.total_seconds()),
            "scope": ["user"],
            "username": current_user.username,
            "user_id": current_user.id
        }

    except Exception as e:
        logger.error("Token refresh error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh service temporarily unavailable"
        ) from e

# ================================
# 🔑 PASSWORD MANAGEMENT
# ================================

@router.post("/forgot-password")
async def forgot_password(
    request_data: schemas.ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset for user account.

    Sends reset token to user's email address.
    """
    try:
        # Find user by email
        query = select(models.User).where(models.User.email == request_data.email)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, a reset link has been sent"}

        # Generate reset token (implement your token generation logic)
        # For now, return success message
        logger.info("Password reset requested for: %s", request_data.email)

        return {"message": "If the email exists, a reset link has been sent"}

    except Exception as e:
        logger.error("Password reset error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset service temporarily unavailable"
        ) from e

@router.post("/change-password")
async def change_password(
    password_data: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change password for authenticated user.

    Requires current password verification.
    """
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            ) from e

        # Update password
        current_user.hashed_password = get_password_hash(password_data.new_password)
        current_user.updated_at = datetime.utcnow()

        await db.commit()

        logger.info("Password changed for user: %s", current_user.username)

        return {"message": "Password updated successfully"}

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Password change error: %s", e)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change service temporarily unavailable"
        ) from e

# ================================
# 🔐 TOKEN VALIDATION
# ================================

@router.get("/validate")
async def validate_token(
    current_user: models.User = Depends(get_current_user)
):
    """
    Validate current access token.

    Returns token status and user information.
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "status": current_user.status
    }

@router.post("/logout")
async def logout(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout current user.

    Updates last active timestamp.
    """
    try:
        # Update last active
        current_user.last_active = datetime.utcnow()
        await db.commit()

        logger.info("User logged out: %s", current_user.username)

        return {"message": "Successfully logged out"}

    except Exception as e:
        logger.error("Logout error: %s", e)
        # Don't fail logout for database errors
        return {"message": "Successfully logged out"}

# In your backend app/routers/auth.py, add these endpoints:

@router.get("/check-username")
async def check_username_availability(
    username: str = Query(..., min_length=3, max_length=50),
    db: AsyncSession = Depends(get_db)
):
    """Check if username is available for registration."""
    try:
        stmt = select(models.User).where(models.User.username == username.lower())
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        return {"available": existing_user is None, "username": username}
    except Exception as e:
        logger.error("Username check error: %s", e)
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e

@router.get("/check-email")
async def check_email_availability(
    email: str = Query(..., max_length=255),
    db: AsyncSession = Depends(get_db)
):
    """Check if email is available for registration."""
    try:
        stmt = select(models.User).where(models.User.email == email.lower())
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        return {"available": existing_user is None, "email": email}
    except Exception as e:
        logger.error("Email check error: %s", e)
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e
