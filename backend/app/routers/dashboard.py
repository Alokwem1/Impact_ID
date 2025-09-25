"""User dashboard aggregate endpoints."""
from datetime import timedelta
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app import models, auth
from app.database import get_db
from app.utils.common import utcnow

router = APIRouter(tags=["Dashboard"])  # mounted at /api in main

from app import schemas

_CACHE: dict[str, tuple[float, dict]] = {}
_DASHBOARD_TTL_SECONDS = 30  # short TTL – user-facing, near real-time acceptable


def _cache_get(key: str):
    rec = _CACHE.get(key)
    if not rec:
        return None
    ts, payload = rec
    if time.time() - ts > _DASHBOARD_TTL_SECONDS:
        _CACHE.pop(key, None)
        return None
    return payload

def _cache_set(key: str, payload: dict):
    _CACHE[key] = (time.time(), payload)


@router.get("/dashboard", response_model=schemas.DashboardResponse)
async def get_user_dashboard(
    current_user: models.User = Depends(auth.get_current_user_async),
    db: AsyncSession = Depends(get_db)
):
    """Return aggregated dashboard metrics for the authenticated user.

    Response shape intentionally matches fields consumed by the frontend DashboardPage:
      tasks_completed_today (int)
      this_week_stats: { tasks_completed: int }
      this_month_stats: { xp_earned: int }
      global_rank (int|None)
      daily_goals (optional placeholder)
      is_new_user (bool)
    """
    try:
        now = utcnow()
        start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Count approved submissions for periods
        base_stmt = select(func.count(models.TaskSubmission.id)).where(
            models.TaskSubmission.user_id == current_user.id,
            models.TaskSubmission.status == "approved"
        )

        today_stmt = base_stmt.where(models.TaskSubmission.submitted_at >= start_today)
        week_stmt = base_stmt.where(models.TaskSubmission.submitted_at >= week_ago)
        month_stmt = base_stmt.where(models.TaskSubmission.submitted_at >= month_ago)

        today_count = (await db.execute(today_stmt)).scalar() or 0
        week_count = (await db.execute(week_stmt)).scalar() or 0
        month_count = (await db.execute(month_stmt)).scalar() or 0

        # Try cache first (scoped per user)
        cache_key = f"dash:{current_user.id}"
        cached = _cache_get(cache_key)
        if cached:
            return schemas.DashboardResponse(**cached)

        # Compute XP earned this month via sum of approved task XP in last 30 days
        xp_stmt = (
            select(func.coalesce(func.sum(models.Task.xp_reward), 0))
            .select_from(models.TaskSubmission)
            .join(models.Task, models.TaskSubmission.task_id == models.Task.id)
            .where(
                models.TaskSubmission.user_id == current_user.id,
                models.TaskSubmission.status == "approved",
                models.TaskSubmission.submitted_at >= month_ago,
            )
        )
        xp_earned_month = int((await db.execute(xp_stmt)).scalar() or 0)

        # Basic global rank approximation by counting higher XP users
        rank_stmt = select(func.count(models.User.id)).where(models.User.xp > current_user.xp)
        higher_users = (await db.execute(rank_stmt)).scalar() or 0
        global_rank = higher_users + 1 if current_user.xp is not None else None

        is_new_user = (now - current_user.created_at).days < 3 if current_user.created_at else False

        payload = dict(
            tasks_completed_today=today_count,
            this_week_stats={"tasks_completed": week_count},
            this_month_stats={"xp_earned": xp_earned_month},
            global_rank=global_rank,
            daily_goals=None,
            is_new_user=is_new_user,
        )
        _cache_set(cache_key, payload)
        return schemas.DashboardResponse(**payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to build dashboard") from e
