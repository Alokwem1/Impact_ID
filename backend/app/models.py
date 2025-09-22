"""
Models module for Impact ID application.
"""


from datetime import datetime
from sqlalchemy.orm import relationship
from typing import Dict, Any
import uuid

from sqlalchemy import (
    Boolean, Column, Date, DateTime, ForeignKey, Index, Integer,
    JSON, String, Text, Float, UniqueConstraint, func
)
from sqlalchemy.ext.hybrid import hybrid_property

from app.database import Base
from app.utils.common import utcnow, TableNames, CascadeOptions
# ================================
# 👤 ENHANCED USER MODEL
# ================================

class User(Base):
    """User class for Impact ID application."""
    __tablename__ = TableNames.USERS

    # Core identity
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=utcnow)
    last_active = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_task_date = Column(Date, nullable=True)

    # Profile & Social
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(100), nullable=True)
    website = Column(String(200), nullable=True)
    social_links = Column(JSON, nullable=True)  # {"twitter": "handle", "linkedin": "profile"}
    privacy_settings = Column(JSON, nullable=True)  # Privacy preferences

    # Security & Verification
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String(256), default=lambda: str(uuid.uuid4()))
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(32), nullable=True)

    # Role & Status
    role = Column(String(20), default="user")  # user, admin, moderator
    status = Column(String(20), default="active")  # active, inactive, banned, deleted

    # Blockchain
    wallet_address = Column(String(100), unique=True, nullable=True)
    wallet_verified = Column(Boolean, default=False)

    # Impact Weaving
    essence_balance = Column(Integer, default=0, nullable=False)
    last_weave_timestamp = Column(DateTime, nullable=True)
    weaving_streak = Column(Integer, default=0)
    total_threads_woven = Column(Integer, default=0)

    # Analytics
    total_login_count = Column(Integer, default=0)
    total_session_time = Column(Integer, default=0)  # in seconds
    referral_code = Column(String(20), unique=True, nullable=True)
    referred_by = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=True)

    # Relationships
    task_submissions = relationship(
        "TaskSubmission",
        back_populates="user",
        cascade=CascadeOptions.ALL_DELETE_ORPHAN,
        foreign_keys="TaskSubmission.user_id",
    )
    badges = relationship(
        "UserBadge",
        back_populates="user",
        cascade=CascadeOptions.ALL_DELETE_ORPHAN,
        foreign_keys="UserBadge.user_id",
    )
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    sessions = relationship("UserSession", back_populates="user", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    activities = relationship("Activity", back_populates="user", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    notifications = relationship("Notification", back_populates="user", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    # For TaskLog back_populates
    task_logs = relationship("TaskLog", back_populates="user", cascade=CascadeOptions.ALL_DELETE_ORPHAN)

    # Self-referential relationship for referrals
    referrals = relationship("User", backref="referrer", remote_side=[id])

    @hybrid_property
    def is_active(self):
        """Check if user is active."""
        return self.status == "active"

    @hybrid_property
    def badge_count(self):
        """Get total badge count."""
        return len(self.badges)

    @hybrid_property
    def is_verified(self):
        """Compatibility property for routes expecting 'is_verified'."""
        return self.email_verified

    def __repr__(self):
        """__repr__ function."""
        return f"<User(id={self.id}, username='{self.username}', level={self.level})>"

# ================================
# 📋 ENHANCED TASK MODEL
# ================================

class Task(Base):
    """Task class for Impact ID application."""
    __tablename__ = "tasks"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # quiz, upload, social_share, survey, challenge, etc.
    difficulty = Column(String(20), default="beginner")  # beginner, intermediate, advanced, expert

    # Content
    instructions = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    tags = Column(JSON, nullable=True)  # ["sustainability", "education"]

    # Quiz/Assessment data
    quiz_question = Column(JSON, nullable=True)
    correct_answer = Column(String, nullable=True)

    # Rewards & Limits
    xp_reward = Column(Integer, default=10)
    essence_reward = Column(Integer, default=0)
    time_limit_minutes = Column(Integer, nullable=True)
    max_attempts = Column(Integer, default=3)

    # Status & Scheduling
    active = Column(Boolean, default=True)
    requires_review = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    scheduled_start = Column(DateTime, nullable=True)
    scheduled_end = Column(DateTime, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, nullable=True)
    created_by_user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False)

    # Analytics
    completion_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    average_completion_time = Column(Float, nullable=True)  # in minutes

    # Prerequisites
    prerequisites = Column(JSON, nullable=True)  # [task_id1, task_id2]

    # Relationships
    submissions = relationship("TaskSubmission", back_populates="task", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    # For TaskLog back_populates
    task_logs = relationship("TaskLog", back_populates="task", cascade=CascadeOptions.ALL_DELETE_ORPHAN)
    created_by = relationship("User", foreign_keys=[created_by_user_id])

    def __repr__(self):
        """__repr__ function."""
        return f"<Task(id={self.id}, title='{self.title}', type='{self.type}')>"

# ================================
# 📤 ENHANCED TASK SUBMISSION MODEL
# ================================

class TaskSubmission(Base):
    """TaskSubmission class for Impact ID application."""
    __tablename__ = "task_submissions"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)

    # Submission data
    response = Column(Text, nullable=True)
    attachments = Column(JSON, nullable=True)  # ["url1", "url2"]

    # Status & Review
    status = Column(String(20), default="pending")  # pending, approved, rejected, draft
    feedback = Column(Text, nullable=True)
    score = Column(Float, nullable=True)  # 0-100

    # Timing
    submitted_at = Column(DateTime, default=utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    time_spent_minutes = Column(Integer, nullable=True)

    # Rewards
    xp_awarded = Column(Integer, default=0)
    essence_awarded = Column(Integer, default=0)

    # Metadata
    attempt_number = Column(Integer, default=1)
    reviewed_by_user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="task_submissions", foreign_keys=[user_id])
    task = relationship("Task", back_populates="submissions")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_user_id])

    # Unique constraint to prevent duplicate submissions per attempt
    __table_args__ = (
        UniqueConstraint('user_id', 'task_id', 'attempt_number', name='unique_user_task_attempt'),
    )

    def __repr__(self):
        """__repr__ function."""
        return f"<TaskSubmission(id={self.id}, user_id={self.user_id}, task_id={self.task_id}, status='{self.status}')>"

