"""
Notifications module for Impact ID application.
"""


from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas, auth
from app.database import get_db
from app.utils.common import utcnow


router = APIRouter()

@router.get("/", response_model=List[schemas.NotificationOut])
async def get_notifications(
    unread_only: bool = Query(False, description="Get only unread notifications"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Get user notifications."""
    stmt = select(models.Notification).where(
        models.Notification.user_id == current_user.id
    )

    if unread_only:
        stmt = stmt.where(models.Notification.is_read == False)

    stmt = stmt.order_by(desc(models.Notification.created_at)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    notifications = result.scalars().all()

    return notifications

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Mark notification as read."""
    stmt = select(models.Notification).where(
        and_(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    notification = result.scalars().first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_read = True
    notification.read_at = utcnow()
    await db.commit()

    return {"message": "Notification marked as read"}

@router.post("/mark-all-read")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Mark all notifications as read."""
    stmt = select(models.Notification).where(
        and_(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False
        )
    )
    result = await db.execute(stmt)
    notifications = result.scalars().all()

    for notification in notifications:
        notification.is_read = True
        notification.read_at = utcnow()

    await db.commit()

    return {"message": f"Marked {len(notifications)} notifications as read"}

@router.get("/unread/count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user_async)
):
    """Get count of unread notifications."""
    stmt = select(func.count(models.Notification.id)).where(
        and_(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False
        )
    )
    result = await db.execute(stmt)
    count = result.scalar() or 0

    return {"unread_count": count}
