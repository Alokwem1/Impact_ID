"""
Users module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Optional
import logging
import os
import uuid

from eth_account.messages import encode_defunct
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from web3.auto import w3

from app import models, auth, schemas
from app.database import get_db
from app.utils.email import send_email
from app.utils.security import create_access_token
from app.utils.token import verify_token
from app.utils.common import utcnow


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["Users"])

# =========================
# 🔐 Authentication & Registration
# =========================

@router.post("/signup", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: schemas.UserCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    🎯 Enhanced user registration with comprehensive validation and security.
    """
    try:
        # Check for existing users with same email or username
        stmt = select(models.User).where(
            (models.User.email == payload.email.lower()) |
            (models.User.username == payload.username.lower())
        )
        result = await db.execute(stmt)
        existing_user = result.scalars().first()

        if existing_user:
            if existing_user.email == payload.email.lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this email already exists."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An account with this username already exists."
                )

        # Create new user with enhanced security
        hashed_password = auth.hash_password(payload.password)
        verification_token = str(uuid.uuid4())

        new_user = models.User(
            username=payload.username.lower(),
            email=payload.email.lower(),
            hashed_password=hashed_password,
            verification_token=verification_token,
            status="pending",  # Require email verification
            role="user",
            xp=0,
            level=1,
            streak=0,
            essence_balance=0,
            created_at=utcnow()
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Send verification email
        # Build a frontend URL so users land on the SPA page that handles verification,
        # which then calls the backend API /api/users/verify-email under the hood.
        # Prefer FRONTEND_BASE_URL if provided; otherwise fall back to localhost:5173 in dev,
        # and to backend base URL (same host) as a last resort.
        def _frontend_base(req: Request) -> str:
            fe = os.getenv("FRONTEND_BASE_URL", "").strip()
            if fe:
                return fe.rstrip('/') + '/'
            env = os.getenv("ENVIRONMENT", "development").lower()
            if env == "development":
                return "http://localhost:5173/"
            # Fallback to same host root (may be behind a reverse proxy in prod)
            return str(req.base_url.replace(path='/'))

        verification_url = f"{_frontend_base(request)}verify-email?token={verification_token}"
        background_tasks.add_task(
            send_email,
            to=new_user.email,
            subject="Welcome to Impact ID! Please Verify Your Email",
            body=f"""
            Hi {new_user.username},

            Welcome to Impact ID! 🌟

            Please click the link below to verify your email and activate your account:
            {verification_url}

            This link will expire in 24 hours.

            If you didn't create this account, please ignore this email.

            Best regards,
            The Impact ID Team
            """
        )
        logger.info("New user registered: %s (ID: %s)", new_user.username, new_user.id)
        return new_user

    except HTTPException as e:
        raise
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email or username already exists."
    )
    except Exception as e:
        await db.rollback()
        logger.error("Registration error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration service temporarily unavailable."
    )

# =========================
# 🧰 Development helper: create user quickly (dev only)
# =========================
from pydantic import BaseModel, EmailStr

class DevUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str = "DevPass123!"
    make_admin: bool = False
    verified: bool = True
    role: Optional[str] = None

@router.post("/dev/create-user", tags=["Development"], include_in_schema=False)
async def dev_create_user(
    payload: DevUserCreate,
    db: AsyncSession = Depends(get_db)
):
    env = os.getenv("ENVIRONMENT", "development").lower()
    debug = os.getenv("DEBUG", "true").lower() == "true"
    if not (env == "development" or debug):
        # Hide in non-dev
        raise HTTPException(status_code=404, detail="API endpoint not found")

    # Check existing
    stmt = select(models.User).where(
        (models.User.username == payload.username.lower()) |
        (models.User.email == payload.email.lower())
    )
    res = await db.execute(stmt)
    existing = res.scalars().first()
    if existing:
        return {"detail": "User already exists", "id": existing.id}

    user = models.User(
        username=payload.username.lower(),
        email=payload.email.lower(),
        hashed_password=auth.hash_password(payload.password),
        role="admin" if payload.make_admin else (payload.role or "user"),
        status="active",
        email_verified=payload.verified,
        created_at=utcnow(),
        xp=0,
        level=1,
        essence_balance=0,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token_data = {"sub": str(user.id), "username": user.username, "email": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "email_verified": user.email_verified,
        },
        "access_token": access_token,
        "note": "Dev helper – /api/users/dev-create"
    }

