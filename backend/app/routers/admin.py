"""
Admin module for Impact ID application.
"""


from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional
import csv
import io
import json

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy import func, and_, or_, desc, case, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload

from app import models, auth, schemas
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

# =========================
# 🛡️ Admin Configuration
# =========================

class UserStatus(str, Enum):
    """UserStatus class for Impact ID application."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"
    PENDING = "pending"

class ContentStatus(str, Enum):
    """ContentStatus class for Impact ID application."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"

# =========================
# 📊 Dashboard & Overview
# =========================

@router.get("/dashboard", response_model=schemas.AdminDashboard)
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    🎯 Comprehensive admin dashboard with key metrics and insights.
    """
    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # User Statistics
    total_users_stmt = select(func.count(models.User.id))
    total_users_result = await db.execute(total_users_stmt)
    total_users = total_users_result.scalar() or 0

    new_users_today_stmt = select(func.count(models.User.id)).where(
        models.User.created_at >= today
    )
    new_today_result = await db.execute(new_users_today_stmt)
    new_users_today = new_today_result.scalar() or 0

    active_users_week_stmt = select(func.count(models.User.id.distinct())).select_from(
        models.TaskSubmission
    ).join(models.User).where(
        models.TaskSubmission.submitted_at >= week_ago
    )
    active_week_result = await db.execute(active_users_week_stmt)
    active_users_week = active_week_result.scalar() or 0

    # Content Statistics
    pending_submissions_stmt = select(func.count(models.TaskSubmission.id)).where(
        models.TaskSubmission.status == "pending"
    )
    pending_result = await db.execute(pending_submissions_stmt)
    pending_submissions = pending_result.scalar() or 0

    total_tasks_stmt = select(func.count(models.Task.id)).where(
        models.Task.active.is_(True)
    )
    total_tasks_result = await db.execute(total_tasks_stmt)
    total_tasks = total_tasks_result.scalar() or 0

    # Platform Activity
    submissions_today_stmt = select(func.count(models.TaskSubmission.id)).where(
        models.TaskSubmission.submitted_at >= today
    )
    submissions_today_result = await db.execute(submissions_today_stmt)
    submissions_today = submissions_today_result.scalar() or 0

    # System Health
    avg_response_time = await _calculate_avg_response_time(db)
    error_rate = await _calculate_error_rate(db)

    return schemas.AdminDashboard(
        total_users=total_users,
        new_users_today=new_users_today,
        active_users_this_week=active_users_week,
        pending_submissions=pending_submissions,
        total_active_tasks=total_tasks,
        submissions_today=submissions_today,
        avg_response_time_hours=avg_response_time,
        platform_health_score=max(0, 100 - error_rate * 10),
        top_performers=await _get_top_performers(db, 5),
        recent_activities=await _get_recent_activities(db, 10)
    )

# =========================
# 📝 Content Moderation
# =========================

@router.get("/submissions", response_model=List[schemas.AdminSubmissionOut])
async def get_submissions(
    status: Optional[ContentStatus] = Query(None, description="Filter by submission status"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    task_id: Optional[int] = Query(None, description="Filter by task ID"),
    days_back: Optional[int] = Query(7, ge=1, le=365, description="Days to look back"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    📋 Advanced submission management with filtering and pagination.
    """
    # Build query with filters
    stmt = select(models.TaskSubmission).options(
        joinedload(models.TaskSubmission.user),
        joinedload(models.TaskSubmission.task)
    )

    # Apply filters
    filters = []
    if status:
        filters.append(models.TaskSubmission.status == status.value)
    if user_id:
        filters.append(models.TaskSubmission.user_id == user_id)
    if task_id:
        filters.append(models.TaskSubmission.task_id == task_id)

    # Date filter
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)
    filters.append(models.TaskSubmission.submitted_at >= cutoff_date)

    if filters:
        stmt = stmt.where(and_(*filters))

    # Apply ordering and pagination
    stmt = stmt.order_by(
        case(
            (models.TaskSubmission.status == "pending", 1),
            (models.TaskSubmission.status == "flagged", 2),
            else_=3
        ),
        models.TaskSubmission.submitted_at.desc()
    ).offset(offset).limit(limit)

    result = await db.execute(stmt)
    submissions = result.scalars().all()

    return [
        schemas.AdminSubmissionOut(
            id=log.id,
            task_id=log.task_id,
            task_title=log.task.title,
            user_id=log.user_id,
            username=log.user.username,
            response=log.response,
            submitted_at=log.submitted_at,
            status=log.status,
            reviewed_at=log.reviewed_at,
            reviewed_by=log.reviewed_by,
            review_notes=log.review_notes,
            flagged_reason=getattr(log, 'flagged_reason', None)
        ) for log in submissions
    ]

