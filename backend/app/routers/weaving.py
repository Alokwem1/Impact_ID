"""
Weaving module for Impact ID application.
"""


from datetime import datetime, timedelta, timezone
from typing import Optional
import random

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import func, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app import models, schemas, auth
from app.database import get_db


router = APIRouter(prefix="/weaving", tags=["Weaving"])

# =========================
# 🎮 Configuration
# =========================
WEAVE_COOLDOWN_HOURS = 1
ESSENCE_REWARD_MIN = 5
ESSENCE_REWARD_MAX = 15
MAX_THREADS_PER_USER_PER_DAY = 10
QUALITY_BONUS_MULTIPLIER = 1.5

# =========================
# 🔍 Helper Functions
# =========================

def _utcnow() -> datetime:
    """Return a naive UTC datetime without using utcnow()."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def _check_weave_eligibility(user: models.User) -> tuple[bool, int]:
    """Check if user can weave and return cooldown info."""
    if not user.last_weave_timestamp:
        return True, 0

    next_weave_time = user.last_weave_timestamp + timedelta(hours=WEAVE_COOLDOWN_HOURS)
    if _utcnow() < next_weave_time:
        time_remaining = (next_weave_time - _utcnow()).total_seconds()
        return False, int(time_remaining)

    return True, 0

async def _get_daily_weave_count(user: models.User, db: AsyncSession) -> int:
    """Get user's weave count for today."""
    today_start = _utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Count WeaveSubmission rows for the current day
    stmt = select(func.count(models.WeaveSubmission.id)).where(
        and_(
            models.WeaveSubmission.user_id == user.id,
            models.WeaveSubmission.created_at >= today_start
        )
    )
    result = await db.execute(stmt)
    return result.scalar() or 0

def _calculate_essence_reward(submission: schemas.WeaveSubmission, thread: models.ImpactThread) -> int:
    """Calculate essence reward based on submission quality and thread complexity."""
    base_reward = random.randint(ESSENCE_REWARD_MIN, ESSENCE_REWARD_MAX)

    # Quality bonus based on submission length and detail
    quality_score = min(len(submission.reasoning) / 100, 1.0)  # 0-1 score
    if quality_score > 0.7:  # High quality submission
        base_reward = int(base_reward * QUALITY_BONUS_MULTIPLIER)

    # Thread complexity bonus (if your thread model has complexity)
    if hasattr(thread, 'complexity') and thread.complexity == 'high':
        base_reward += 2

    return max(base_reward, ESSENCE_REWARD_MIN)

# =========================
# 🌟 API Endpoints
# =========================

@router.get("/status", response_model=schemas.WeavingStatus)
async def get_weaving_status(
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    Checks the user's readiness to weave and their current essence balance.
    Includes daily limit tracking and enhanced status information.
    """
    is_ready, time_remaining_seconds = _check_weave_eligibility(current_user)
    daily_weaves = await _get_daily_weave_count(current_user, db)

    # Check daily limit
    if daily_weaves >= MAX_THREADS_PER_USER_PER_DAY:
        is_ready = False

    # Get available threads count
    stmt = select(func.count(models.ImpactThread.id)).where(
        models.ImpactThread.status == 'raw'
    )
    result = await db.execute(stmt)
    threads_available = result.scalar() or 0

    # Compute next bonus multiplier (placeholder logic: no bonus by default)
    next_bonus_multiplier = 1.0

    return schemas.WeavingStatus(
        is_ready=is_ready,
        time_remaining_seconds=time_remaining_seconds,
        essence_balance=current_user.essence_balance,
        threads_available=threads_available,
        weaving_streak=getattr(current_user, 'weaving_streak', 0),
        daily_weaving_limit=MAX_THREADS_PER_USER_PER_DAY,
        daily_weavings_used=daily_weaves,
        next_bonus_multiplier=next_bonus_multiplier,
    )

@router.get("/available-threads", response_model=list[schemas.ImpactThreadPublic])
async def get_available_threads(
    limit: int = 5,
    category: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a list of available threads for weaving with optional filtering.
    """
    # Check eligibility first
    is_ready, _ = _check_weave_eligibility(current_user)
    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Not ready to weave yet. Check your cooldown status."
        )

    # Build query
    stmt = select(models.ImpactThread).where(models.ImpactThread.status == 'raw')

    if category:
        stmt = stmt.where(models.ImpactThread.category == category)

    # Use a more efficient random selection for large datasets
    stmt = stmt.order_by(func.random()).limit(limit)

    result = await db.execute(stmt)
    threads = result.scalars().all()

    if not threads:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No impact threads available. The harvester may need to run."
        )

    return threads