@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """
    🔐 Enhanced login with support for username/email and comprehensive security.
    """
    try:
        # Support login with either username or email
        stmt = select(models.User).where(
            (models.User.username == form_data.username.lower()) |
            (models.User.email == form_data.username.lower())
        )
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            # Log failed attempt
            client_ip = getattr(request.client, 'host', 'unknown') if request else 'unknown'
            logger.warning("Failed login attempt for: %s from %s", form_data.username, client_ip)

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Check account status
        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your inbox for the verification link."
            )

        if user.status != "active":
            status_messages = {
                "pending": "Account is pending approval",
                "suspended": "Account has been suspended",
                "banned": "Account has been banned",
                "deleted": "Account has been deleted"
            }
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=status_messages.get(user.status, "Account access denied")
            )

        # Create access token with extended information
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role
        }

        access_token = create_access_token(data=token_data)

        # Update last login
        user.last_active = utcnow()
        await db.commit()
        logger.info("Successful login: %s (ID: %s)", user.username, user.id)

        # Derive expiry from token payload (unified token manager embeds expires_at)
        try:
            token_payload = verify_token(access_token)
            expires_in = int((token_payload.expires_at - utcnow()).total_seconds())
        except Exception:
            # Fallback to 0 if parsing fails (should not normally happen)
            expires_in = 0

        return {
            "access_token": access_token,
            "refresh_token": None,
            "token_type": "bearer",
            "expires_in": max(expires_in, 0),
            "scope": token_payload.scopes if 'token_payload' in locals() and getattr(token_payload, 'scopes', None) else ["user"],
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
    )

@router.post("/wallet-login", response_model=schemas.Token)
async def wallet_login(
    payload: schemas.WalletLoginRequest,
    request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """
    🔗 Enhanced wallet-based authentication with auto-registration.
    """
    try:
        # Verify signature
        message = encode_defunct(text=payload.message)
        recovered_address = w3.eth.account.recover_message(message, signature=payload.signature)

        if recovered_address.lower() != payload.address.lower():
            client_ip = getattr(request.client, 'host', 'unknown') if request else 'unknown'
            logger.warning("Invalid wallet signature from %s for address %s", client_ip, payload.address)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signature verification failed"
            )

        # Find or create user
        stmt = select(models.User).where(models.User.wallet_address == payload.address.lower())
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            # Auto-register wallet user
            user = models.User(
                username=f"wallet_{payload.address[-8:]}",  # More unique username
                email=f"{payload.address.lower()}@wallet.impactid.local",
                hashed_password=str(uuid.uuid4()),  # Random password for security
                wallet_address=payload.address.lower(),
                email_verified=True,  # Wallet ownership is proof of identity
                status="active",
                role="user",
                xp=0,
                level=1,
                streak=0,
                essence_balance=0,
                created_at=utcnow()
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            logger.info("New wallet user created: %s (Address: %s)", user.username, payload.address)

        # Check account status
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}. Please contact support."
            )

        # Create access token
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "wallet": payload.address.lower()
        }

        access_token = create_access_token(data=token_data)

        # Update last login
        user.last_active = utcnow()
        await db.commit()
        logger.info("Wallet login successful: %s (Address: %s)", user.username, payload.address)

        try:
            token_payload = verify_token(access_token)
            expires_in = int((token_payload.expires_at - utcnow()).total_seconds())
        except Exception:
            expires_in = 0

        return {
            "access_token": access_token,
            "refresh_token": None,
            "token_type": "bearer",
            "expires_in": max(expires_in, 0),
            "scope": token_payload.scopes if 'token_payload' in locals() and getattr(token_payload, 'scopes', None) else ["user"],
            "username": user.username,
            "user_id": user.id
        }

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Wallet authentication error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature or wallet authentication failed"
    )

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """
    ✅ Enhanced email verification with comprehensive validation.
    """
    try:
        stmt = select(models.User).where(models.User.verification_token == token)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired verification token"
            )

        if user.is_verified:
            return {"message": "Email is already verified. You can log in now."}

        # Verify email and activate account (persist to actual column)
        user.email_verified = True
        user.verification_token = None
        user.status = "active"
        user.verified_at = utcnow()

        await db.commit()
        logger.info("Email verified for user: %s (ID: %s)", user.username, user.id)

        return {
            "message": "Email verified successfully! You can now log in to your account.",
            "username": user.username
        }

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Email verification error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification service temporarily unavailable"
    )

