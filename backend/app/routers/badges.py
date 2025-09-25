"""
Badges module for Impact ID application.
"""


from app.utils.common import utcnow
from enum import Enum
from typing import List, Optional
import re
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy import func, and_, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload

from app import models, auth, schemas
from app.database import get_db


router = APIRouter(prefix="/badges", tags=["Badges"])
logger = logging.getLogger("app.routers.badges")

# =========================
# 🏅 Badge Configuration
# =========================

class BadgeRarity(str, Enum):
    """BadgeRarity class for Impact ID application."""
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class BadgeCategory(str, Enum):
    """BadgeCategory class for Impact ID application."""
    TASKS = "tasks"
    STREAKS = "streaks"
    XP = "xp"
    SOCIAL = "social"
    SPECIAL = "special"
    WEAVING = "weaving"
    SEASONAL = "seasonal"

# =========================
# 👑 Admin: Badge Management
# =========================

@router.post("/", response_model=schemas.BadgeOut, status_code=status.HTTP_201_CREATED)
async def create_badge(
    badge_data: schemas.BadgeCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    logger.info("Attempting to create a badge with data: %s", badge_data)
    logger.info("Current user: %s", current_user)

    # Duplicate title check
    existing_stmt = select(models.Badge).where(models.Badge.title == badge_data.title)
    existing_result = await db.execute(existing_stmt)
    if existing_result.scalars().first():
        logger.warning("Badge creation failed: Duplicate title detected.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A badge with this title already exists."
        )

    # Criteria validation
    if not _validate_badge_criteria(badge_data.criteria):
        logger.warning("Badge creation failed: Invalid criteria format.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid badge criteria format. Use: 'first_submission', 'X_tasks', 'xp_X', 'streak_X', 'weave_X'"
        )

    # Icon URL validation (schema uses icon_url)
    if badge_data.icon_url and not badge_data.icon_url.startswith(("http://", "https://", "/static/")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="icon_url must be a valid URL or static path."
        )

    logger.info("Badge creation passed validation checks.")
    # Only pass fields that exist on the ORM model
    allowed = badge_data.model_dump()
    new_badge = models.Badge(**allowed, created_at=utcnow())
    db.add(new_badge)
    try:
        await db.commit()
        await db.refresh(new_badge)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Badge creation failed due to database constraint."
    )

    logger.info("Badge successfully created.")
    # Placeholder for future retroactive awarding
    background_tasks.add_task(_retroactively_award_badge, new_badge.id)
    return new_badge

