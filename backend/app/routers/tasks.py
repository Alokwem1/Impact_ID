"""
Tasks module for Impact ID application.
"""


from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
import logging

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlalchemy import func, and_, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, selectinload

from app import models, database, auth, schemas
from app.utils.email import send_email


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["Tasks"])

# ========================
# 🛠️ Admin: Task Management
# ========================

@router.post("/", response_model=schemas.TaskDetail, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: schemas.TaskCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.has_role_async("admin")),
):
    """
    🎯 Enhanced admin endpoint to create a new task with comprehensive validation.
    """
    try:
        # Enhanced validation
        if task_data.type == "quiz":
            if not task_data.correct_answer:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz tasks must have a correct answer."
                ) from e
            if not task_data.quiz_question:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz tasks must have a question."
                ) from e

        if task_data.xp_reward < 1 or task_data.xp_reward > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="XP reward must be between 1 and 1000."
            ) from e

        if task_data.essence_reward and (task_data.essence_reward < 0 or task_data.essence_reward > 100):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Essence reward must be between 0 and 100."
            ) from e

        # ✅ CRITICAL FIX: Use correct field names from models
        new_task = models.Task(
            title=task_data.title,
            type=task_data.type,
            difficulty=task_data.difficulty,
            instructions=task_data.instructions,
            category=task_data.category,
            tags=task_data.tags,
            quiz_question=task_data.quiz_question,
            correct_answer=task_data.correct_answer,
            xp_reward=task_data.xp_reward,
            essence_reward=getattr(task_data, 'essence_reward', 0),
            time_limit_minutes=task_data.time_limit_minutes,
            max_attempts=getattr(task_data, 'max_attempts', 3),
            requires_review=getattr(task_data, 'requires_review', True),
            is_featured=getattr(task_data, 'is_featured', False),
            scheduled_start=task_data.scheduled_start,
            scheduled_end=task_data.scheduled_end,
            prerequisites=task_data.prerequisites or [],
            active=True,
            created_by_user_id=current_user.id,  # ✅ FIXED: Correct field name
            created_at=datetime.utcnow(),
            completion_count=0,
            success_rate=0.0
        )

        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)

        # Background task to notify users of new task
        background_tasks.add_task(_notify_users_new_task, new_task.id, new_task.title)

        logger.info("New task created: %s (ID: {new_task.id}) by {current_user.username}", new_task.title)
        return new_task

    except HTTPException as e:
        raise
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Task with this title already exists."
        ) from e
    except Exception as e:
        await db.rollback()
        logger.error("Task creation error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task creation service temporarily unavailable"
        ) from e

@router.put("/{task_id}", response_model=schemas.TaskDetail)
async def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.has_role_async("admin")),
):
    """
    ✏️ Enhanced admin endpoint to update an existing task.
    """
    try:
        task = await db.get(models.Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            ) from e

        # Validate updates
        update_data = task_data.model_dump(exclude_unset=True)

        # Special validation for quiz updates
        if getattr(update_data, "type", None) == 'quiz' or task.type == 'quiz':
            if 'quiz_question' in update_data and not update_data['quiz_question']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz tasks must have a question"
                ) from e
            if 'correct_answer' in update_data and not update_data['correct_answer']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Quiz tasks must have a correct answer"
                ) from e

        # Update fields
        for field, value in update_data.items():
            setattr(task, field, value)

        task.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(task)

        logger.info("Task updated: %s (ID: {task.id}) by {current_user.username}", task.title)
        return task

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Task update error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task update service temporarily unavailable"
        ) from e

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.has_role_async("admin")),
):
    """
    🗑️ Enhanced admin endpoint to soft delete a task.
    """
    try:
        task = await db.get(models.Task, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            ) from e

        # Soft delete
        task.active = False
        task.updated_at = datetime.utcnow()
        await db.commit()

        logger.info("Task deleted: %s (ID: {task.id}) by {current_user.username}", task.title)
        return {"message": "Task deleted successfully", "task_id": task_id}

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Task deletion error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task deletion service temporarily unavailable"
        ) from e