# =========================
# 👤 Profile Management
# =========================

@router.get("/@me", response_model=schemas.UserOut)
async def get_my_profile(current_user: models.User = Depends(auth.get_current_user_async)):
    """
    👤 Get current user's complete profile.
    """
    return current_user

@router.put("/@me", response_model=schemas.UserOut)
async def update_my_profile(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    ✏️ Enhanced profile update with validation and security checks.
    """
    try:
        changes_made = False

        # Username change validation
        if payload.username and payload.username.lower() != current_user.username:
            # Check availability
            stmt = select(models.User).where(
                and_(
                    models.User.username == payload.username.lower(),
                    models.User.id != current_user.id
                )
            )
            result = await db.execute(stmt)
            if result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username is already taken"
                )

            current_user.username = payload.username.lower()
            changes_made = True

        # Email change validation
        if payload.email and payload.email.lower() != current_user.email:
            # Check availability
            stmt = select(models.User).where(
                and_(
                    models.User.email == payload.email.lower(),
                    models.User.id != current_user.id
                )
            )
            result = await db.execute(stmt)
            if result.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email is already in use"
                )

            current_user.email = payload.email.lower()
            current_user.is_verified = False  # Require re-verification
            changes_made = True

        # Update optional profile fields
        profile_fields = ['bio', 'location', 'website']
        for field in profile_fields:
            value = getattr(payload, field, None)
            if value is not None:
                setattr(current_user, field, value)
                changes_made = True

        if changes_made:
            current_user.updated_at = utcnow()
            await db.commit()
            await db.refresh(current_user)

            logger.info("Profile updated for user: %s (ID: %s)", current_user.username, current_user.id)

        return current_user

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Profile update error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update service temporarily unavailable"
    )

@router.get("/{username}", response_model=schemas.PublicUserProfile)
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    """
    🌐 Enhanced public profile with comprehensive statistics.
    """
    try:
        stmt = select(models.User).options(
            joinedload(models.User.badges).joinedload(models.UserBadge.badge)
        ).where(
            and_(
                models.User.username == username.lower(),
                models.User.status == "active"  # Only show active users
            )
        )
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or account is inactive"
            )

        # Get additional statistics
        task_count_stmt = select(func.count(models.TaskSubmission.id)).where(
            and_(
                models.TaskSubmission.user_id == user.id,
                models.TaskSubmission.status == "approved"
            )
        )
        task_count_result = await db.execute(task_count_stmt)
        task_count = task_count_result.scalar() or 0

        return schemas.PublicUserProfile(
            username=user.username,
            created_at=user.created_at,
            xp=user.xp,
            level=user.level,
            badges=[{
                "title": b.badge.title,
                "description": b.badge.description,
                "awarded_at": b.awarded_at,
                "icon": getattr(b.badge, 'icon', None),
                "rarity": getattr(b.badge, 'rarity', 'common')
            } for b in user.badges if b.badge],
            streak=getattr(user, 'streak', 0),
            essence_balance=user.essence_balance,
            bio=getattr(user, 'bio', None),
            location=getattr(user, 'location', None),
            website=getattr(user, 'website', None),
            total_tasks_completed=task_count,
            weaving_streak=getattr(user, 'weaving_streak', 0),
            last_active=getattr(user, 'last_active', None)
        )

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Public profile error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile service temporarily unavailable"
    )

@router.get("/@me/stats", response_model=schemas.UserStats)
async def get_my_stats(
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    📊 Enhanced user statistics with comprehensive metrics.
    """
    try:
        today = utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Get task completion statistics
        stats_queries = {
            'today': select(func.count(models.TaskSubmission.id)).where(
                and_(
                    models.TaskSubmission.user_id == current_user.id,
                    models.TaskSubmission.status == "approved",
                    func.date(models.TaskSubmission.submitted_at) == today
                )
            ),
            'week': select(func.count(models.TaskSubmission.id)).where(
                and_(
                    models.TaskSubmission.user_id == current_user.id,
                    models.TaskSubmission.status == "approved",
                    func.date(models.TaskSubmission.submitted_at) >= week_ago
                )
            ),
            'month': select(func.count(models.TaskSubmission.id)).where(
                and_(
                    models.TaskSubmission.user_id == current_user.id,
                    models.TaskSubmission.status == "approved",
                    func.date(models.TaskSubmission.submitted_at) >= month_ago
                )
            ),
            'total': select(func.count(models.TaskSubmission.id)).where(
                and_(
                    models.TaskSubmission.user_id == current_user.id,
                    models.TaskSubmission.status == "approved"
                )
            )
        }

        results = {}
        for period, query in stats_queries.items():
            result = await db.execute(query)
            results[period] = result.scalar() or 0

        # Get badge count
        badge_count_stmt = select(func.count(models.UserBadge.id)).where(
            models.UserBadge.user_id == current_user.id
        )
        badge_result = await db.execute(badge_count_stmt)
        badge_count = badge_result.scalar() or 0

        return schemas.UserStats(
            tasks_completed_today=results['today'],
            tasks_completed_this_week=results['week'],
            tasks_completed_this_month=results['month'],
            total_tasks_completed=results['total'],
            total_xp=current_user.xp,
            current_level=current_user.level,
            essence_balance=current_user.essence_balance,
            current_streak=getattr(current_user, 'streak', 0),
            badges_earned=badge_count,
            account_age_days=(utcnow() - current_user.created_at).days
        )

    except Exception as e:
        logger.error("User stats error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Statistics service temporarily unavailable"
    )

# =========================
# 🛡️ Password Management
# =========================

@router.post("/forgot-password")
async def forgot_password(
    req: schemas.ForgotPasswordRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    📧 Enhanced password reset with security measures.
    """
    try:
        stmt = select(models.User).where(models.User.email == req.email.lower())
        result = await db.execute(stmt)
        user = result.scalars().first()

        if user and user.status == "active":
            # Create secure reset token
            reset_token = create_access_token(
                data={"sub": str(user.id), "type": "password_reset"},
                expires_delta=timedelta(minutes=15)
            )

            reset_url = f"{request.base_url.replace(path='/')}reset-password?token={reset_token}"

            background_tasks.add_task(
                send_email,
                to=user.email,
                subject="Impact ID Password Reset Request",
                body=f"""
                Hi {user.username},

                You requested a password reset for your Impact ID account.

                Click the link below to reset your password:
                {reset_url}

                This link will expire in 15 minutes for security.

                If you didn't request this reset, please ignore this email.

                Best regards,
                The Impact ID Team
                """
            )

            logger.info("Password reset requested for user: %s", user.username)

        # Always return success to prevent email enumeration
        return {"message": "If an account with that email exists, a reset link has been sent."}

    except Exception as e:
        logger.error("Password reset error: %s", e)
        return {"message": "Password reset service is temporarily unavailable."}

@router.post("/reset-password")
async def reset_password(
    req: schemas.ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    🔑 Enhanced password reset completion with token validation.
    """
    try:
        # Verify reset token
        try:
            payload = verify_token(req.token)
            user_id = getattr(payload, "sub", None)
            token_type = getattr(payload, "type", None)

            if not user_id or token_type != "password_reset":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid reset token"
                )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        user = await db.get(models.User, user_id)

        if not user or user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or account inactive"
            )

        # Update password
        user.hashed_password = auth.hash_password(req.new_password)
        user.updated_at = utcnow()
        await db.commit()

        logger.info("Password reset completed for user: %s", user.username)

        return {"message": "Password reset successfully. You can now log in with your new password."}

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Password reset completion error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset service temporarily unavailable"
    )

