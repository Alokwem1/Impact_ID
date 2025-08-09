"""
Leaderboard module for Impact ID application.
"""


from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import func, and_, desc, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app import models, schemas, auth
from app.database import get_db


router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

# =========================
# 🏆 Leaderboard Types
# =========================

class LeaderboardType(str, Enum):
    """LeaderboardType class for Impact ID application."""
    XP = "xp"
    TASKS = "tasks"
    STREAK = "streak"
    ESSENCE = "essence"
    WEAVING = "weaving"
    BADGES = "badges"

class TimePeriod(str, Enum):
    """TimePeriod class for Impact ID application."""
    ALL_TIME = "all_time"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

# =========================
# 🎯 Main Leaderboard Endpoints
# =========================

@router.get("/", response_model=List[schemas.LeaderboardEntry])
async def get_leaderboard(
    leaderboard_type: LeaderboardType = Query(LeaderboardType.XP, description="Type of leaderboard to retrieve"),
    period: TimePeriod = Query(TimePeriod.ALL_TIME, description="Time period for rankings"),
    limit: int = Query(10, ge=1, le=100, description="Number of top users to return"),
    offset: int = Query(0, ge=0, description="Number of users to skip"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_async)
):
    """
    🏆 Gets leaderboard rankings with multiple metrics and time periods.
    Enhanced with user positioning and comprehensive statistics.
    """
    # Calculate date filters for time periods
    now = datetime.utcnow()
    date_filter = None

    if period == TimePeriod.DAILY:
        date_filter = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == TimePeriod.WEEKLY:
        date_filter = now - timedelta(days=7)
    elif period == TimePeriod.MONTHLY:
        date_filter = now - timedelta(days=30)
    elif period == TimePeriod.YEARLY:
        date_filter = now - timedelta(days=365)

    # Build leaderboard based on type
    if leaderboard_type == LeaderboardType.XP:
        leaderboard = await _get_xp_leaderboard(db, date_filter, limit, offset)
    elif leaderboard_type == LeaderboardType.TASKS:
        leaderboard = await _get_tasks_leaderboard(db, date_filter, limit, offset)
    elif leaderboard_type == LeaderboardType.STREAK:
        leaderboard = await _get_streak_leaderboard(db, limit, offset)
    elif leaderboard_type == LeaderboardType.ESSENCE:
        leaderboard = await _get_essence_leaderboard(db, limit, offset)
    elif leaderboard_type == LeaderboardType.WEAVING:
        leaderboard = await _get_weaving_leaderboard(db, date_filter, limit, offset)
    elif leaderboard_type == LeaderboardType.BADGES:
        leaderboard = await _get_badges_leaderboard(db, limit, offset)
    else:
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e

    # Add current user's position if authenticated
    if current_user:
        user_position = await _get_user_position(db, current_user.id, leaderboard_type, date_filter)
        # Add user position to response metadata (you might want to include this in a wrapper)
        for entry in leaderboard:
            if entry.user_id == current_user.id:
                entry.is_current_user = True
                break

    return leaderboard

@router.get("/my-position", response_model=schemas.UserLeaderboardPosition)
async def get_my_position(
    leaderboard_type: LeaderboardType = Query(LeaderboardType.XP),
    period: TimePeriod = Query(TimePeriod.ALL_TIME),
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """
    📊 Gets the current user's position across all leaderboard types.
    """
    now = datetime.utcnow()
    date_filter = None

    if period == TimePeriod.DAILY:
        date_filter = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == TimePeriod.WEEKLY:
        date_filter = now - timedelta(days=7)
    elif period == TimePeriod.MONTHLY:
        date_filter = now - timedelta(days=30)
    elif period == TimePeriod.YEARLY:
        date_filter = now - timedelta(days=365)

    position = await _get_user_position(db, current_user.id, leaderboard_type, date_filter)

    if position is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in leaderboard"
        )

    return schemas.UserLeaderboardPosition(
        leaderboard_type=leaderboard_type,
        period=period,
        position=position,
        total_users=await _get_total_users_count(db, leaderboard_type, date_filter)
    )