@router.put("/{badge_id}", response_model=schemas.BadgeOut)
async def update_badge(
    badge_id: int,
    badge_data: schemas.BadgeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Admin endpoint to update an existing badge."""
    badge = await db.get(models.Badge, badge_id)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")

    # Validate criteria if being updated
    if badge_data.criteria and not _validate_badge_criteria(badge_data.criteria):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid badge criteria format."
        )

    # Update fields
    for field, value in badge_data.model_dump(exclude_unset=True).items():
        setattr(badge, field, value)

    badge.updated_at = utcnow()
    await db.commit()
    await db.refresh(badge)
    return badge

@router.delete("/{badge_id}")
async def delete_badge(
    badge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Admin endpoint to soft delete a badge."""
    badge = await db.get(models.Badge, badge_id)
    if not badge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")

    # Check if any users have earned this badge
    earned_count_stmt = select(func.count(models.UserBadge.id)).where(
        models.UserBadge.badge_id == badge_id
    )
    earned_result = await db.execute(earned_count_stmt)
    earned_count = earned_result.scalar() or 0

    if earned_count > 0:
        # Soft delete - don't remove badges users have already earned
        badge.is_active = False
        badge.deleted_at = utcnow()
        await db.commit()
        return {"message": f"Badge deactivated. {earned_count} users will keep their earned badge."}
    else:
        # Hard delete if no one has earned it
        await db.delete(badge)
        await db.commit()
        return {"message": "Badge deleted successfully."}

# =========================
# 📋 Public Badge Endpoints
# =========================

@router.get("/", response_model=List[schemas.BadgeOut])
async def get_all_badges_with_user_status(
    category: Optional[BadgeCategory] = Query(None, description="Filter by badge category"),
    rarity: Optional[BadgeRarity] = Query(None, description="Filter by badge rarity"),
    earned_only: Optional[bool] = Query(None, description="Show only earned badges (requires auth)"),
    available_only: Optional[bool] = Query(None, description="Show only available badges (requires auth)"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_async)
):
    """
    Gets a list of all available badges with enhanced filtering.
    🎯 ENGAGEMENT: Includes user progress and earning status.
    """
    # Build query with filters
    stmt = select(models.Badge).where(models.Badge.is_active == True)

    if category:
        stmt = stmt.where(models.Badge.category == category)
    if rarity:
        stmt = stmt.where(models.Badge.rarity == rarity)

    stmt = stmt.order_by(models.Badge.display_order, models.Badge.created_at)

    result = await db.execute(stmt)
    all_badges = result.scalars().all()

    # Create base list
    badge_out_list = [schemas.BadgeOut.model_validate(b) for b in all_badges]

    if current_user:
        # Get user's earned badges
        earned_stmt = select(models.UserBadge).where(
            models.UserBadge.user_id == current_user.id
        )
        earned_result = await db.execute(earned_stmt)
        earned_map = {
            ub.badge_id: {
                "awarded_at": ub.awarded_at,
                "is_earned": True
            }
            for ub in earned_result.scalars().all()
        }

        # Get user progress toward unearned badges
        user_progress = await _calculate_badge_progress(current_user, db)

        # Enrich badges with user data
        filtered_badges = []
        for badge_out in badge_out_list:
            earned_data = earned_map.get(badge_out.id)
            if earned_data:
                badge_out.is_earned = True
                badge_out.awarded_at = earned_data["awarded_at"]
                badge_out.progress_percentage = 100
            else:
                badge_out.is_earned = False
                badge_out.progress_percentage = user_progress.get(badge_out.id, 0)
                badge_out.progress_description = _get_progress_description(
                    badge_out.criteria,
                    current_user,
                    badge_out.progress_percentage
                )

            # Apply user-specific filters
            if earned_only and not badge_out.is_earned:
                continue
            if available_only and badge_out.is_earned:
                continue

            filtered_badges.append(badge_out)

        return filtered_badges

    return badge_out_list

@router.get("/categories", response_model=List[str])
async def get_badge_categories():
    """Get all available badge categories."""
    return [category.value for category in BadgeCategory]

@router.get("/rarities", response_model=List[str])
async def get_badge_rarities():
    """Get all available badge rarities."""
    return [rarity.value for rarity in BadgeRarity]

@router.get("/{badge_id}", response_model=schemas.BadgeDetailOut)
async def get_badge_detail(
    badge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_async)
):
    """Get detailed information about a specific badge."""
    badge = await db.get(models.Badge, badge_id)
    if not badge or not badge.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")

    # Get earning statistics
    earned_count_stmt = select(func.count(models.UserBadge.id)).where(
        models.UserBadge.badge_id == badge_id
    )
    earned_result = await db.execute(earned_count_stmt)
    total_earned = earned_result.scalar() or 0

    # Get recent earners
    recent_earners_stmt = select(models.UserBadge).options(
        joinedload(models.UserBadge.user)
    ).where(
        models.UserBadge.badge_id == badge_id
    ).order_by(desc(models.UserBadge.awarded_at)).limit(5)

    recent_result = await db.execute(recent_earners_stmt)
    recent_earners = [
        {
            "username": ub.user.username,
            "awarded_at": ub.awarded_at
        }
        for ub in recent_result.scalars().all()
    ]

    badge_detail = schemas.BadgeDetailOut(
        **badge.__dict__,
        total_earned=total_earned,
        recent_earners=recent_earners
    )

    # Add user-specific data if authenticated
    if current_user:
        user_badge_stmt = select(models.UserBadge).where(
            and_(
                models.UserBadge.user_id == current_user.id,
                models.UserBadge.badge_id == badge_id
            )
        )
        user_badge_result = await db.execute(user_badge_stmt)
        user_badge = user_badge_result.scalars().first()

        if user_badge:
            badge_detail.is_earned = True
            badge_detail.awarded_at = user_badge.awarded_at
        else:
            user_progress = await _calculate_badge_progress(current_user, db)
            badge_detail.progress_percentage = user_progress.get(badge_id, 0)
            badge_detail.progress_description = _get_progress_description(
                badge.criteria,
                current_user,
                badge_detail.progress_percentage
            )

    return badge_detail

# =========================
# 👤 User Badge Endpoints
# =========================

