"""
Activities module for Impact ID application.
"""


from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional, Set
import json

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy import and_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app import models, schemas, database, auth
from app.utils.common import utcnow


router = APIRouter(prefix="/activities", tags=["Activities"])

# =========================
# 🎯 Activity Configuration
# =========================

class ActivityType(str, Enum):
    """ActivityType class for Impact ID application."""
    TASK_COMPLETED = "task_completed"
    BADGE_EARNED = "badge_earned"
    LEVEL_UP = "level_up"
    STREAK_MILESTONE = "streak_milestone"
    THREAD_WOVEN = "thread_woven"
    USER_JOINED = "user_joined"
    ACHIEVEMENT_UNLOCKED = "achievement_unlocked"

class ActivityFilter(str, Enum):
    """ActivityFilter class for Impact ID application."""
    ALL = "all"
    FOLLOWING = "following"
    PERSONAL = "personal"
    TASKS = "tasks"
    BADGES = "badges"
    SOCIAL = "social"

# Global WebSocket connections for real-time updates
active_connections: Set[WebSocket] = set()

# =========================
# 📱 Activity Feed Endpoints
# =========================

@router.get("/", response_model=List[schemas.ActivityOut])
async def get_activity_feed(
    filter_type: ActivityFilter = Query(ActivityFilter.ALL, description="Filter activities by type"),
    user_id: Optional[int] = Query(None, description="Filter by specific user ID"),
    activity_type: Optional[ActivityType] = Query(None, description="Filter by activity type"),
    hours_back: int = Query(24, ge=1, le=168, description="Hours to look back (max 1 week)"),
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return"),
    offset: int = Query(0, ge=0, description="Number of activities to skip"),
    db: AsyncSession = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_async)
):
    """
    🌟 Enhanced activity feed with filtering, personalization, and privacy controls.
    """
    cutoff_time = utcnow() - timedelta(hours=hours_back)

    # Build base query
    stmt = select(models.Activity).options(
        joinedload(models.Activity.user)
    ).where(
        and_(
            models.Activity.created_at >= cutoff_time,
            models.Activity.is_public == True  # Only show public activities
        )
    )

    # Apply filters based on authentication and preferences
    if current_user:
        if filter_type == ActivityFilter.FOLLOWING:
            # Get activities from users the current user follows
            following_ids = await _get_following_user_ids(current_user.id, db)
            if following_ids:
                stmt = stmt.where(models.Activity.user_id.in_(following_ids))
            else:
                # Return empty if not following anyone
                return []
        elif filter_type == ActivityFilter.PERSONAL:
            # Only current user's activities
            stmt = stmt.where(models.Activity.user_id == current_user.id)

    # Apply additional filters
    if user_id:
        stmt = stmt.where(models.Activity.user_id == user_id)

    if activity_type:
        stmt = stmt.where(models.Activity.action == activity_type.value)

    if filter_type == ActivityFilter.TASKS:
        stmt = stmt.where(models.Activity.action.in_(["task_completed", "streak_milestone"]))
    elif filter_type == ActivityFilter.BADGES:
        stmt = stmt.where(models.Activity.action.in_(["badge_earned", "achievement_unlocked"]))
    elif filter_type == ActivityFilter.SOCIAL:
        stmt = stmt.where(models.Activity.action.in_(["user_joined", "level_up"]))

    # Apply ordering and pagination
    stmt = stmt.order_by(desc(models.Activity.created_at)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    activities = result.scalars().all()

    # Enrich activities with additional context
    enriched_activities = []
    for activity in activities:
        # Provide required user fields at construction to satisfy schema
        user_level = activity.user.level if activity.user else 1
        user_xp = activity.user.xp if activity.user else 0
        user_avatar = getattr(activity.user, 'avatar_url', None) if activity.user else None

        activity_out = schemas.ActivityOut(
            id=activity.id,
            user_id=activity.user_id,
            username=activity.username,
            user_avatar=user_avatar,
            user_level=user_level,
            user_xp=user_xp,
            action=activity.action,
            detail=activity.detail,
            meta_data=activity.meta_data or {},
            created_at=activity.created_at,
            is_public=activity.is_public
        )

        # Add reaction counts if user is authenticated
        if current_user:
            activity_out.reaction_counts = await _get_activity_reactions(activity.id, db)
            activity_out.user_reaction = await _get_user_reaction(activity.id, current_user.id, db)

        enriched_activities.append(activity_out)

    return enriched_activities

@router.get("/trending", response_model=List[schemas.TrendingActivityOut])
async def get_trending_activities(
    period: str = Query("24h", pattern="^(1h|6h|24h|7d)$", description="Time period for trending"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(database.get_db)
):
    """
    🔥 Get trending activities based on engagement and recency.
    """
    # Calculate time cutoff
    hours_map = {"1h": 1, "6h": 6, "24h": 24, "7d": 168}
    cutoff_time = utcnow() - timedelta(hours=hours_map[period])

    # Query activities with reaction counts
    stmt = select(
        models.Activity,
        func.count(models.ActivityReaction.id).label('reaction_count')
    ).options(
        joinedload(models.Activity.user)
    ).outerjoin(
        models.ActivityReaction, models.Activity.id == models.ActivityReaction.activity_id
    ).where(
        and_(
            models.Activity.created_at >= cutoff_time,
            models.Activity.is_public == True
        )
    ).group_by(
        models.Activity.id
    ).order_by(
        # Trending score: reactions + recency boost
        (func.count(models.ActivityReaction.id) +
         func.extract('epoch', utcnow() - models.Activity.created_at) / 3600).desc()
    ).limit(limit)

    result = await db.execute(stmt)
    trending = result.all()

    return [
        schemas.TrendingActivityOut(
            id=activity.id,
            user_id=activity.user_id,
            username=activity.username,
            action=activity.action,
            detail=activity.detail,
            created_at=activity.created_at,
            reaction_count=reaction_count,
            trending_score=reaction_count + max(
                0,
                24 - (datetime.utcnow(
            ) - activity.created_at).total_seconds() / 3600)
        )
        for activity, reaction_count in trending
    ]

@router.get("/stats", response_model=schemas.ActivityStats)
async def get_activity_stats(
    user_id: Optional[int] = Query(None, description="Get stats for specific user"),
    db: AsyncSession = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_async)
):
    """
    📊 Get activity statistics for platform or specific user.
    """
    target_user_id = user_id or (current_user.id if current_user else None)

    if not target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID required when not authenticated."
        )

    # Activity counts by type
    activity_counts_stmt = select(
        models.Activity.action,
        func.count(models.Activity.id).label('count')
    ).where(
        models.Activity.user_id == target_user_id
    ).group_by(models.Activity.action)

    counts_result = await db.execute(activity_counts_stmt)
    activity_counts = {row.action: row.count for row in counts_result.all()}

    # Recent activity (last 7 days)
    week_ago = utcnow() - timedelta(days=7)
    recent_count_stmt = select(func.count(models.Activity.id)).where(
        and_(
            models.Activity.user_id == target_user_id,
            models.Activity.created_at >= week_ago
        )
    )
    recent_result = await db.execute(recent_count_stmt)
    recent_activity_count = recent_result.scalar() or 0

    # Most active day
    daily_counts_stmt = select(
        func.date(models.Activity.created_at).label('date'),
        func.count(models.Activity.id).label('count')
    ).where(
        and_(
            models.Activity.user_id == target_user_id,
            models.Activity.created_at >= week_ago
        )
    ).group_by(
        func.date(models.Activity.created_at)
    ).order_by(desc('count')).limit(1)

    daily_result = await db.execute(daily_counts_stmt)
    most_active_day = daily_result.first()

    return schemas.ActivityStats(
        user_id=target_user_id,
        total_activities=sum(activity_counts.values()),
        activity_breakdown=activity_counts,
        recent_activity_count=recent_activity_count,
        most_active_date=most_active_day.date if most_active_day else None,
        most_active_count=most_active_day.count if most_active_day else 0
    )