@router.get("/stats", response_model=schemas.LeaderboardStats)
async def get_leaderboard_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    📈 Gets comprehensive leaderboard statistics and platform metrics.
    """
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)

    # Total users
    total_users_stmt = select(func.count(models.User.id)).where(models.User.status == "active")
    total_users_result = await db.execute(total_users_stmt)
    total_users = total_users_result.scalar()

    # Active users today
    active_today_stmt = select(func.count(models.User.id.distinct())).select_from(
        models.TaskSubmission
    ).join(models.User).where(
        and_(
            models.TaskSubmission.submitted_at >= today,
            models.User.status == "active"
        )
    )
    active_today_result = await db.execute(active_today_stmt)
    active_today = active_today_result.scalar() or 0

    # Top performer this week
    top_xp_stmt = select(models.User).order_by(desc(models.User.xp)).limit(1)
    top_xp_result = await db.execute(top_xp_stmt)
    top_performer = top_xp_result.scalars().first()

    # Average XP
    avg_xp_stmt = select(func.avg(models.User.xp)).where(models.User.status == "active")
    avg_xp_result = await db.execute(avg_xp_stmt)
    avg_xp = avg_xp_result.scalar() or 0

    return schemas.LeaderboardStats(
        total_users=total_users,
        active_users_today=active_today,
        top_performer=top_performer.username if top_performer else None,
        top_performer_xp=top_performer.xp if top_performer else 0,
        average_xp=round(float(avg_xp), 2),
        total_tasks_completed=await _get_total_tasks_completed(db),
        total_essence_earned=await _get_total_essence_earned(db)
    )

@router.get("/recent-achievements", response_model=List[schemas.RecentAchievement])
async def get_recent_achievements(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    🏅 Gets recent badge awards and achievements across the platform.
    """
    stmt = select(models.UserBadge).options(
        joinedload(models.UserBadge.user),
        joinedload(models.UserBadge.badge)
    ).order_by(desc(models.UserBadge.awarded_at)).limit(limit)

    result = await db.execute(stmt)
    achievements = result.scalars().all()

    return [
        schemas.RecentAchievement(
            username=achievement.user.username,
            badge_title=achievement.badge.title,
            badge_description=achievement.badge.description,
            awarded_at=achievement.awarded_at,
            badge_icon=getattr(achievement.badge, 'icon', None)
        )
        for achievement in achievements
    ]

# =========================
# 🔧 Helper Functions
# =========================