@router.post("/claim/{thread_id}", response_model=schemas.ImpactThreadPublic)
async def claim_thread(
    thread_id: int,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    Claims a specific thread for weaving with enhanced validation.
    """
    # Check cooldown and daily limits
    is_ready, _ = _check_weave_eligibility(current_user)
    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Not ready to weave yet. Please wait for the cooldown."
        )

    daily_weaves = await _get_daily_weave_count(current_user, db)
    if daily_weaves >= MAX_THREADS_PER_USER_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily weaving limit reached ({MAX_THREADS_PER_USER_PER_DAY}). Try again tomorrow."
        )

    # Get and validate thread
    thread = await db.get(models.ImpactThread, thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found."
        )

    if thread.status != 'raw':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This thread is no longer available for weaving."
        )

    # Mark thread as claimed (optional - you might want to add a 'claimed' status)
    # thread.status = 'claimed'
    # thread.claimed_by = current_user.id
    # thread.claimed_at = utcnow()
    # await db.commit()

    return thread

@router.post("/submit/{thread_id}", response_model=schemas.WeaveResult)
async def submit_weave(
    thread_id: int,
    submission: schemas.WeaveSubmission,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """
    Submits the result of a weave with enhanced validation and rewards.
    """
    # Re-verify eligibility at submission time (security)
    is_ready, _ = _check_weave_eligibility(current_user)
    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Cooldown active. Cannot submit yet."
        )

    # Get and validate thread
    thread = await _get_and_lock_thread(db, thread_id)
    
    # Validate submission
    _validate_weave_submission(submission)

    try:
        # Process the weave submission
        result = await _process_weave_submission(
            thread, submission, current_user, background_tasks, db
        )
        await db.commit()
        return result

    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This thread was just claimed by another user. Please try a different thread."
    )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your weave."
    )


async def _get_and_lock_thread(db: AsyncSession, thread_id: int) -> models.ImpactThread:
    """Get thread with row-level locking to prevent race conditions."""
    # Use FOR UPDATE only if the DB supports it (SQLite does not)
    use_for_update = True
    try:
        if getattr(getattr(db, "bind", None), "dialect", None) and db.bind.dialect.name == "sqlite":
            use_for_update = False
    except Exception:
        use_for_update = False

    stmt = select(models.ImpactThread).where(models.ImpactThread.id == thread_id)
    if use_for_update:
        stmt = stmt.with_for_update()

    result = await db.execute(stmt)
    thread = result.scalars().first()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found."
        )

    if thread.status != 'raw':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This thread has already been woven or is no longer available."
        )
    
    return thread


def _validate_weave_submission(submission: schemas.WeaveSubmission) -> None:
    """Validate the weave submission data."""
    if not submission.category or not submission.reasoning:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category and reasoning are required."
        )

    if len(submission.reasoning.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reasoning must be at least 20 characters long."
        )

    # Valid categories (you might want to move this to config)
    valid_categories = ['Environment', 'Social Good', 'Technology', 'Education', 'Health', 'Other']
    if submission.category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )


async def _process_weave_submission(
    thread: models.ImpactThread,
    submission: schemas.WeaveSubmission,
    current_user: models.User,
    background_tasks: BackgroundTasks,
    db: AsyncSession
) -> schemas.WeaveResult:
    """Process the weave submission and update records."""
    # Get the user's daily weave count before submission
    daily_weaves = await _get_daily_weave_count(current_user, db)

    # Create weave submission record (use WeaveSubmission model)
    weave_submission = models.WeaveSubmission(
        user_id=current_user.id,
        thread_id=thread.id,
        category=submission.category,
        insight=submission.reasoning,
        created_at=_utcnow(),
    )
    db.add(weave_submission)

    # Update thread status and stats
    thread.status = 'woven'
    thread.last_woven_at = _utcnow()
    thread.weaving_count = (thread.weaving_count or 0) + 1

    # Calculate and apply rewards
    essence_earned = _calculate_essence_reward(submission, thread)
    weave_submission.essence_earned = essence_earned
    
    # Update user stats
    _update_user_weaving_stats(current_user, essence_earned)

    # Background task for achievements/notifications
    background_tasks.add_task(
        _check_weaving_achievements,
        current_user.id,
        daily_weaves + 1
    )

    return schemas.WeaveResult(
        essence_earned=essence_earned,
        xp_earned=essence_earned // 2,
        new_essence_balance=current_user.essence_balance,
        new_xp=current_user.xp,
        streak=getattr(current_user, 'weaving_streak', 1),
        quality_bonus=essence_earned > ESSENCE_REWARD_MAX
    )


def _update_user_weaving_stats(user: models.User, essence_earned: int) -> None:
    """Update user's weaving-related statistics."""
    user.essence_balance += essence_earned
    user.last_weave_timestamp = _utcnow()

    # Update weaving streak
    if hasattr(user, 'weaving_streak'):
        user.weaving_streak += 1
    # Increment total threads woven if tracked
    if hasattr(user, 'total_threads_woven'):
        user.total_threads_woven = (user.total_threads_woven or 0) + 1

    # XP bonus for weaving
    xp_earned = essence_earned // 2
    user.xp += xp_earned

@router.get("/leaderboard", response_model=list[schemas.WeavingLeaderboardEntry])
async def get_weaving_leaderboard(
    period: str = "weekly",  # daily, weekly, monthly, all-time
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    Get weaving leaderboard for specified time period.
    """
    # Calculate date filter
    now = _utcnow()
    if period == "daily":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    else:  # all-time
        start_date = datetime.min

    # Query leaderboard using WeaveSubmission
    stmt = select(
        models.User.id,
        models.User.username,
        func.count(models.WeaveSubmission.id).label('weave_count'),
        func.sum(models.WeaveSubmission.essence_earned).label('total_essence'),
    ).join(
        models.WeaveSubmission, models.User.id == models.WeaveSubmission.user_id
    ).where(
        models.WeaveSubmission.created_at >= start_date
    ).group_by(
        models.User.id, models.User.username
    ).order_by(
        func.count(models.WeaveSubmission.id).desc()
    ).limit(limit)

    result = await db.execute(stmt)
    return [
        schemas.WeavingLeaderboardEntry(
            username=row.username,
            weave_count=row.weave_count,
            total_essence=row.total_essence or 0,
            rank=idx + 1
        )
        for idx, row in enumerate(result.all())
    ]

# =========================
# 🎖️ Background Tasks
# =========================

def _check_weaving_achievements(user_id: int, daily_weaves: int):
    """Check and award weaving-related achievements."""
    # Implementation for checking achievements
    # This would typically check for milestones like:
    # - First weave
    # - 10 weaves in a day
    # - 7-day streak
    # - 100 total weaves
    pass

# =========================
# 📈 Analytics Endpoint (Used by Frontend WeavingLoomPage)
# =========================

@router.get("/analytics", response_model=schemas.WeavingAnalyticsResponse)
async def get_weaving_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Return lightweight weaving analytics consumed by the frontend.

    Provides:
      total_threads_woven: Total woven threads (all users)
      user_threads_woven: Threads woven by current user
      total_essence_generated: Sum of essence_earned in WeaveSubmission
      recent_activity: Last 5 weave submissions (username, essence)
      category_distribution: [{category, count}]
      leaderboard_preview: Top 5 by weave_count
    """
    try:
        # Total woven threads (threads whose status == 'woven')
        total_woven_stmt = select(func.count(models.ImpactThread.id)).where(models.ImpactThread.status == 'woven')
        total_woven = (await db.execute(total_woven_stmt)).scalar() or 0

        # User woven count (from WeaveSubmission)
        user_woven_stmt = select(func.count(models.WeaveSubmission.id)).where(models.WeaveSubmission.user_id == current_user.id)
        user_woven = (await db.execute(user_woven_stmt)).scalar() or 0

        # Total essence generated
        total_essence_stmt = select(func.sum(models.WeaveSubmission.essence_earned))
        total_essence = (await db.execute(total_essence_stmt)).scalar() or 0

        # Recent activity (last 5 submissions)
        recent_stmt = (
            select(
                models.WeaveSubmission.id,
                models.WeaveSubmission.created_at,
                models.WeaveSubmission.essence_earned,
                models.User.username,
                models.WeaveSubmission.category,
            )
            .join(models.User, models.WeaveSubmission.user_id == models.User.id)
            .order_by(models.WeaveSubmission.created_at.desc())
            .limit(5)
        )
        recent_rows = (await db.execute(recent_stmt)).all()
        recent_activity = [
            schemas.WeavingRecentActivity(
                id=r.id,
                username=r.username,
                essence_earned=r.essence_earned or 0,
                category=r.category,
                created_at=r.created_at,
            )
            for r in recent_rows
        ]

        # Category distribution
        category_stmt = select(
            models.WeaveSubmission.category,
            func.count(models.WeaveSubmission.id)
        ).group_by(models.WeaveSubmission.category)
        category_rows = (await db.execute(category_stmt)).all()
        category_distribution = [
            schemas.WeavingCategoryDistributionItem(category=row[0] or "Unknown", count=row[1]) for row in category_rows
        ]

        # Leaderboard preview (top 5 by weave_count)
        leaderboard_stmt = (
            select(
                models.User.username,
                func.count(models.WeaveSubmission.id).label('weave_count'),
                func.sum(models.WeaveSubmission.essence_earned).label('total_essence'),
            )
            .join(models.WeaveSubmission, models.User.id == models.WeaveSubmission.user_id)
            .group_by(models.User.id, models.User.username)
            .order_by(func.count(models.WeaveSubmission.id).desc())
            .limit(5)
        )
        leaderboard_rows = (await db.execute(leaderboard_stmt)).all()
        leaderboard_preview = [
            schemas.WeavingLeaderboardPreviewEntry(
                username=row.username,
                weave_count=row.weave_count,
                total_essence=row.total_essence or 0,
                rank=idx + 1,
            )
            for idx, row in enumerate(leaderboard_rows)
        ]

        return schemas.WeavingAnalyticsResponse(
            total_threads_woven=total_woven,
            user_threads_woven=user_woven,
            total_essence_generated=total_essence,
            recent_activity=recent_activity,
            category_distribution=category_distribution,
            leaderboard_preview=leaderboard_preview,
        )
    except Exception as e:
        # Fail soft – frontend treats null / absence gracefully
        raise HTTPException(status_code=500, detail="Failed to compute weaving analytics") from e