@router.post("/submissions/{submission_id}/flag")
async def flag_submission(
    submission_id: int,
    flag_data: schemas.FlagSubmissionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Flag a submission for review or inappropriate content."""
    submission = await db.get(models.TaskSubmission, submission_id)
    if not submission:
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e

    submission.status = "flagged"
    submission.flagged_reason = flag_data.reason
    submission.flagged_by = current_user.id
    submission.flagged_at = datetime.utcnow()

    await db.commit()

    # Background task to notify other admins
    background_tasks.add_task(_notify_admins_flagged_content, submission_id, flag_data.reason)

    return {"message": "Submission flagged successfully."}

@router.post("/submissions/bulk-review")
async def bulk_review_submissions(
    bulk_data: schemas.BulkReviewRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Bulk approve or reject multiple submissions."""
    if len(bulk_data.submission_ids) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot process more than 100 submissions at once."
        )

    # Get submissions with users and tasks
    stmt = select(models.TaskSubmission).options(
        joinedload(models.TaskSubmission.user),
        joinedload(models.TaskSubmission.task)
    ).where(models.TaskSubmission.id.in_(bulk_data.submission_ids))

    result = await db.execute(stmt)
    submissions = result.scalars().all()

    if len(submissions) != len(bulk_data.submission_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more submissions not found."
        )

    processed_count = 0
    for submission in submissions:
        if submission.status != "pending":
            continue

        submission.status = "approved" if bulk_data.approve else "declined"
        submission.reviewed_at = datetime.utcnow()
        submission.reviewed_by = current_user.id
        submission.review_notes = bulk_data.notes

        if bulk_data.approve:
            # Award points and XP
            await _award_points_and_xp(submission.user, submission.task, db)

        processed_count += 1

    await db.commit()

    # Background task for notifications
    background_tasks.add_task(
        _send_bulk_review_notifications,
        [s.user.email for s in submissions],
        bulk_data.approve,
        bulk_data.notes
    )

    return {"message": f"Processed {processed_count} submissions successfully."}

# =========================
# 👥 User Management
# =========================