async def _get_xp_leaderboard(
    db: AsyncSession,
    date_filter: Optional[datetime],
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get XP-based leaderboard with optional time filtering."""
    if date_filter:
        # For time-filtered XP, sum XP from task completions in period
        stmt = select(
            models.User.id,
            models.User.username,
            func.sum(models.Task.xp_reward).label('period_xp'),
            func.count(models.TaskSubmission.id).label('tasks_completed')
        ).select_from(
            models.User
        ).join(
            models.TaskSubmission, models.User.id == models.TaskSubmission.user_id
        ).join(
            models.Task, models.TaskSubmission.task_id == models.Task.id
        ).where(
            and_(
                models.TaskSubmission.status == "approved",
                models.TaskSubmission.submitted_at >= date_filter,
                models.User.status == "active"
            )
        ).group_by(
            models.User.id, models.User.username
        ).order_by(
            desc('period_xp')
        ).offset(offset).limit(limit)

        result = await db.execute(stmt)
        rows = result.all()

        return [
            schemas.LeaderboardEntry(
                rank=idx + offset + 1,
                user_id=row.id,
                username=row.username,
                score=int(row.period_xp or 0),
                metric="XP (Period)",
                additional_data={
                    "tasks_completed": row.tasks_completed,
                    "avg_xp_per_task": round((row.period_xp or 0) / max(row.tasks_completed, 1), 1)
                }
            )
            for idx, row in enumerate(rows)
        ]
    else:
        # All-time XP leaderboard
        stmt = select(models.User).where(
            models.User.status == "active"
        ).order_by(desc(models.User.xp)).offset(offset).limit(limit)

        result = await db.execute(stmt)
        users = result.scalars().all()

        return [
            schemas.LeaderboardEntry(
                rank=idx + offset + 1,
                user_id=user.id,
                username=user.username,
                score=user.xp,
                metric="Total XP",
                additional_data={
                    "level": user.level,
                    "streak": getattr(user, 'streak', 0),
                    "essence_balance": user.essence_balance
                }
            )
            for idx, user in enumerate(users)
        ]

async def _get_tasks_leaderboard(
    db: AsyncSession,
    date_filter: Optional[datetime],
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get task completion leaderboard."""
    stmt = select(
        models.User.id,
        models.User.username,
        func.count(models.TaskSubmission.id).label('task_count')
    ).select_from(models.User).join(
        models.TaskSubmission, models.User.id == models.TaskSubmission.user_id
    ).where(
        and_(
            models.TaskSubmission.status == "approved",
            models.User.status == "active",
            models.TaskSubmission.submitted_at >= date_filter if date_filter else True
        )
    ).group_by(
        models.User.id, models.User.username
    ).order_by(
        desc('task_count')
    ).offset(offset).limit(limit)

    result = await db.execute(stmt)
    rows = result.all()

    return [
        schemas.LeaderboardEntry(
            rank=idx + offset + 1,
            user_id=row.id,
            username=row.username,
            score=row.task_count,
            metric="Tasks Completed",
            additional_data={}
        )
        for idx, row in enumerate(rows)
    ]

async def _get_streak_leaderboard(
    db: AsyncSession,
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get current streak leaderboard."""
    stmt = select(models.User).where(
        and_(
            models.User.status == "active",
            models.User.streak > 0
        )
    ).order_by(desc(models.User.streak)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    users = result.scalars().all()

    return [
        schemas.LeaderboardEntry(
            rank=idx + offset + 1,
            user_id=user.id,
            username=user.username,
            score=user.streak,
            metric="Current Streak",
            additional_data={
                "last_task_date": user.last_task_date.isoformat() if user.last_task_date else None
            }
        )
        for idx, user in enumerate(users)
    ]

async def _get_essence_leaderboard(
    db: AsyncSession,
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get essence balance leaderboard."""
    stmt = select(models.User).where(
        and_(
            models.User.status == "active",
            models.User.essence_balance > 0
        )
    ).order_by(desc(models.User.essence_balance)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    users = result.scalars().all()

    return [
        schemas.LeaderboardEntry(
            rank=idx + offset + 1,
            user_id=user.id,
            username=user.username,
            score=user.essence_balance,
            metric="Essence Balance",
            additional_data={}
        )
        for idx, user in enumerate(users)
    ]

async def _get_weaving_leaderboard(
    db: AsyncSession,
    date_filter: Optional[datetime],
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get weaving activity leaderboard."""
    stmt = select(
        models.User.id,
        models.User.username,
        func.count(models.TaskSubmission.id).label('weave_count')
    ).select_from(models.User).join(
        models.TaskSubmission, models.User.id == models.TaskSubmission.user_id
    ).where(
        and_(
            models.User.status == "active",
            models.TaskSubmission.created_at >= date_filter if date_filter else True
        )
    ).group_by(
        models.User.id, models.User.username
    ).order_by(
        desc('weave_count')
    ).offset(offset).limit(limit)

    result = await db.execute(stmt)
    rows = result.all()

    return [
        schemas.LeaderboardEntry(
            rank=idx + offset + 1,
            user_id=row.id,
            username=row.username,
            score=row.weave_count,
            metric="Threads Woven",
            additional_data={}
        )
        for idx, row in enumerate(rows)
    ]

async def _get_badges_leaderboard(
    db: AsyncSession,
    limit: int,
    offset: int
) -> List[schemas.LeaderboardEntry]:
    """Get badge count leaderboard."""
    stmt = select(
        models.User.id,
        models.User.username,
        func.count(models.UserBadge.id).label('badge_count')
    ).select_from(models.User).join(
        models.UserBadge, models.User.id == models.UserBadge.user_id
    ).where(
        models.User.status == "active"
    ).group_by(
        models.User.id, models.User.username
    ).order_by(
        desc('badge_count')
    ).offset(offset).limit(limit)

    result = await db.execute(stmt)
    rows = result.all()

    return [
        schemas.LeaderboardEntry(
            rank=idx + offset + 1,
            user_id=row.id,
            username=row.username,
            score=row.badge_count,
            metric="Badges Earned",
            additional_data={}
        )
        for idx, row in enumerate(rows)
    ]

async def _get_user_position(
    db: AsyncSession,
    user_id: int,
    leaderboard_type: LeaderboardType,
    date_filter: Optional[datetime]
) -> Optional[int]:
    """Get a specific user's position in the leaderboard."""
    # This would implement position calculation logic
    # For now, return None (you can implement based on your needs)
    return None

async def _get_total_users_count(
    db: AsyncSession,
    leaderboard_type: LeaderboardType,
    date_filter: Optional[datetime]
) -> int:
    """Get total number of users in leaderboard."""
    stmt = select(func.count(models.User.id)).where(models.User.status == "active")
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _get_total_tasks_completed(db: AsyncSession) -> int:
    """Get total tasks completed across platform."""
    stmt = select(func.count(models.TaskSubmission.id)).where(models.TaskSubmission.status == "approved")
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _get_total_essence_earned(db: AsyncSession) -> int:
    """Get total essence earned across platform."""
    stmt = select(func.sum(models.User.essence_balance))
    result = await db.execute(stmt)
    return int(result.scalar() or 0)