# =========================
# 👍 Activity Reactions
# =========================

@router.post("/{activity_id}/react", response_model=schemas.ActivityReactionOut)
async def react_to_activity(
    activity_id: int,
    reaction_data: schemas.ActivityReactionCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """
    👍 Add or update a reaction to an activity.
    """
    # Verify activity exists and is public
    activity = await db.get(models.Activity, activity_id)
    if not activity or not activity.is_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found or not public."
        )

    # Check for existing reaction
    existing_reaction_stmt = select(models.ActivityReaction).where(
        and_(
            models.ActivityReaction.activity_id == activity_id,
            models.ActivityReaction.user_id == current_user.id
        )
    )
    existing_result = await db.execute(existing_reaction_stmt)
    existing_reaction = existing_result.scalars().first()

    if existing_reaction:
        if existing_reaction.reaction_type == reaction_data.reaction_type:
            # Same reaction - remove it
            await db.delete(existing_reaction)
            await db.commit()
            return schemas.ActivityReactionOut(
                activity_id=activity_id,
                reaction_type=None,
                is_removed=True
            )
        else:
            # Different reaction - update it
            existing_reaction.reaction_type = reaction_data.reaction_type
            existing_reaction.created_at = utcnow()
    else:
        # New reaction
        new_reaction = models.ActivityReaction(
            activity_id=activity_id,
            user_id=current_user.id,
            reaction_type=reaction_data.reaction_type,
            created_at=utcnow()
        )
        db.add(new_reaction)

    await db.commit()

    # Broadcast reaction update to WebSocket connections
    await _broadcast_reaction_update(activity_id, reaction_data.reaction_type, current_user.username)

    return schemas.ActivityReactionOut(
        activity_id=activity_id,
        reaction_type=reaction_data.reaction_type,
        is_removed=False
    )

