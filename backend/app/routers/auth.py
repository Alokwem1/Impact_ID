"""
Auth module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Optional
import logging
import os
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import schemas, models
from app.database import get_db
from app.utils.dependencies import get_current_user
from app.utils.security import (
    verify_password,
    create_access_token,
    get_password_hash,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.utils.common import utcnow


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Authentication"])  # Prefix applied centrally in main include_router
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
            client_ip = getattr(request.client, 'host', 'unknown') if request else 'unknown'
            logger.warning("Failed login attempt for: %s from %s", login_data.username, client_ip)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}. Please contact support."
            )

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
        user.last_active = utcnow()
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service temporarily unavailable"
    )

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: schemas.AuthRegister,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.

    Creates user with email verification required.
    """
    try:
        # Normalize input (case-fold & trim) for consistent uniqueness handling
        normalized_username = user_data.username.strip().lower()
        normalized_email = user_data.email.strip().lower()

        # Check if user already exists (case-insensitive match)
        existing_user_query = select(models.User).where(
            (func.lower(models.User.username) == normalized_username) |
            (func.lower(models.User.email) == normalized_email)
        )
        result = await db.execute(existing_user_query)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            # Provide precise conflict detail
            if existing_user.username.lower() == normalized_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        # Optional breach password check (k-anonymity style stub)
        if os.getenv("ENABLE_BREACH_CHECK", "0").lower() in {"1","true","yes"}:
            pwd_hash = hashlib.sha1(user_data.password.encode("utf-8")).hexdigest().upper()
            prefix, suffix = pwd_hash[:5], pwd_hash[5:]
            # In a real implementation we would query haveibeenpwned range API for prefix
            # Here we simulate a tiny in-memory deny list to demonstrate behavior
            simulated_compromised_suffixes = {"DEMO1234567890DEADBEEFDEADBEEFDEADBE"}
            if suffix in simulated_compromised_suffixes:
                raise HTTPException(status_code=400, detail="Password appears in breach corpus; choose a stronger password")

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = models.User(
            username=normalized_username,
            email=normalized_email,
            hashed_password=hashed_password,
            role="user",
            status="active",
            created_at=utcnow(),
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Registration error: %s", e)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service temporarily unavailable"
    )

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
        current_user.last_active = utcnow()
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
        )

# ================================
# 🔑 PASSWORD MANAGEMENT
# ================================

@router.post("/forgot-password")
async def forgot_password(
    request_data: schemas.ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Initiate password reset flow.

    Always returns a generic success message (don't leak user existence).
    If user exists: generate password reset token, persist in DB table `password_reset_tokens`.
    (Optional future enhancement: dispatch email with reset link.)
    """
    try:
        stmt = select(models.User).where(models.User.email == request_data.email.lower())
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            # Create JWT-based reset token
            reset_token = create_password_reset_token(user_id=user.id, email=user.email)

            # Persist DB record (duplicate tokens prevented by unique constraint)
            expires_at = utcnow() + timedelta(hours=2)
            db_record = models.PasswordResetToken(
                user_id=user.id,
                token=reset_token,
                expires_at=expires_at,
                ip_address=getattr(request.client, 'host', None)
            )
            db.add(db_record)
            try:
                await db.commit()
            except Exception:
                await db.rollback()
                logger.warning("Failed to persist password reset token for user_id=%s", user.id)

            logger.info("Password reset requested for user_id=%s email=%s", user.id, user.email)

        # Generic response regardless of user existence
        return {"message": "If the email exists, a reset link has been sent"}
    except Exception as e:
        logger.error("Password reset request error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset service temporarily unavailable"
    )

@router.post("/reset-password")
async def reset_password(
    payload: schemas.ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Complete password reset using a valid token.

    Steps:
    1. Verify JWT token structure & type via unified manager.
    2. Lookup DB token record (unused, not expired).
    3. Update user password & mark token as used.
    4. Return success message.
    """
    try:
        # Verify token (raises HTTPException if invalid/expired/type mismatch). Tests expect 400/404 not 401.
        try:
            token_payload = verify_password_reset_token(payload.token)
        except HTTPException as ve:
            # Map 401 from token verification to 400 to satisfy negative test expectation
            if ve.status_code == status.HTTP_401_UNAUTHORIZED:
                raise HTTPException(status_code=400, detail="Invalid token")
            raise
        user_id = token_payload.get("user_id") or token_payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token payload")

        # Fetch DB token record
        stmt = select(models.PasswordResetToken).where(models.PasswordResetToken.token == payload.token)
        result = await db.execute(stmt)
        token_record = result.scalar_one_or_none()
        if not token_record or token_record.used:
            raise HTTPException(status_code=400, detail="Invalid or used token")
        if utcnow() > token_record.expires_at:
            raise HTTPException(status_code=400, detail="Token has expired")

        # Fetch user
        user_stmt = select(models.User).where(models.User.id == token_record.user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Optional breach check before accepting new password
        if os.getenv("ENABLE_BREACH_CHECK", "0").lower() in {"1","true","yes"}:
            pwd_hash = hashlib.sha1(payload.new_password.encode("utf-8")).hexdigest().upper()
            prefix, suffix = pwd_hash[:5], pwd_hash[5:]
            simulated_compromised_suffixes = {"DEMO1234567890DEADBEEFDEADBEEFDEADBE"}
            if suffix in simulated_compromised_suffixes:
                raise HTTPException(status_code=400, detail="Password appears in breach corpus; choose a stronger password")

        # Set new password
        user.hashed_password = get_password_hash(payload.new_password)
        user.updated_at = utcnow() if hasattr(user, 'updated_at') else utcnow()

        # Mark token used
        token_record.used = True
        token_record.used_at = utcnow()
        await db.commit()

        logger.info("Password reset successful for user_id=%s", user.id)
        return {"message": "Password reset successful"}
    except HTTPException:
        # Already proper client error semantics
        raise
    except Exception as e:
        logger.error("Password reset error: %s", e)
        await db.rollback()
    raise HTTPException(status_code=500, detail="Password reset failed")
            

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
            )

        # Update password
        current_user.hashed_password = get_password_hash(password_data.new_password)
        current_user.updated_at = utcnow()

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
    )

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
        current_user.last_active = utcnow()
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

            raise HTTPException(status_code=500, detail="Error")
            

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

            raise HTTPException(status_code=500, detail="Error")
            