@router.post("/review/{submission_id}", response_model=schemas.AdminSubmissionOut)
async def review_submission(
    submission_id: int,
    review_data: schemas.SubmissionReview,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.has_role_async("admin")),
):
    """
    ✅ Enhanced admin endpoint to approve or decline a pending submission.
    """
    try:
        # ✅ CRITICAL FIX: Use TaskSubmission instead of TaskLog
        stmt = select(models.TaskSubmission).options(
            joinedload(models.TaskSubmission.user),
            joinedload(models.TaskSubmission.task)
        ).where(models.TaskSubmission.id == submission_id)

        result = await db.execute(stmt)
        submission = result.scalars().first()

        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            ) from e

        if submission.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Submission has already been reviewed"
            ) from e

        # Update submission
        submission.status = "approved" if review_data.approve else "rejected"
        submission.reviewed_at = datetime.utcnow()
        submission.reviewed_by_user_id = current_user.id
        submission.feedback = review_data.notes

        if review_data.approve:
            # Award XP and essence
            submission.xp_awarded = submission.task.xp_reward
            submission.essence_awarded = getattr(submission.task, 'essence_reward', 0)

            await _award_points_and_xp(submission.user, submission.task, db)

            # Background task to send approval email
            background_tasks.add_task(
                _send_approval_email,
                submission.user.email,
                submission.user.username,
                submission.task.title
            )
        else:
            # Background task to send rejection email with feedback
            background_tasks.add_task(
                _send_rejection_email,
                submission.user.email,
                submission.user.username,
                submission.task.title,
                review_data.notes
            )

        await db.commit()

        logger.info("Submission reviewed: %s - {submission.status} by {current_user.username}", submission.id)

        return schemas.AdminSubmissionOut(
            id=submission.id,
            task_id=submission.task_id,
            task_title=submission.task.title,
            user_id=submission.user_id,
            username=submission.user.username,
            response=submission.response,
            submitted_at=submission.submitted_at,
            status=submission.status,
            reviewed_at=submission.reviewed_at,
            reviewed_by=current_user.id,
            review_notes=submission.feedback
        )

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Submission review error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Submission review service temporarily unavailable"
        ) from e

# ========================
# 👥 User: Task Interaction
# ========================

@router.get("/", response_model=List[schemas.TaskDetail])
async def get_task_feed(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty level"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    featured: Optional[bool] = Query(None, description="Filter featured tasks"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional_async)
):
    """
    📋 Enhanced task feed with comprehensive filtering and user progress tracking.
    """
    try:
        # Build base query with proper filtering
        stmt = select(models.Task).where(models.Task.active.is_(True))

        # Apply filters
        if category:
            stmt = stmt.where(models.Task.category == category)
        if difficulty:
            stmt = stmt.where(models.Task.difficulty == difficulty)
        if featured is not None:
            stmt = stmt.where(models.Task.is_featured == featured)

        # Apply ordering - featured tasks first, then by creation date
        stmt = stmt.order_by(
            desc(models.Task.is_featured),
            desc(models.Task.created_at)
        ).offset(offset).limit(limit)

        result = await db.execute(stmt)
        tasks = result.scalars().all()

        if not current_user:
            # Return basic task info for anonymous users
            return [schemas.TaskDetail.model_validate(task) for task in tasks]

        # ✅ CRITICAL FIX: Use TaskSubmission instead of TaskLog
        # Get user submissions for progress tracking
        submission_stmt = select(models.TaskSubmission).where(
            models.TaskSubmission.user_id == current_user.id
        )
        submission_result = await db.execute(submission_stmt)
        user_submissions = {
            sub.task_id: {
                "status": sub.status,
                "submitted_at": sub.submitted_at,
                "response": sub.response,
                "score": sub.score
            }
            for sub in submission_result.scalars().all()
        }

        # Filter by completion status if requested
        if completed is not None:
            if completed:
                tasks = [task for task in tasks if task.id in user_submissions]
            else:
                tasks = [task for task in tasks if task.id not in user_submissions]

        # Enrich tasks with user submission data
        task_details = []
        for task in tasks:
            detail = schemas.TaskDetail.model_validate(task)
            submission_data = user_submissions.get(task.id)
            if submission_data:
                detail.user_submission_status = submission_data["status"]
                detail.user_submitted_at = submission_data["submitted_at"]
                detail.user_best_score = getattr(submission_data, "score", None)
            task_details.append(detail)

        return task_details

    except Exception as e:
        logger.error("Task feed error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task feed service temporarily unavailable"
        ) from e