@router.get("/{activity_id}/reactions", response_model=List[schemas.ActivityReactionDetail])
async def get_activity_reactions(
    activity_id: int,
    reaction_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(database.get_db)
):
    """
    📋 Get detailed reactions for an activity.
    """
    stmt = select(models.ActivityReaction).options(
        joinedload(models.ActivityReaction.user)
    ).where(models.ActivityReaction.activity_id == activity_id)

    if reaction_type:
        stmt = stmt.where(models.ActivityReaction.reaction_type == reaction_type)

    stmt = stmt.order_by(desc(models.ActivityReaction.created_at)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    reactions = result.scalars().all()

    return [
        schemas.ActivityReactionDetail(
            id=reaction.id,
            user_id=reaction.user_id,
            username=reaction.user.username,
            reaction_type=reaction.reaction_type,
            created_at=reaction.created_at
        )
        for reaction in reactions
    ]

# =========================
# 🔔 Activity Creation (Internal)
# =========================

@router.post("/create", response_model=schemas.ActivityOut)
async def create_activity(
    activity_data: schemas.ActivityCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """
    🔨 Internal endpoint for creating activities (used by other services).
    """
    new_activity = models.Activity(
        user_id=activity_data.user_id or current_user.id,
        username=activity_data.username or current_user.username,
        action=activity_data.action,
        detail=activity_data.detail,
        meta_data=activity_data.meta_data,
        is_public=activity_data.is_public,
        created_at=utcnow()
    )

    db.add(new_activity)
    await db.commit()
    await db.refresh(new_activity)

    # Broadcast new activity to WebSocket connections
    await _broadcast_new_activity(new_activity)

    return schemas.ActivityOut(
        id=new_activity.id,
        user_id=new_activity.user_id,
        username=new_activity.username,
        user_avatar=getattr(current_user, 'avatar_url', None) if current_user else None,
        user_level=(current_user.level if current_user else 1),
        user_xp=(current_user.xp if current_user else 0),
        action=new_activity.action,
        detail=new_activity.detail,
        meta_data=new_activity.meta_data or {},
        created_at=new_activity.created_at,
        is_public=new_activity.is_public,
        reaction_counts={},
        user_reaction=None
    )

# =========================
# 🔄 Real-time WebSocket Feed
# =========================

@router.websocket("/live")
async def activity_websocket(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(database.get_db)
):
    """
    🔴 Real-time activity feed via WebSocket.
    """
    await websocket.accept()
    active_connections.add(websocket)

    # Authenticate user if token provided
    current_user = None
    if token:
        try:
            current_user = await auth.get_user_from_token_async(token, db)
        except Exception:
            pass  # Continue as anonymous user

    try:
        # Send initial activities
        initial_activities = await get_activity_feed(
            filter_type=ActivityFilter.ALL,
            limit=10,
            offset=0,
            db=db,
            current_user=current_user
        )

        await websocket.send_text(json.dumps({
            "type": "initial_feed",
            "activities": [activity.dict() for activity in initial_activities]
        }))

        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle different message types
                if getattr(message, "type", None) == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif getattr(message, "type", None) == "subscribe_user":
                    # Subscribe to specific user's activities
                    pass  # Implementation for user-specific subscriptions

            except WebSocketDisconnect as e:
                break

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.discard(websocket)

# =========================
# 🔧 Helper Functions
# =========================

async def _get_following_user_ids(user_id: int, db: AsyncSession) -> List[int]:
    """Get list of user IDs that the given user follows."""
    # This would depend on your user following system
    # For now, return empty list
    return []

async def _get_activity_reactions(activity_id: int, db: AsyncSession) -> dict:
    """Get reaction counts for an activity."""
    stmt = select(
        models.ActivityReaction.reaction_type,
        func.count(models.ActivityReaction.id).label('count')
    ).where(
        models.ActivityReaction.activity_id == activity_id
    ).group_by(models.ActivityReaction.reaction_type)

    result = await db.execute(stmt)
    return {row.reaction_type: row.count for row in result.all()}

async def _get_user_reaction(activity_id: int, user_id: int, db: AsyncSession) -> Optional[str]:
    """Get current user's reaction to an activity."""
    stmt = select(models.ActivityReaction.reaction_type).where(
        and_(
            models.ActivityReaction.activity_id == activity_id,
            models.ActivityReaction.user_id == user_id
        )
    )
    result = await db.execute(stmt)
    reaction = result.scalars().first()
    return reaction

async def _broadcast_new_activity(activity: models.Activity):
    """Broadcast new activity to all connected WebSocket clients."""
    global active_connections
    # Safety: ensure it's a set if something reassigned it
    if active_connections is None:
        active_connections = set()
    if not active_connections:
        return

    message = {
        "type": "new_activity",
        "activity": {
            "id": activity.id,
            "username": activity.username,
            "action": activity.action,
            "detail": activity.detail,
            "created_at": activity.created_at.isoformat()
        }
    }

    # Send to all connections (you might want to filter based on user preferences)
    disconnected = set()
    for connection in active_connections:
        try:
            await connection.send_text(json.dumps(message))
        except Exception:
            disconnected.add(connection)

    # Clean up disconnected connections
    active_connections -= disconnected

async def _broadcast_reaction_update(activity_id: int, reaction_type: str, username: str):
    """Broadcast reaction update to all connected WebSocket clients."""
    global active_connections
    if active_connections is None:
        active_connections = set()
    if not active_connections:
        return

    message = {
        "type": "reaction_update",
        "activity_id": activity_id,
        "reaction_type": reaction_type,
        "username": username
    }

    disconnected = set()
    for connection in active_connections:
        try:
            await connection.send_text(json.dumps(message))
        except Exception as e:
            disconnected.add(connection)

    active_connections -= disconnected

# =========================
# 🧹 Utility Functions
# =========================

async def create_activity_log(
    user_id: int,
    username: str,
    action: str,
    detail: str,
    meta_data: Optional[dict] = None,
    is_public: bool = True,
    db: AsyncSession = None
) -> models.Activity:
    """
    🔨 Utility function to create activity logs from other parts of the application.
    """
    activity = models.Activity(
        user_id=user_id,
        username=username,
        action=action,
        detail=detail,
        meta_data=meta_data or {},
        is_public=is_public,
        created_at=utcnow()
    )

    if db:
        db.add(activity)
        await db.commit()
        await db.refresh(activity)

        # Broadcast if public
        if is_public:
            await _broadcast_new_activity(activity)

    return activity