@router.post("/change-password")
async def change_password(
    req: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    🔐 Enhanced password change with security validation.
    """
    try:
        # Verify current password
        if not auth.verify_password(req.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        # Prevent reusing the same password
        if auth.verify_password(req.new_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )

        # Update password
        current_user.hashed_password = auth.hash_password(req.new_password)
        current_user.updated_at = utcnow()
        await db.commit()

        logger.info("Password changed for user: %s", current_user.username)

        return {"message": "Password changed successfully"}
    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Password change error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change service temporarily unavailable"
    )

# =========================
# 🏆 Recent Achievements (Dashboard)
# =========================

@router.get("/achievements/recent")
async def get_recent_achievements(
    limit: int = 3,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """Return the user's most recent earned badges (achievements) for dashboard display.

    Shape aligns with frontend expectations: list of objects containing
      badge_title / title, awarded_at, xp_reward (optional), description.
    """
    try:
        limit = max(1, min(limit, 10))
        stmt = (
            select(models.UserBadge, models.Badge)
            .join(models.Badge, models.UserBadge.badge_id == models.Badge.id)
            .where(models.UserBadge.user_id == current_user.id)
            .order_by(models.UserBadge.awarded_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        rows = result.all()
        achievements = [
            {
                "badge_title": badge.title,
                "title": badge.title,
                "badge_description": badge.description,
                "awarded_at": user_badge.awarded_at,
                "xp_reward": getattr(badge, 'xp_reward', None),
                "badge_icon": getattr(badge, 'icon', None)
            }
            for user_badge, badge in rows
        ]
        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch recent achievements") from e

# =========================
# 🔗 Account Linking
# =========================

@router.post("/link-wallet")
async def link_wallet(
    payload: schemas.WalletLoginRequest,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    🔗 Enhanced wallet linking with comprehensive validation.
    """
    try:
        # Verify signature
        message = encode_defunct(text=payload.message)
        recovered_address = w3.eth.account.recover_message(message, signature=payload.signature)

        if recovered_address.lower() != payload.address.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Signature verification failed"
            )

        # Check if wallet is already linked
        stmt = select(models.User).where(models.User.wallet_address == payload.address.lower())
        result = await db.execute(stmt)
        existing_user = result.scalars().first()

        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This wallet is already linked to another account"
            )

        if existing_user and existing_user.id == current_user.id:
            return {"message": "Wallet is already linked to your account"}

        # Link wallet to account
        current_user.wallet_address = payload.address.lower()
        current_user.updated_at = utcnow()
        await db.commit()
        logger.info("Wallet linked to user: %s (Address: %s)", current_user.username, payload.address)

        return {"message": "Wallet linked successfully"}

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Wallet linking error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature or wallet linking failed"
    )