@router.get("/users", response_model=List[schemas.AdminUserOut])
async def get_all_users(
    status: Optional[UserStatus] = Query(None),
    search: Optional[str] = Query(None, description="Search by username or email"),
    sort_by: str = Query("created_at", pattern="^(created_at|xp|last_active|username)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    👥 Advanced user management with search, filtering, and sorting.
    """
    stmt = select(models.User)

    # Apply filters
    filters = []
    if status:
        filters.append(models.User.status == status.value)

    if search:
        search_filter = or_(
            models.User.username.ilike(f"%{search}%"),
            models.User.email.ilike(f"%{search}%")
        )
        filters.append(search_filter)

    if filters:
        stmt = stmt.where(and_(*filters))

    # Apply sorting
    sort_column = getattr(models.User, sort_by)
    if order == "desc":
        stmt = stmt.order_by(desc(sort_column))
    else:
        stmt = stmt.order_by(sort_column)

    stmt = stmt.offset(offset).limit(limit)

    result = await db.execute(stmt)
    users = result.scalars().all()

    # Enrich with additional data
    enriched_users = []
    for user in users:
        # Get task completion count
        task_count_stmt = select(func.count(models.TaskSubmission.id)).where(
            and_(
                models.TaskSubmission.user_id == user.id,
                models.TaskSubmission.status == "approved"
            )
        )
        task_count_result = await db.execute(task_count_stmt)
        task_count = task_count_result.scalar() or 0

        # Get badge count
        badge_count_stmt = select(func.count(models.UserBadge.id)).where(
            models.UserBadge.user_id == user.id
        )
        badge_count_result = await db.execute(badge_count_stmt)
        badge_count = badge_count_result.scalar() or 0

        enriched_users.append(schemas.AdminUserOut(
            id=user.id,
            username=user.username,
            email=user.email,
            status=user.status,
            xp=user.xp,
            level=user.level,
            essence_balance=user.essence_balance,
            streak=getattr(user, 'streak', 0),
            task_count=task_count,
            badge_count=badge_count,
            created_at=user.created_at,
            last_active=getattr(user, 'last_active', None),
            is_verified=user.is_verified,
            wallet_address=user.wallet_address
        ))

    return enriched_users

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status_data: schemas.UpdateUserStatusRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Update a user's account status (suspend, ban, activate)."""
    user = await db.get(models.User, user_id)
    if not user:
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own account status."
        )

    old_status = user.status
    user.status = status_data.status
    user.status_reason = status_data.reason
    user.status_updated_by = current_user.id
    user.status_updated_at = datetime.utcnow()

    # Create audit log
    audit_log = models.ActivityLog(
        admin_id=current_user.id,
        action="user_status_change",
        target_type="user",
        target_id=user_id,
        details=f"Status changed from {old_status} to {status_data.status}. Reason: {status_data.reason}",
        created_at=datetime.utcnow()
    )
    db.add(audit_log)

    await db.commit()

    # Background task to notify user
    background_tasks.add_task(
        _notify_user_status_change,
        user.email,
        user.username,
        status_data.status,
        status_data.reason
    )

    return {"message": f"User status updated to {status_data.status}."}

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role_data: schemas.UpdateUserRoleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Update a user's role (admin, moderator, user)."""
    user = await db.get(models.User, user_id)
    if not user:
        try:

            pass

        except Exception as e:

            raise HTTPException(status_code=500, detail="Error") from e

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own role."
        ) from e

    valid_roles = ["user", "moderator", "admin"]
    if role_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    old_role = user.role
    user.role = role_data.role

    # Create audit log
    audit_log = models.ActivityLog(
        admin_id=current_user.id,
        action="user_role_change",
        target_type="user",
        target_id=user_id,
        details=f"Role changed from {old_role} to {role_data.role}",
        created_at=datetime.utcnow()
    )
    db.add(audit_log)

    await db.commit()

    return {"message": f"User role updated to {role_data.role}."}

# =========================
# 📊 Analytics & Reports
# =========================