@router.get("/my", response_model=List[schemas.UserBadgeOut])
async def get_my_earned_badges(
    category: Optional[BadgeCategory] = Query(None),
    sort_by: str = Query("awarded_at", pattern="^(awarded_at|title|rarity)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Gets all badges the current user has earned with sorting and filtering."""
    stmt = select(models.UserBadge).options(
        joinedload(models.UserBadge.badge)
    ).where(models.UserBadge.user_id == current_user.id)

    # Apply category filter
    if category:
        stmt = stmt.join(models.Badge).where(models.Badge.category == category)

    # Apply sorting
    if sort_by == "awarded_at":
        sort_column = models.UserBadge.awarded_at
    elif sort_by == "title":
        stmt = stmt.join(models.Badge)
        sort_column = models.Badge.title
    elif sort_by == "rarity":
        stmt = stmt.join(models.Badge)
        sort_column = models.Badge.rarity

    if order == "desc":
        stmt = stmt.order_by(desc(sort_column))
    else:
        stmt = stmt.order_by(sort_column)

    result = await db.execute(stmt)
    user_badges = result.scalars().all()

    return [
        schemas.UserBadgeOut(
            badge_id=ub.badge.id,
            title=ub.badge.title,
            description=ub.badge.description,
            icon=ub.badge.icon,
            rarity=ub.badge.rarity,
            category=ub.badge.category,
            awarded_at=ub.awarded_at
        )
        for ub in user_badges
    ]

@router.get("/my/stats", response_model=schemas.UserBadgeStats)
async def get_my_badge_stats(
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive badge statistics for the current user."""
    # Total badges available
    total_badges_stmt = select(func.count(models.Badge.id)).where(
        models.Badge.is_active == True
    )
    total_result = await db.execute(total_badges_stmt)
    total_badges = total_result.scalar() or 0

    # User's earned badges
    earned_badges_stmt = select(func.count(models.UserBadge.id)).where(
        models.UserBadge.user_id == current_user.id
    )
    earned_result = await db.execute(earned_badges_stmt)
    earned_badges = earned_result.scalar() or 0

    # Badges by rarity
    rarity_stats_stmt = select(
        models.Badge.rarity,
        func.count(models.UserBadge.id).label('count')
    ).select_from(models.Badge).outerjoin(
        models.UserBadge,
        and_(
            models.Badge.id == models.UserBadge.badge_id,
            models.UserBadge.user_id == current_user.id
        )
    ).where(
        models.Badge.is_active == True
    ).group_by(models.Badge.rarity)

    rarity_result = await db.execute(rarity_stats_stmt)
    rarity_breakdown = {row.rarity: row.count for row in rarity_result.all()}

    # Recent badge
    recent_badge_stmt = select(models.UserBadge).options(
        joinedload(models.UserBadge.badge)
    ).where(
        models.UserBadge.user_id == current_user.id
    ).order_by(desc(models.UserBadge.awarded_at)).limit(1)

    recent_result = await db.execute(recent_badge_stmt)
    recent_badge = recent_result.scalars().first()

    return schemas.UserBadgeStats(
        total_badges_available=total_badges,
        total_badges_earned=earned_badges,
        completion_percentage=round((earned_badges / max(total_badges, 1)) * 100, 1),
        rarity_breakdown=rarity_breakdown,
        most_recent_badge=recent_badge.badge.title if recent_badge else None,
        most_recent_awarded_at=recent_badge.awarded_at if recent_badge else None
    )

# =========================
# 🏆 Badge Analytics (Admin)
# =========================

@router.get("/analytics/overview", response_model=schemas.BadgeAnalytics)
async def get_badge_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Get comprehensive badge analytics for administrators."""
    # Most popular badges
    popular_stmt = select(
        models.Badge.title,
        func.count(models.UserBadge.id).label('earned_count')
    ).select_from(models.Badge).join(
        models.UserBadge, models.Badge.id == models.UserBadge.badge_id
    ).group_by(
        models.Badge.id, models.Badge.title
    ).order_by(desc('earned_count')).limit(10)

    popular_result = await db.execute(popular_stmt)
    most_popular = [
        {"title": row.title, "earned_count": row.earned_count}
        for row in popular_result.all()
    ]

    # Rarest badges
    rarest_stmt = select(
        models.Badge.title,
        func.count(models.UserBadge.id).label('earned_count')
    ).select_from(models.Badge).outerjoin(
        models.UserBadge, models.Badge.id == models.UserBadge.badge_id
    ).where(
        models.Badge.is_active == True
    ).group_by(
        models.Badge.id, models.Badge.title
    ).order_by('earned_count').limit(10)

    rarest_result = await db.execute(rarest_stmt)
    rarest = [
        {"title": row.title, "earned_count": row.earned_count}
        for row in rarest_result.all()
    ]

    return schemas.BadgeAnalytics(
        most_popular_badges=most_popular,
        rarest_badges=rarest,
        total_badge_awards=await _get_total_badge_awards(db),
        average_badges_per_user=await _get_average_badges_per_user(db)
    )

# =========================
# 🔧 Helper Functions
# =========================

def _validate_badge_criteria(criteria: str) -> bool:
    """Validate badge criteria format."""
    criteria = criteria.lower().strip()

    # Valid formats
    valid_patterns = [
        "first_submission",
        r"^\d+_tasks$",
        r"^xp_\d+$",
        r"^streak_\d+$",
        r"^weave_\d+$"
    ]

    return any(re.match(pattern, criteria) for pattern in valid_patterns)

async def _calculate_badge_progress(user: models.User, db: AsyncSession) -> dict:
    """Calculate user's progress toward unearned badges."""
    # Get all unearned badges
    unearned_stmt = select(models.Badge).where(
        and_(
            models.Badge.is_active == True,
            ~models.Badge.id.in_(
                select(models.UserBadge.badge_id).where(
                    models.UserBadge.user_id == user.id
                )
            )
        )
    )
    unearned_result = await db.execute(unearned_stmt)
    unearned_badges = unearned_result.scalars().all()

    # Get user stats
    approved_count_stmt = select(func.count(models.TaskSubmission.id)).where(
        and_(
            models.TaskSubmission.user_id == user.id,
            models.TaskSubmission.status == "approved"
        )
    )
    approved_result = await db.execute(approved_count_stmt)
    approved_count = approved_result.scalar() or 0

    progress = {}
    for badge in unearned_badges:
        criteria = badge.criteria.lower()
        percentage = 0

        if criteria == "first_submission":
            percentage = 100 if approved_count >= 1 else 0
        elif criteria.endswith("_tasks"):
            try:
                required = int(criteria.split('_')[0])
                percentage = min(100, (approved_count / required) * 100)
            except (ValueError, IndexError):
                continue
        elif criteria.startswith("xp_"):
            try:
                required = int(criteria.split('_')[1])
                percentage = min(100, (user.xp / required) * 100)
            except (ValueError, IndexError):
                continue
        elif criteria.startswith("streak_"):
            try:
                required = int(criteria.split('_')[1])
                current_streak = getattr(user, 'streak', 0)
                percentage = min(100, (current_streak / required) * 100)
            except (ValueError, IndexError):
                continue

        progress[badge.id] = round(percentage, 1)

    return progress

def _get_progress_description(criteria: str, user: models.User, percentage: float) -> str:
    """Generate human-readable progress description."""
    if percentage >= 100:
        return "Ready to claim!"

    criteria = criteria.lower()

    if criteria == "first_submission":
        return "Complete your first task to earn this badge"
    elif criteria.endswith("_tasks"):
        try:
            required = int(criteria.split('_')[0])
            # You'd need to get actual completed count here
            return f"Complete {required} tasks to earn this badge"
        except (ValueError, IndexError):
            return "Progress criteria not available"
    elif criteria.startswith("xp_"):
        try:
            required = int(criteria.split('_')[1])
            needed = required - user.xp
            return f"Earn {needed} more XP to unlock this badge"
        except (ValueError, IndexError):
            return "Progress criteria not available"
    elif criteria.startswith("streak_"):
        try:
            required = int(criteria.split('_')[1])
            current = getattr(user, 'streak', 0)
            needed = required - current
            return f"Maintain a {needed} day longer streak to earn this badge"
        except (ValueError, IndexError):
            return "Progress criteria not available"

    return "Progress criteria not available"

async def _retroactively_award_badge(badge_id: int):
    """Background task to award new badge to users who already qualify."""
    # Implementation would check all users and award badge to those who qualify
    pass

async def _get_total_badge_awards(db: AsyncSession) -> int:
    """Get total number of badge awards."""
    stmt = select(func.count(models.UserBadge.id))
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _get_average_badges_per_user(db: AsyncSession) -> float:
    """Get average badges per user."""
    stmt = select(func.avg(func.count(models.UserBadge.id))).select_from(
        models.UserBadge
    ).group_by(models.UserBadge.user_id)
    result = await db.execute(stmt)
    avg = result.scalar()
    return round(float(avg or 0), 2)
