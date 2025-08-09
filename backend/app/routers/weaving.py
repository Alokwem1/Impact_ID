"""
Weaving module for Impact ID application.
"""


from datetime import datetime, timedelta
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

async def _check_weave_eligibility(user: models.User, db: AsyncSession) -> tuple[bool, int]:
    """Check if user can weave and return cooldown info."""
    if not user.last_weave_timestamp:
        return True, 0

    next_weave_time = user.last_weave_timestamp + timedelta(hours=WEAVE_COOLDOWN_HOURS)
    if datetime.utcnow() < next_weave_time:
        time_remaining = (next_weave_time - datetime.utcnow()).total_seconds()
        return False, int(time_remaining)

    return True, 0

async def _get_daily_weave_count(user: models.User, db: AsyncSession) -> int:
    """Get user's weave count for today."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    stmt = select(func.count(models.TaskSubmission.id)).where(
        and_(
            models.TaskSubmission.user_id == user.id,
            models.TaskSubmission.created_at >= today_start
        )
    )
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _calculate_essence_reward(submission: schemas.WeaveSubmission, thread: models.ImpactThread) -> int:
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
    is_ready, time_remaining_seconds = await _check_weave_eligibility(current_user, db)
    daily_weaves = await _get_daily_weave_count(current_user, db)

    # Check daily limit
    if daily_weaves >= MAX_THREADS_PER_USER_PER_DAY:
        is_ready = False

    # Get available threads count
    stmt = select(func.count(models.ImpactThread.id)).where(
        models.ImpactThread.status == 'raw'
    )
    result = await db.execute(stmt)
    available_threads = result.scalar() or 0

    return schemas.WeavingStatus(
        is_ready=is_ready,
        time_remaining_seconds=time_remaining_seconds,
        essence_balance=current_user.essence_balance,
        daily_weaves_completed=daily_weaves,
        daily_weaves_limit=MAX_THREADS_PER_USER_PER_DAY,
        available_threads=available_threads,
        streak=getattr(current_user, 'weaving_streak', 0)
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
    is_ready, _ = await _check_weave_eligibility(current_user, db)
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
    is_ready, _ = await _check_weave_eligibility(current_user, db)
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
    # thread.claimed_at = datetime.utcnow()
    # await db.commit()

    return thread

@router.post("/submit/{thread_id}", response_model=schemas.WeaveResult)
async def submit_weave(
    thread_id: int,
    submission: schemas.WeaveSubmission,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits the result of a weave with enhanced validation and rewards.
    """
    # Re-verify eligibility at submission time (security)
    is_ready, _ = await _check_weave_eligibility(current_user, db)
    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Cooldown active. Cannot submit yet."
        )

    # Get thread with row-level locking to prevent race conditions
    stmt = select(models.ImpactThread).where(
        models.ImpactThread.id == thread_id
    ).with_for_update()
    result = await db.execute(stmt)
    thread = result.scalars().first()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found."
        ) from e

    if thread.status != 'raw':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This thread has already been woven or is no longer available."
        )

    # Validate submission
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

    try:
        # Get the user's daily weave count before submission
        daily_weaves = await _get_daily_weave_count(current_user, db)

        # Create weave submission record
        weave_submission = models.TaskSubmission(
            user_id=current_user.id,
            thread_id=thread.id,
            category=submission.category,
            reasoning=submission.reasoning,
            created_at=datetime.utcnow()
        )
        db.add(weave_submission)

        # Update thread status
        thread.status = 'woven'
        thread.woven_by = current_user.id
        thread.woven_at = datetime.utcnow()

        # Calculate rewards
        essence_earned = await _calculate_essence_reward(submission, thread)

        # Update user stats
        current_user.essence_balance += essence_earned
        current_user.last_weave_timestamp = datetime.utcnow()

        # Update weaving streak
        if hasattr(current_user, 'weaving_streak'):
            current_user.weaving_streak += 1

        # XP bonus for weaving
        xp_earned = essence_earned // 2
        current_user.xp += xp_earned

        await db.commit()

        # Background task for achievements/notifications
        background_tasks.add_task(
            _check_weaving_achievements,
            current_user.id,
            daily_weaves + 1
        )

        return schemas.WeaveResult(
            essence_earned=essence_earned,
            xp_earned=xp_earned,
            new_essence_balance=current_user.essence_balance,
            new_xp=current_user.xp,
            streak=getattr(current_user, 'weaving_streak', 1),
            quality_bonus=essence_earned > ESSENCE_REWARD_MAX
        )

    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This thread was just claimed by another user. Please try a different thread."
        ) from e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your weave."
        ) from e

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
    now = datetime.utcnow()
    if period == "daily":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    else:  # all-time
        start_date = datetime.min

    # Query leaderboard
    stmt = select(
        models.User.id,
        models.User.username,
        func.count(models.TaskSubmission.id).label('weave_count'),
        func.sum(models.TaskSubmission.essence_earned).label('total_essence')
    ).join(
        models.TaskSubmission, models.User.id == models.TaskSubmission.user_id
    ).where(
        models.TaskSubmission.created_at >= start_date
    ).group_by(
        models.User.id, models.User.username
    ).order_by(
        func.count(models.TaskSubmission.id).desc()
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

async def _check_weaving_achievements(user_id: int, daily_weaves: int):
    """Check and award weaving-related achievements."""
    # Implementation for checking achievements
    # This would typically check for milestones like:
    # - First weave
    # - 10 weaves in a day
    # - 7-day streak
    # - 100 total weaves
    pass