# ================================
# 🏅 ENHANCED BADGE MODEL
# ================================

class Badge(Base):
    """Badge class for Impact ID application."""
    __tablename__ = "badges"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    criteria = Column(Text, nullable=False)

    # Badge properties
    badge_type = Column(String(20), default="achievement")  # achievement, milestone, special, seasonal, community
    rarity = Column(String(20), default="common")  # common, uncommon, rare, epic, legendary
    color = Column(String(7), default="#3B82F6")  # Hex color code
    icon_url = Column(String(500), nullable=True)
    points_value = Column(Integer, default=10)

    # Auto-awarding
    auto_award_criteria = Column(JSON, nullable=True)  # {"level_reached": 10}
    is_secret = Column(Boolean, default=False)  # Hidden until earned

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    # Analytics
    awarded_count = Column(Integer, default=0)

    # Relationships
    users = relationship("UserBadge", back_populates="badge", cascade=CascadeOptions.ALL_DELETE_ORPHAN)

    def __repr__(self):
        """__repr__ function."""
        return f"<Badge(id={self.id}, title='{self.title}', rarity='{self.rarity}')>"

# ================================
# 🧾 ENHANCED USER BADGE MODEL
# ================================

class UserBadge(Base):
    """UserBadge class for Impact ID application."""
    __tablename__ = "user_badges"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False, index=True)

    # Award details
    awarded_at = Column(DateTime, default=utcnow)
    awarded_reason = Column(Text, nullable=True)
    progress_percentage = Column(Float, default=100.0)  # For partial progress badges

    # Metadata
    awarded_by_system = Column(Boolean, default=True)
    awarded_by_user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="badges", foreign_keys=[user_id])
    badge = relationship("Badge", back_populates="users")
    awarded_by = relationship("User", foreign_keys=[awarded_by_user_id])

    # Unique constraint to prevent duplicate badges
    __table_args__ = (
        UniqueConstraint('user_id', 'badge_id', name='unique_user_badge'),
    )

    def __repr__(self):
        """__repr__ function."""
        return f"<UserBadge(user_id={self.user_id}, badge_id={self.badge_id})>"

# ================================
# 🔐 ENHANCED SESSION MANAGEMENT
# ================================

class UserSession(Base):
    """UserSession class for Impact ID application."""
    __tablename__ = "user_sessions"

    # Core fields
    id = Column(String(128), primary_key=True)  # UUID session ID
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)

    # Session data
    created_at = Column(DateTime, default=utcnow)
    last_seen = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)

    # Device & Location
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    device_fingerprint = Column(String(64), nullable=True)

    # Security
    is_active = Column(Boolean, default=True)
    logout_reason = Column(String(50), nullable=True)  # manual, timeout, security

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        """__repr__ function."""
        return f"<UserSession(id='{self.id}', user_id={self.user_id})>"

# ================================
# 🛡️ PASSWORD RESET TOKEN
# ================================