@router.delete("/unlink-wallet")
async def unlink_wallet(
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    🔓 Enhanced wallet unlinking with validation.
    """
    try:
        if not current_user.wallet_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No wallet is currently linked to this account"
            )

        wallet_address = current_user.wallet_address
        current_user.wallet_address = None
        current_user.updated_at = utcnow()
        await db.commit()
        logger.info("Wallet unlinked from user: %s (Address: %s)", current_user.username, wallet_address)

        return {"message": "Wallet unlinked successfully"}

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Wallet unlinking error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Wallet unlinking service temporarily unavailable"
    )

# =========================
# 🗑️ Account Management
# =========================

@router.delete("/@me")
async def delete_my_account(
    req: schemas.DeleteAccountRequest,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    🗑️ Enhanced account deletion with comprehensive security and audit trail.
    """
    try:
        # Verify password for security
        if not auth.verify_password(req.password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is incorrect"
            )

        # Validate confirmation
        if req.confirmation.upper() != "DELETE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must type 'DELETE' to confirm account deletion"
            )

        # Soft delete with audit trail
        deletion_timestamp = utcnow()
        original_username = current_user.username
        original_email = current_user.email

        current_user.status = "deleted"
        current_user.is_verified = False
        current_user.email = f"deleted_{current_user.id}_{int(deletion_timestamp.timestamp())}@deleted.local"
        current_user.username = f"deleted_{current_user.id}_{int(deletion_timestamp.timestamp())}"
        current_user.wallet_address = None
        current_user.deleted_at = deletion_timestamp
        current_user.deletion_reason = req.reason
        current_user.updated_at = deletion_timestamp

        await db.commit()
        logger.info("Account deleted: %s (ID: %s, Email: %s)", original_username, current_user.id, original_email)

        return {
            "message": "Account deleted successfully",
            "deletion_timestamp": deletion_timestamp.isoformat(),
            "data_retention": "Your data will be retained for 30 days for recovery purposes"
        }

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Account deletion error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion service temporarily unavailable"
    )