@router.get("/{task_id}", response_model=schemas.TaskOut)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional_async)
):
    """
    📝 Get detailed information about a specific task with user progress.
    """
    try:
        stmt = select(models.Task).options(
            selectinload(models.Task.submissions)
        ).where(models.Task.id == task_id)

        result = await db.execute(stmt)
        task = result.scalars().first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            ) from e

        if not task.active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task is no longer available"
            ) from e

        # Add user submission status if authenticated
        if current_user:
            # ✅ CRITICAL FIX: Use TaskSubmission instead of TaskLog
            submission_stmt = select(models.TaskSubmission).where(
                and_(
                    models.TaskSubmission.user_id == current_user.id,
                    models.TaskSubmission.task_id == task.id
                )
            )
            submission_result = await db.execute(submission_stmt)
            submission = submission_result.scalars().first()

            if submission:
                task.user_submission_status = submission.status
                task.user_submitted_at = submission.submitted_at
                task.user_attempts_used = 1  # Could count actual attempts
                task.user_best_score = submission.score

        return task

    except HTTPException as e:
        raise
    except Exception as e:
        logger.error("Get task error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task service temporarily unavailable"
        ) from e

@router.post("/{task_id}/submit", response_model=schemas.TaskSubmissionResponse)
async def submit_task(
    task_id: int,
    submission: schemas.TaskSubmission,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_async),
):
    """
    📝 Enhanced user endpoint to submit a response for a specific task.
    """
    try:
        # Get task
        task = await db.get(models.Task, task_id)
        if not task or not task.active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or is inactive"
            ) from e

        # ✅ CRITICAL FIX: Use TaskSubmission instead of TaskLog
        # Check for existing submission
        existing_stmt = select(models.TaskSubmission).where(
            and_(
                models.TaskSubmission.user_id == current_user.id,
                models.TaskSubmission.task_id == task.id
            )
        )
        existing_result = await db.execute(existing_stmt)
        existing_submission = existing_result.scalars().first()

        if existing_submission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted this task"
            ) from e

        # Enhanced validation
        if not submission.response or len(submission.response.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Response must be at least 5 characters long"
            ) from e

        # Check time limit if specified
        if task.time_limit_minutes and submission.time_spent_minutes:
            if submission.time_spent_minutes > task.time_limit_minutes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Submission exceeds time limit of {task.time_limit_minutes} minutes"
                ) from e

        # Determine submission status and score
        submission_status = "pending"
        auto_approved = False
        score = None

        if task.type == "quiz" and task.correct_answer:
            # Auto-grade quiz submissions
            is_correct = submission.response.strip().lower() == task.correct_answer.strip().lower()
            submission_status = "approved" if is_correct else "rejected"
            auto_approved = is_correct
            score = 100.0 if is_correct else 0.0

        # ✅ CRITICAL FIX: Create TaskSubmission instead of TaskLog
        new_submission = models.TaskSubmission(
            user_id=current_user.id,
            task_id=task.id,
            response=submission.response,
            attachments=submission.attachments or [],
            status=submission_status,
            score=score,
            submitted_at=datetime.utcnow(),
            time_spent_minutes=submission.time_spent_minutes,
            attempt_number=1  # Could implement multiple attempts
        )

        if auto_approved:
            new_submission.xp_awarded = task.xp_reward
            new_submission.essence_awarded = getattr(task, 'essence_reward', 0)

        db.add(new_submission)

        # Award points for auto-approved submissions
        if auto_approved:
            await _award_points_and_xp(current_user, task, db)

        # Update task statistics
        task.completion_count += 1
        if auto_approved:
            # Update success rate (simplified calculation)
            total_submissions = task.completion_count
            task.success_rate = ((task.success_rate * (total_submissions - 1)) + (100 if auto_approved else 0)) / total_submissions

        await db.commit()
        await db.refresh(new_submission)

        # Background tasks for notifications
        if auto_approved:
            background_tasks.add_task(
                _send_auto_approval_email,
                current_user.email,
                current_user.username,
                task.title
            )
        else:
            background_tasks.add_task(
                _send_submission_confirmation,
                current_user.email,
                current_user.username,
                task.title
            )

        logger.info("Task submission: %s by {current_user.username} - {submission_status}", task.title)

        # Prepare response
        response_data = schemas.TaskSubmissionResponse(
            submission_id=new_submission.id,
            status=submission_status,
            submitted_at=new_submission.submitted_at,
            auto_approved=auto_approved
        )

        if auto_approved:
            response_data.message = "Correct! XP and points awarded."
            response_data.xp_earned = task.xp_reward
            response_data.essence_earned = getattr(task, 'essence_reward', 0)
            response_data.new_xp_total = current_user.xp
            response_data.new_essence_total = current_user.essence_balance
        else:
            response_data.message = "Submission received and is pending review."

        return response_data

    except HTTPException as e:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Task submission error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task submission service temporarily unavailable"
        ) from e