class PasswordResetToken(Base):
    """PasswordResetToken class for Impact ID application."""
    __tablename__ = "password_reset_tokens"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    token = Column(String(256), unique=True, nullable=False)

    # Status
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)

    # Security
    ip_address = Column(String(45), nullable=True)

    # Relationships
    user = relationship("User", back_populates="reset_tokens")

    def __repr__(self):
        """__repr__ function."""
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id}, used={self.used})>"

# ================================
# 📜 ENHANCED ACTIVITY MODEL
# ================================

class Activity(Base):
    """Activity class for Impact ID application."""
    __tablename__ = "activities"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    username = Column(String(50), nullable=False)  # Denormalized for performance

    # Activity data
    action = Column(String(50), nullable=False)  # task_completed, badge_earned, level_up, etc.
    detail = Column(String(500), nullable=False)
    meta_data = Column(JSON, default=dict, name="metadata")  # Maps to 'metadata' in database

    # Visibility
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow, index=True)

    # Social features
    reaction_counts = Column(JSON, default=dict)  # {"like": 5, "love": 2}
    total_reactions = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="activities")
    reactions = relationship("ActivityReaction", back_populates="activity", cascade=CascadeOptions.ALL_DELETE_ORPHAN)

    def __repr__(self):
        """__repr__ function."""
        return f"<Activity(id={self.id}, action='{self.action}', user_id={self.user_id})>"

# ================================
# ❤️ ACTIVITY REACTION MODEL
# ================================

class ActivityReaction(Base):
    """ActivityReaction class for Impact ID application."""
    __tablename__ = "activity_reactions"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)

    # Reaction data
    reaction_type = Column(String(20), nullable=False)  # like, love, wow, laugh, angry, sad
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    activity = relationship("Activity", back_populates="reactions")
    user = relationship("User")

    # Unique constraint to prevent duplicate reactions
    __table_args__ = (
        UniqueConstraint('activity_id', 'user_id', name='unique_activity_reaction'),
    )

    def __repr__(self):
        """__repr__ function."""
        return f"<ActivityReaction(activity_id={self.activity_id}, user_id={self.user_id}, type='{self.reaction_type}')>"

# ================================
# 📧 NOTIFICATION MODEL
# ================================

class Notification(Base):
    """Notification class for Impact ID application."""
    __tablename__ = "notifications"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)

    # Notification content
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(20), default="info")  # info, success, warning, error

    # Action
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(50), nullable=True)

    # Status
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow, index=True)
    read_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Metadata
    meta_data = Column(JSON, nullable=True, name="metadata")  # Maps to 'metadata' in database

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        """__repr__ function."""
        return f"<Notification(id={self.id}, user_id={self.user_id}, title='{self.title}')>"

# ================================
# 📊 ADMIN ACTION LOG
# ================================

class AdminActionLog(Base):
    """AdminActionLog class for Impact ID application."""
    __tablename__ = "admin_action_logs"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)

    # Action details
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)  # user, task, badge, etc.
    target_id = Column(Integer, nullable=False)

    # Context
    description = Column(Text, nullable=True)
    meta_data = Column(JSON, nullable=True, name="metadata")

    # Timing
    created_at = Column(DateTime, default=utcnow, index=True)

    # Security
    ip_address = Column(String(45), nullable=True)

    # Relationships
    admin = relationship("User")

    def __repr__(self):
        """__repr__ function."""
        return f"<AdminActionLog(id={self.id}, action='{self.action}', admin_id={self.admin_id})>"

# ================================
# ✨ ENHANCED IMPACT THREAD MODEL
# ================================

class ImpactThread(Base):
    """ImpactThread class for Impact ID application."""
    __tablename__ = "impact_threads"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    data_type = Column(String(50), default="url_categorization")
    content = Column(Text, nullable=False)  # Changed from String to Text for longer content

    # Metadata
    meta_data = Column(JSON, nullable=True)
    title = Column(String(500), nullable=True)  # Extracted title
    summary = Column(Text, nullable=True)  # Extracted summary

    # Status & Quality
    status = Column(String(20), default="raw")  # raw, processed, woven, validated, archived
    quality_score = Column(Float, nullable=True)  # 0-10 quality rating
    relevance_score = Column(Float, nullable=True)  # 0-10 relevance rating

    # Categorization
    category = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)  # ["sustainability", "education"]
    source = Column(String(200), nullable=True)  # Source website/platform

    # Engagement
    weaving_count = Column(Integer, default=0)
    average_essence_earned = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=utcnow, index=True)
    processed_at = Column(DateTime, nullable=True)
    last_woven_at = Column(DateTime, nullable=True)

    # Visibility
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Unique constraint on content to prevent duplicates
    __table_args__ = (
        Index('idx_impact_threads_content_hash', 'content'),
        Index('idx_impact_threads_status_created', 'status', 'created_at'),
    )

    def __repr__(self):
        """__repr__ function."""
        return f"<ImpactThread(id={self.id}, status='{self.status}', category='{self.category}')>"