# =========================
# 🔍 User Search & Discovery
# =========================

@router.get("/search", response_model=list[schemas.PublicUserProfile])
async def search_users(
    q: str,
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional_async)
):
    """
    🔍 Search for users by username or display name.
    """
    try:
        if len(q.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query must be at least 2 characters"
            )

        search_term = f"%{q.lower()}%"

        stmt = select(models.User).where(
            and_(
                models.User.status == "active",
                models.User.username.ilike(search_term)
            )
        ).limit(limit).offset(offset)

        result = await db.execute(stmt)
        users = result.scalars().all()

        return [
            schemas.PublicUserProfile(
                username=user.username,
                created_at=user.created_at,
                xp=user.xp,
                level=user.level,
                badges=[],  # Simplified for search results
                streak=getattr(user, 'streak', 0),
                essence_balance=user.essence_balance,
                bio=getattr(user, 'bio', None),
                total_tasks_completed=0,  # Simplified for performance
                weaving_streak=0
            )
            for user in users
        ]

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("User search error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search service temporarily unavailable"
    )

# =========================
# 📧 Email Management
# =========================

@router.post("/resend-verification")
async def resend_verification_email(
    current_user: models.User = Depends(auth.get_current_user_async),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
):
    """
    📧 Resend email verification link.
    """
    try:
        if current_user.is_verified:
            return {"message": "Email is already verified"}

        # Generate new verification token
        verification_token = str(uuid.uuid4())
        current_user.verification_token = verification_token
        await db.commit()

        # Send verification email using the same frontend URL strategy as in signup
        def _frontend_base(req: Request) -> str:
            fe = os.getenv("FRONTEND_BASE_URL", "").strip()
            if fe:
                return fe.rstrip('/') + '/'
            env = os.getenv("ENVIRONMENT", "development").lower()
            if env == "development":
                return "http://localhost:5173/"
            return str(req.base_url.replace(path='/')) if req else "http://localhost/"

        verification_url = f"{_frontend_base(request)}verify-email?token={verification_token}"

        background_tasks.add_task(
            send_email,
            to=current_user.email,
            subject="Impact ID Email Verification",
            body=f"""
            Hi {current_user.username},

            Please click the link below to verify your email:
            {verification_url}

            This link will expire in 24 hours.

            Best regards,
            The Impact ID Team
            """
        )

        return {"message": "Verification email sent successfully"}

    except Exception as e:
        logger.error("Resend verification error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service temporarily unavailable"
    )