@router.get("/categories", response_model=List[str])
async def get_task_categories(db: AsyncSession = Depends(database.get_db)):
    """
    📂 Get all available task categories.
    """
    try:
        stmt = select(models.Task.category).distinct().where(
            and_(
                models.Task.active.is_(True),
                models.Task.category.isnot(None)
            )
        )
        result = await db.execute(stmt)
        categories = [cat for cat in result.scalars().all() if cat]
        return sorted(categories)

    except Exception as e:
        logger.error("Get categories error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Categories service temporarily unavailable"
        ) from e

@router.get("/my-submissions", response_model=List[schemas.UserSubmissionOut])
async def get_my_submissions(
    status: Optional[str] = Query(None, description="Filter by submission status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_async),
):
    """
    📋 Get current user's task submissions with enhanced filtering.
    """
    try:
        # ✅ CRITICAL FIX: Use TaskSubmission instead of TaskLog
        stmt = select(models.TaskSubmission).options(
            joinedload(models.TaskSubmission.task)
        ).where(models.TaskSubmission.user_id == current_user.id)

        if status:
            stmt = stmt.where(models.TaskSubmission.status == status)

        stmt = stmt.order_by(
            desc(models.TaskSubmission.submitted_at)
        ).offset(offset).limit(limit)

        result = await db.execute(stmt)
        submissions = result.scalars().all()

        return [
            schemas.UserSubmissionOut(
                id=sub.id,
                task_id=sub.task_id,
                task_title=sub.task.title,
                response=sub.response,
                status=sub.status,
                score=sub.score,
                submitted_at=sub.submitted_at,
                reviewed_at=sub.reviewed_at,
                feedback=sub.feedback,
                xp_awarded=sub.xp_awarded or 0,
                essence_awarded=sub.essence_awarded or 0
            )
            for sub in submissions
        ]

    except Exception as e:
        logger.error("Get user submissions error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Submissions service temporarily unavailable"
        ) from e

# ========================
# 📊 Analytics & Statistics
# ========================

@router.get("/stats/overview", response_model=Dict[str, Any])
async def get_task_statistics(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(auth.has_role_async("admin"))
):
    """
    📊 Get comprehensive task statistics for administrators.
    """
    try:
        # Total tasks
        total_tasks_stmt = select(func.count(models.Task.id)).where(models.Task.active.is_(True))
        total_tasks_result = await db.execute(total_tasks_stmt)
        total_tasks = total_tasks_result.scalar() or 0

        # Total submissions
        total_submissions_stmt = select(func.count(models.TaskSubmission.id))
        total_submissions_result = await db.execute(total_submissions_stmt)
        total_submissions = total_submissions_result.scalar() or 0

        # Pending submissions
        pending_submissions_stmt = select(func.count(models.TaskSubmission.id)).where(
            models.TaskSubmission.status == "pending"
        )
        pending_submissions_result = await db.execute(pending_submissions_stmt)
        pending_submissions = pending_submissions_result.scalar() or 0

        # Most popular categories
        category_stats_stmt = select(
            models.Task.category,
            func.count(models.Task.id).label('task_count')
        ).where(
            models.Task.active.is_(True)
        ).group_by(models.Task.category).order_by(desc('task_count')).limit(5)

        category_stats_result = await db.execute(category_stats_stmt)
        popular_categories = [
            {"category": row.category, "count": row.task_count}
            for row in category_stats_result.all()
        ]

        return {
            "total_tasks": total_tasks,
            "total_submissions": total_submissions,
            "pending_submissions": pending_submissions,
            "popular_categories": popular_categories,
            "generated_at": datetime.utcnow()
        }

    except Exception as e:
        logger.error("Task statistics error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Statistics service temporarily unavailable"
        ) from e

# ========================
# ⚙️ Internal Helper Functions
# ========================

async def _award_points_and_xp(user: models.User, task: models.Task, db: AsyncSession):
    """
    🎯 Enhanced function to handle points, XP, streaks, and level progression.
    """
    try:
        # Award XP and essence
        user.xp += task.xp_reward
        if hasattr(task, 'essence_reward') and task.essence_reward:
            user.essence_balance += task.essence_reward

        # Calculate new level
        user.level = (user.xp // 100) + 1

        # Handle streak calculation
        today = date.today()
        if hasattr(user, 'last_task_date'):
            if user.last_task_date == today - timedelta(days=1):
                user.streak += 1
            elif user.last_task_date != today:
                user.streak = 1
        else:
            user.streak = 1

        user.last_task_date = today

        # Try to award badges
        await _try_award_badges(user, db)

        # Log activity
        activity = models.Activity(
            user_id=user.id,
            username=user.username,
            action="completed_task",
            detail=f"Completed '{task.title}' (+{task.xp_reward} XP)",
            created_at=datetime.utcnow()
        )
        db.add(activity)

    except Exception as e:
        logger.error("Award points and XP error: %s", e)
        # Don't raise exception here to avoid blocking main submission flow

async def _try_award_badges(user: models.User, db: AsyncSession):
    """
    🏅 Enhanced badge awarding system with comprehensive criteria checking.
    """
    try:
        # Get owned badge IDs
        owned_badges_stmt = select(models.UserBadge.badge_id).where(
            models.UserBadge.user_id == user.id
        )
        owned_result = await db.execute(owned_badges_stmt)
        owned_badge_ids = set(owned_result.scalars().all())

        # Get all available badges
        all_badges_stmt = select(models.Badge)
        badges_result = await db.execute(all_badges_stmt)
        all_badges = badges_result.scalars().all()

        # Get user statistics for criteria checking
        approved_count_stmt = select(func.count(models.TaskSubmission.id)).where(
            and_(
                models.TaskSubmission.user_id == user.id,
                models.TaskSubmission.status == "approved"
            )
        )
        count_result = await db.execute(approved_count_stmt)
        approved_count = count_result.scalar() or 0

        for badge in all_badges:
            if badge.id in owned_badge_ids:
                continue

            criteria = badge.criteria.lower() if badge.criteria else ""
            awarded = False

            # Check various criteria
            if criteria == "first_submission" and approved_count >= 1:
                awarded = True
            elif criteria.endswith("_tasks"):
                try:
                    required_tasks = int(criteria.split('_')[0])
                    if approved_count >= required_tasks:
                        awarded = True
                except (ValueError, IndexError) as e:
                    continue
            elif criteria.startswith("xp_"):
                try:
                    required_xp = int(criteria.split('_')[1])
                    if user.xp >= required_xp:
                        awarded = True
                except (ValueError, IndexError) as e:
                    continue
            elif criteria.startswith("streak_"):
                try:
                    required_streak = int(criteria.split('_')[1])
                    if getattr(user, 'streak', 0) >= required_streak:
                        awarded = True
                except (ValueError, IndexError) as e:
                    continue
            elif criteria.startswith("level_"):
                try:
                    required_level = int(criteria.split('_')[1])
                    if user.level >= required_level:
                        awarded = True
                except (ValueError, IndexError) as e:
                    continue

            if awarded:
                # Award badge
                user_badge = models.UserBadge(
                    user_id=user.id,
                    badge_id=badge.id,
                    awarded_at=datetime.utcnow()
                )
                db.add(user_badge)

                # Log activity
                activity = models.Activity(
                    user_id=user.id,
                    username=user.username,
                    action="earned_badge",
                    detail=badge.title,
                    created_at=datetime.utcnow()
                )
                db.add(activity)

                logger.info("Badge awarded: %s to {user.username}", badge.title)

    except Exception as e:
        logger.error("Badge awarding error: %s", e)
        # Don't raise exception to avoid blocking main flow

# ========================
# 📧 Background Tasks
# ========================

async def _notify_users_new_task(task_id: int, task_title: str):
    """
    📢 Notify active users about new tasks (placeholder for full implementation).
    """
    try:
        # This would typically:
        # 1. Get list of active users
        # 2. Send push notifications
        # 3. Send email notifications
        # 4. Create in-app notifications
        logger.info("New task notification: %s (ID: {task_id})", task_title)
        pass
    except Exception as e:
        logger.error("New task notification error: %s", e)

async def _send_approval_email(email: str, username: str, task_title: str):
    """
    ✅ Send email notification for approved submission.
    """
    try:
        await send_email(
            to=email,
            subject=f"🎉 Task Approved: {task_title}",
            body=f"""
            Hi {username},

            Great news! Your submission for '{task_title}' has been approved!

            🎯 XP and points have been awarded to your account
            🏆 Check your profile to see your progress

            Keep up the excellent work!

            Best regards,
            The Impact ID Team
            """
        )
    except Exception as e:
        logger.error("Approval email error: %s", e)

async def _send_rejection_email(email: str, username: str, task_title: str, notes: str):
    """
    📝 Send email notification for rejected submission with feedback.
    """
    try:
        await send_email(
            to=email,
            subject=f"📋 Task Feedback: {task_title}",
            body=f"""
            Hi {username},

            Thank you for your submission for '{task_title}'.

            We've reviewed your work and have some feedback to help you improve:

            📝 Feedback: {notes}

            💪 Don't give up! Please feel free to try again with these suggestions in mind.

            Best regards,
            The Impact ID Team
            """
        )
    except Exception as e:
        logger.error("Rejection email error: %s", e)

async def _send_auto_approval_email(email: str, username: str, task_title: str):
    """
    🎯 Send email for auto-approved quiz submissions.
    """
    try:
        await send_email(
            to=email,
            subject=f"🎯 Quiz Completed: {task_title}",
            body=f"""
            Hi {username},

            Congratulations! 🎉

            You correctly completed the quiz '{task_title}'.

            ✨ XP has been added to your account
            🚀 Your progress has been updated

            Keep learning and growing!

            Best regards,
            The Impact ID Team
            """
        )
    except Exception as e:
        logger.error("Auto-approval email error: %s", e)

async def _send_submission_confirmation(email: str, username: str, task_title: str):
    """
    📧 Send email confirmation for pending submissions.
    """
    try:
        await send_email(
            to=email,
            subject=f"📝 Submission Received: {task_title}",
            body=f"""
            Hi {username},

            We've successfully received your submission for '{task_title}'.

            🔍 Your work is now under review
            📱 You'll be notified of the result soon
            ⏰ Review typically takes 24-48 hours

            Thank you for your participation!

            Best regards,
            The Impact ID Team
            """
        )
    except Exception as e:
        logger.error("Submission confirmation email error: %s", e)