# ================================
# 🧵 THREAD WEAVING LOG
# ================================

class ThreadWeavingLog(Base):
    """ThreadWeavingLog class for Impact ID application."""
    __tablename__ = "thread_weaving_logs"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    thread_id = Column(Integer, ForeignKey("impact_threads.id"), nullable=False, index=True)

    # Weaving data
    category_chosen = Column(String(50), nullable=False)
    insight = Column(Text, nullable=True)
    action_plan = Column(Text, nullable=True)

    # Scoring
    essence_earned = Column(Integer, default=0)
    quality_score = Column(Float, nullable=True)  # AI-assessed quality
    difficulty_rating = Column(Integer, nullable=True)  # User's perceived difficulty 1-5

    # Timing
    woven_at = Column(DateTime, default=utcnow)
    time_spent_seconds = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User")
    thread = relationship("ImpactThread")

    def __repr__(self):
        """__repr__ function."""
        return f"<ThreadWeavingLog(id={self.id}, user_id={self.user_id}, thread_id={self.thread_id})>"

# ================================
# 📊 USER ANALYTICS
# ================================

class UserAnalytics(Base):
    """UserAnalytics class for Impact ID application."""
    __tablename__ = "user_analytics"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)

    # Daily metrics
    xp_gained = Column(Integer, default=0)
    essence_gained = Column(Integer, default=0)
    tasks_completed = Column(Integer, default=0)
    threads_woven = Column(Integer, default=0)
    login_count = Column(Integer, default=0)
    session_duration_minutes = Column(Integer, default=0)

    # Engagement
    activities_created = Column(Integer, default=0)
    reactions_given = Column(Integer, default=0)
    reactions_received = Column(Integer, default=0)

    # Relationships
    user = relationship("User")

    # Unique constraint for one record per user per day
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='unique_user_analytics_date'),
    )

    def __repr__(self):
        """__repr__ function."""
        return f"<UserAnalytics(user_id={self.user_id}, date={self.date})>"

# ================================
# 🔍 SEARCH INDEX
# ================================

class SearchIndex(Base):
    """SearchIndex class for Impact ID application."""
    __tablename__ = "search_index"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # task, user, thread, badge
    entity_id = Column(Integer, nullable=False, index=True)

    # Search data
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=True)  # Extracted keywords

    # Metadata
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    # Search optimization
    search_vector = Column(Text, nullable=True)  # For full-text search

    def __repr__(self):
        """__repr__ function."""
        return f"<SearchIndex(entity_type='{self.entity_type}', entity_id={self.entity_id})>"

# ================================
# 📊 SYSTEM METRICS
# ================================

class SystemMetrics(Base):
    """SystemMetrics class for Impact ID application."""
    __tablename__ = "system_metrics"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(Float, nullable=False)

    # Context
    category = Column(String(50), nullable=True)  # users, tasks, system, performance
    meta_data = Column(JSON, nullable=True)

    # Timing
    recorded_at = Column(DateTime, default=utcnow, index=True)

    def __repr__(self):
        """__repr__ function."""
        return f"<SystemMetrics(metric_name='{self.metric_name}', value={self.metric_value})>"

# ================================
# 🔧 DATABASE INDEXES
# ================================

# Additional indexes for performance optimization
Index('idx_users_email_verified', User.email_verified)
Index('idx_users_role_status', User.role, User.status)
Index('idx_users_xp_level', User.xp, User.level)
Index('idx_tasks_active_category', Task.active, Task.category)
Index('idx_tasks_created_at', Task.created_at)
Index('idx_submissions_status_submitted', TaskSubmission.status, TaskSubmission.submitted_at)
Index('idx_activities_public_created', Activity.is_public, Activity.created_at)
Index('idx_notifications_user_read', Notification.user_id, Notification.is_read)


class TaskLog(Base):
    """Task submission log for tracking user task completions."""
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="task_logs")
    task = relationship("Task", back_populates="task_logs")


class AuditLog(Base):
    """Audit log for tracking admin actions."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(Integer, nullable=False)
    details = Column(Text)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    admin = relationship("User")


class WeaveSubmission(Base):
    """Weaving submission for tracking user weaving activities."""
    __tablename__ = "weave_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey(f"{TableNames.USERS}.id", ondelete="CASCADE"), nullable=False)
    thread_id = Column(Integer, ForeignKey("impact_threads.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    insight = Column(Text, nullable=False)
    essence_earned = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    thread = relationship("ImpactThread")