@router.get("/analytics/overview", response_model=schemas.PlatformAnalytics)
async def get_platform_analytics(
    days_back: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    📈 Comprehensive platform analytics and insights.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    # User growth metrics
    user_growth_stmt = text("""
        SELECT
            DATE(created_at) as date,
            COUNT(*) as new_users
        FROM users
        WHERE created_at >= :cutoff_date
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    user_growth_result = await db.execute(user_growth_stmt, {"cutoff_date": cutoff_date})
    user_growth = [
        {"date": row.date.isoformat(), "count": row.new_users}
        for row in user_growth_result.all()
    ]

    # Activity metrics
    activity_stmt = text("""
        SELECT
            DATE(submitted_at) as date,
            COUNT(*) as submissions,
            COUNT(DISTINCT user_id) as active_users
        FROM task_logs
        WHERE submitted_at >= :cutoff_date
        GROUP BY DATE(submitted_at)
        ORDER BY date
    """)
    activity_result = await db.execute(activity_stmt, {"cutoff_date": cutoff_date})
    activity_metrics = [
        {
            "date": row.date.isoformat(),
            "submissions": row.submissions,
            "active_users": row.active_users
        }
        for row in activity_result.all()
    ]

    # Top tasks by completion
    top_tasks_stmt = select(
        models.Task.title,
        func.count(models.TaskSubmission.id).label('completion_count')
    ).select_from(models.Task).join(
        models.TaskSubmission, models.Task.id == models.TaskSubmission.task_id
    ).where(
        and_(
            models.TaskSubmission.status == "approved",
            models.TaskSubmission.submitted_at >= cutoff_date
        )
    ).group_by(
        models.Task.id, models.Task.title
    ).order_by(desc('completion_count')).limit(10)

    top_tasks_result = await db.execute(top_tasks_stmt)
    top_tasks = [
        {"task_title": row.title, "completions": row.completion_count}
        for row in top_tasks_result.all()
    ]

    return schemas.PlatformAnalytics(
        period_days=days_back,
        user_growth=user_growth,
        daily_activity=activity_metrics,
        top_tasks=top_tasks,
        total_users=await _get_total_users(db),
        total_submissions=await _get_total_submissions(db, cutoff_date),
        avg_daily_active_users=await _get_avg_daily_active_users(db, cutoff_date)
    )

@router.get("/reports/user-progress", response_model=List[schemas.AdminUserReport])
async def get_user_progress_report(
    include_inactive: bool = Query(False),
    min_xp: Optional[int] = Query(None, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    📋 Comprehensive user progress report with optimized queries.
    ✅ PERFORMANCE: Single query with subqueries to avoid N+1 problems.
    """
    # Subquery for approved submissions count
    approved_subquery = select(
        models.TaskSubmission.user_id,
        func.count(models.TaskSubmission.id).label("approved_count")
    ).where(
        models.TaskSubmission.status == "approved"
    ).group_by(models.TaskSubmission.user_id).subquery()

    # Subquery for badge count
    badge_subquery = select(
        models.UserBadge.user_id,
        func.count(models.UserBadge.id).label("badge_count")
    ).group_by(models.UserBadge.user_id).subquery()

    # Main query
    stmt = select(
        models.User,
        func.coalesce(approved_subquery.c.approved_count, 0).label("approved_submissions"),
        func.coalesce(badge_subquery.c.badge_count, 0).label("badge_count")
    ).outerjoin(
        approved_subquery, models.User.id == approved_subquery.c.user_id
    ).outerjoin(
        badge_subquery, models.User.id == badge_subquery.c.user_id
    )

    # Apply filters
    filters = []
    if not include_inactive:
        filters.append(models.User.status == "active")
    if min_xp is not None:
        filters.append(models.User.xp >= min_xp)

    if filters:
        stmt = stmt.where(and_(*filters))

    stmt = stmt.order_by(desc(models.User.xp)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    results = result.all()

    return [
        schemas.AdminUserReport(
            user_id=user.id,
            username=user.username,
            email=user.email,
            status=user.status,
            xp=user.xp,
            level=user.level,
            essence_balance=user.essence_balance,
            approved_submissions=approved_submissions,
            badge_count=badge_count,
            current_streak=getattr(user, 'streak', 0),
            joined_at=user.created_at,
            last_active=getattr(user, 'last_active', None),
            is_verified=user.is_verified
        ) for user, approved_submissions, badge_count in results
    ]

# =========================
# 🔍 Audit & Security
# =========================

@router.get("/audit-logs", response_model=List[schemas.AuditLogOut])
async def get_audit_logs(
    action: Optional[str] = Query(None),
    admin_id: Optional[int] = Query(None),
    days_back: int = Query(7, ge=1, le=90),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """Get audit logs for admin actions."""
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    stmt = select(models.ActivityLog).options(
        joinedload(models.ActivityLog.admin)
    ).where(models.ActivityLog.created_at >= cutoff_date)

    if action:
        stmt = stmt.where(models.ActivityLog.action == action)
    if admin_id:
        stmt = stmt.where(models.ActivityLog.admin_id == admin_id)

    stmt = stmt.order_by(desc(models.ActivityLog.created_at)).offset(offset).limit(limit)

    result = await db.execute(stmt)
    logs = result.scalars().all()

    return [
        schemas.AuditLogOut(
            id=log.id,
            admin_username=log.admin.username,
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            details=log.details,
            created_at=log.created_at
        ) for log in logs
    ]

# =========================
# 🚨 CRITICAL MISSING ENDPOINT ADDED
# =========================

@router.get("/audit-logs/export")
async def export_audit_logs(
    action: Optional[str] = Query(None),
    admin_id: Optional[int] = Query(None),
    days_back: int = Query(30, ge=1, le=365),
    format: str = Query("csv", pattern="^(csv|json)$"),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    📥 Export audit logs as CSV or JSON file.
    🚨 CRITICAL: This endpoint was missing and causing frontend errors.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    # Build query with filters
    stmt = select(models.ActivityLog).options(
        joinedload(models.ActivityLog.admin)
    ).where(models.ActivityLog.created_at >= cutoff_date)

    if action:
        stmt = stmt.where(models.ActivityLog.action == action)
    if admin_id:
        stmt = stmt.where(models.ActivityLog.admin_id == admin_id)

    stmt = stmt.order_by(desc(models.ActivityLog.created_at))

    result = await db.execute(stmt)
    logs = result.scalars().all()

    # Prepare data for export
    export_data = [
        {
            "id": log.id,
            "admin_username": log.admin.username,
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]

    # Generate filename with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    if format == "csv":
        # Create CSV content
        output = io.StringIO()
        if export_data:
            writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)

        csv_content = output.getvalue()
        output.close()

        # Return as streaming response
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=audit_logs_{timestamp}.csv"
            }
        )

    else:  # JSON format
        json_content = json.dumps(export_data, indent=2)

        return StreamingResponse(
            io.StringIO(json_content),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=audit_logs_{timestamp}.json"
            }
        )

# =========================
# 🔧 Helper Functions
# =========================

async def _calculate_avg_response_time(db: AsyncSession) -> float:
    """Calculate average response time for pending submissions."""
    stmt = select(
        func.avg(
            func.extract('epoch', models.TaskSubmission.reviewed_at - models.TaskSubmission.submitted_at) / 3600
        )
    ).where(
        and_(
            models.TaskSubmission.reviewed_at.isnot(None),
            models.TaskSubmission.submitted_at >= datetime.utcnow() - timedelta(days=7)
        )
    )
    result = await db.execute(stmt)
    avg_hours = result.scalar()
    return round(float(avg_hours or 0), 2)

async def _calculate_error_rate(db: AsyncSession) -> float:
    """Calculate platform error rate (placeholder)."""
    # This would integrate with your error tracking system
    return 0.5  # Example: 0.5% error rate

async def _get_top_performers(db: AsyncSession, limit: int) -> List[dict]:
    """Get top performing users this week."""
    week_ago = datetime.utcnow() - timedelta(days=7)

    stmt = select(
        models.User.username,
        func.count(models.TaskSubmission.id).label('completions')
    ).select_from(models.User).join(
        models.TaskSubmission, models.User.id == models.TaskSubmission.user_id
    ).where(
        and_(
            models.TaskSubmission.status == "approved",
            models.TaskSubmission.submitted_at >= week_ago
        )
    ).group_by(
        models.User.id, models.User.username
    ).order_by(desc('completions')).limit(limit)

    result = await db.execute(stmt)
    return [
        {"username": row.username, "completions": row.completions}
        for row in result.all()
    ]

async def _get_recent_activities(db: AsyncSession, limit: int) -> List[dict]:
    """Get recent platform activities."""
    stmt = select(models.Activity).order_by(
        desc(models.Activity.created_at)
    ).limit(limit)

    result = await db.execute(stmt)
    activities = result.scalars().all()

    return [
        {
            "username": activity.username,
            "action": activity.action,
            "detail": activity.detail,
            "created_at": activity.created_at
        }
        for activity in activities
    ]

async def _award_points_and_xp(user: models.User, task: models.Task, db: AsyncSession):
    """Award points and XP for approved submissions."""
    user.xp += task.xp_reward
    user.level = (user.xp // 100) + 1

async def _get_total_users(db: AsyncSession) -> int:
    """Get total user count."""
    stmt = select(func.count(models.User.id))
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _get_total_submissions(db: AsyncSession, since_date: datetime) -> int:
    """Get total submissions since date."""
    stmt = select(func.count(models.TaskSubmission.id)).where(
        models.TaskSubmission.submitted_at >= since_date
    )
    result = await db.execute(stmt)
    return result.scalar() or 0

async def _get_avg_daily_active_users(db: AsyncSession, since_date: datetime) -> float:
    """Get average daily active users."""
    days = (datetime.utcnow() - since_date).days
    if days == 0:
        return 0

    stmt = select(func.count(models.User.id.distinct())).select_from(
        models.TaskSubmission
    ).join(models.User).where(
        models.TaskSubmission.submitted_at >= since_date
    )
    result = await db.execute(stmt)
    total_active = result.scalar() or 0

    return round(total_active / max(days, 1), 2)

# =========================
# 📧 Background Tasks
# =========================

async def _notify_admins_flagged_content(submission_id: int, reason: str):
    """Notify other admins about flagged content."""
    # Implementation for admin notifications
    pass

async def _send_bulk_review_notifications(emails: List[str], approved: bool, notes: str):
    """Send bulk email notifications for reviewed submissions."""
    # Implementation for bulk email notifications
    pass

async def _notify_user_status_change(email: str, username: str, new_status: str, reason: str):
    """Notify user about status change."""
    # Implementation for user status change notification
    pass
