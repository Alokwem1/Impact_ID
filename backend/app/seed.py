"""
Seed module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
import os
import sys

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio

from app import models, database, auth
from app.utils.email import send_email, EmailTemplate


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ================================
# 🌱 COMPREHENSIVE DATABASE SEEDING
# ================================

class DatabaseSeeder:
    """Advanced database seeding with comprehensive sample data."""

    def __init__(self):
        """__init__ function."""
        self.seeded_items = {
            'users': 0,
            'badges': 0,
            'tasks': 0,
            'categories': 0,
            'threads': 0,
            'activities': 0
        }

    async def seed_all(self, include_sample_data: bool = False) -> Dict[str, Any]:
        """
        🚀 Comprehensive database seeding with all essential data.
        """
        logger.info("🌱 Starting comprehensive database seeding...")
        start_time = datetime.utcnow()

        try:
            async with database.get_async_session() as db:
                # Core system data (always seed)
                await self._seed_admin_users(db)
                await self._seed_system_badges(db)
                await self._seed_task_categories(db)
                await self._seed_starter_tasks(db)

                # Sample data for development/demo (optional)
                if include_sample_data:
                    await self._seed_sample_users(db)
                    await self._seed_sample_threads(db)
                    await self._seed_sample_activities(db)
                    await self._seed_user_progress(db)

                await db.commit()

                execution_time = (datetime.utcnow() - start_time).total_seconds()
                logger.info("✅ Database seeding completed in %.2f seconds", execution_time)
                logger.info("📊 Seeded items: %s", self.seeded_items)

                return {
                    'success': True,
                    'execution_time_seconds': execution_time,
                    'seeded_items': self.seeded_items,
                    'message': 'Database seeding completed successfully'
                }

        except Exception as e:
            logger.error("❌ Database seeding failed: %s", e)
            return {
                'success': False,
                'error': str(e),
                'seeded_items': self.seeded_items
            }

    async def _seed_admin_users(self, db: AsyncSession):
        """🔐 Seed admin and moderator users."""
        logger.info("👑 Seeding admin users...")

        # Check if admin already exists
        admin_stmt = select(models.User).where(models.User.role == "admin")
        admin_result = await db.execute(admin_stmt)
        existing_admin = admin_result.scalars().first()

        if existing_admin:
            logger.info("👑 Admin user already exists, skipping...")
            return

        # Get admin credentials from environment
        admin_email = os.getenv("ADMIN_EMAIL", "admin@impactid.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        moderator_email = os.getenv("MODERATOR_EMAIL", "moderator@impactid.com")

        # Security warning for default password
        if admin_password == "admin123":
            logger.warning("⚠️ SECURITY WARNING: Using default admin password. Set ADMIN_PASSWORD in your .env file.")

        # Create super admin
        admin_user = models.User(
            username="admin",
            email=admin_email,
            hashed_password=auth.hash_password(admin_password),
            role="admin",
            status="active",
            email_verified=True,
            created_at=datetime.utcnow(),
            xp=10000,
            level=50,
            essence_balance=1000,
            bio="System Administrator - Impact ID Platform",
            privacy_settings={
                "show_email": False,
                "show_progress": True,
                "allow_messages": True
            }
        )
        db.add(admin_user)
        self.seeded_items['users'] += 1

        # Create moderator user
        moderator_user = models.User(
            username="moderator",
            email=moderator_email,
            hashed_password=auth.hash_password("moderator123"),
            role="moderator",
            status="active",
            email_verified=True,
            created_at=datetime.utcnow(),
            xp=5000,
            level=25,
            essence_balance=500,
            bio="Platform Moderator - Content Review & Community Management",
            privacy_settings={
                "show_email": False,
                "show_progress": True,
                "allow_messages": True
            }
        )
        db.add(moderator_user)
        self.seeded_items['users'] += 1

        await db.flush()  # Get user IDs

        logger.info("👑 Created admin user: %s", admin_email)
        logger.info("👮 Created moderator user: %s", moderator_email)

    async def _seed_system_badges(self, db: AsyncSession):
        """🏅 Seed essential system badges."""
        logger.info("🏅 Seeding system badges...")

        # Check if badges already exist
        badge_stmt = select(func.count(models.Badge.id))
        badge_result = await db.execute(badge_stmt)
        badge_count = badge_result.scalar() or 0

        if badge_count > 0:
            logger.info("🏅 Badges already exist, skipping...")
            return

        system_badges = [
            # Welcome & Onboarding
            {
                'title': 'Pioneer',
                'description': 'Welcome to Impact ID! Your journey begins here.',
                'criteria': 'Complete account registration and email verification',
                'badge_type': 'milestone',
                'rarity': 'common',
                'color': '#10B981',
                'points_value': 50,
                'icon_url': '/badges/pioneer.svg',
                'auto_award_criteria': {'action': 'user_registered'}
            },
            {
                'title': 'First Steps',
                'description': 'Completed your first impact task!',
                'criteria': 'Submit and get approved for your first task',
                'badge_type': 'achievement',
                'rarity': 'common',
                'color': '#3B82F6',
                'points_value': 100,
                'icon_url': '/badges/first-steps.svg',
                'auto_award_criteria': {'action': 'first_task_completed'}
            },
            {
                'title': 'Thread Weaver',
                'description': 'Wove your first impact thread into meaningful action.',
                'criteria': 'Complete your first thread weaving session',
                'badge_type': 'achievement',
                'rarity': 'common',
                'color': '#8B5CF6',
                'points_value': 75,
                'icon_url': '/badges/thread-weaver.svg',
                'auto_award_criteria': {'action': 'first_thread_woven'}
            },

            # Progress Milestones
            {
                'title': 'Rising Star',
                'description': 'Reached level 10 - your impact is growing!',
                'criteria': 'Reach user level 10',
                'badge_type': 'milestone',
                'rarity': 'uncommon',
                'color': '#F59E0B',
                'points_value': 200,
                'icon_url': '/badges/rising-star.svg',
                'auto_award_criteria': {'level_reached': 10}
            },
            {
                'title': 'Impact Champion',
                'description': 'Reached level 25 - you are making waves!',
                'criteria': 'Reach user level 25',
                'badge_type': 'milestone',
                'rarity': 'rare',
                'color': '#EF4444',
                'points_value': 500,
                'icon_url': '/badges/impact-champion.svg',
                'auto_award_criteria': {'level_reached': 25}
            },
            {
                'title': 'Legendary Changemaker',
                'description': 'Reached level 50 - you are a force of change!',
                'criteria': 'Reach user level 50',
                'badge_type': 'milestone',
                'rarity': 'legendary',
                'color': '#7C3AED',
                'points_value': 1000,
                'icon_url': '/badges/legendary-changemaker.svg',
                'auto_award_criteria': {'level_reached': 50}
            },

            # Task Completion
            {
                'title': 'Task Master',
                'description': 'Completed 10 impact tasks with excellence.',
                'criteria': 'Complete 10 approved tasks',
                'badge_type': 'achievement',
                'rarity': 'uncommon',
                'color': '#059669',
                'points_value': 300,
                'icon_url': '/badges/task-master.svg',
                'auto_award_criteria': {'tasks_completed': 10}
            },
            {
                'title': 'Prolific Contributor',
                'description': 'Completed 50 impact tasks - incredible dedication!',
                'criteria': 'Complete 50 approved tasks',
                'badge_type': 'achievement',
                'rarity': 'rare',
                'color': '#DC2626',
                'points_value': 750,
                'icon_url': '/badges/prolific-contributor.svg',
                'auto_award_criteria': {'tasks_completed': 50}
            },

            # Engagement & Community
            {
                'title': 'Streak Keeper',
                'description': 'Maintained a 7-day activity streak.',
                'criteria': 'Maintain daily activity for 7 consecutive days',
                'badge_type': 'achievement',
                'rarity': 'uncommon',
                'color': '#F97316',
                'points_value': 250,
                'icon_url': '/badges/streak-keeper.svg',
                'auto_award_criteria': {'streak_days': 7}
            },
            {
                'title': 'Dedication Medal',
                'description': 'Maintained a 30-day activity streak!',
                'criteria': 'Maintain daily activity for 30 consecutive days',
                'badge_type': 'achievement',
                'rarity': 'rare',
                'color': '#B91C1C',
                'points_value': 600,
                'icon_url': '/badges/dedication-medal.svg',
                'auto_award_criteria': {'streak_days': 30}
            },

            # Special & Seasonal
            {
                'title': 'Early Adopter',
                'description': 'Joined Impact ID during the beta phase.',
                'criteria': 'Register during beta testing period',
                'badge_type': 'special',
                'rarity': 'epic',
                'color': '#6366F1',
                'points_value': 800,
                'icon_url': '/badges/early-adopter.svg',
                'is_secret': True
            },
            {
                'title': 'Community Builder',
                'description': 'Helped shape the Impact ID community.',
                'criteria': 'Provide valuable feedback and contribute to community growth',
                'badge_type': 'community',
                'rarity': 'epic',
                'color': '#EC4899',
                'points_value': 900,
                'icon_url': '/badges/community-builder.svg',
                'is_secret': True
            }
        ]

        for badge_data in system_badges:
            badge = models.Badge(
                title=badge_data['title'],
                description=badge_data['description'],
                criteria=badge_data['criteria'],
                badge_type=badge_data['badge_type'],
                rarity=badge_data['rarity'],
                color=badge_data['color'],
                points_value=badge_data['points_value'],
                icon_url=getattr(badge_data, "icon_url", None),
                auto_award_criteria=getattr(badge_data, "auto_award_criteria", None),
                is_secret=badge_data.get('is_secret', False),
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(badge)
            self.seeded_items['badges'] += 1

        logger.info("🏅 Created %s system badges", len(system_badges))

    async def _seed_task_categories(self, db: AsyncSession):
        """📂 Seed task categories."""
        logger.info("📂 Seeding task categories...")

        categories = [
            "Sustainability",
            "Education",
            "Health & Wellness",
            "Community Service",
            "Environmental Action",
            "Social Justice",
            "Technology for Good",
            "Economic Empowerment",
            "Cultural Preservation",
            "Disaster Relief",
            "Animal Welfare",
            "Mental Health Awareness"
        ]

        # Categories are typically stored as metadata or in tasks directly
        # For now, we'll just log them as available categories
        logger.info("📂 Available categories: %s", ', '.join(categories))
        self.seeded_items['categories'] = len(categories)

    async def _seed_starter_tasks(self, db: AsyncSession):
        """📋 Seed starter tasks for new users."""
        logger.info("📋 Seeding starter tasks...")

        # Check if tasks already exist
        task_stmt = select(func.count(models.Task.id))
        task_result = await db.execute(task_stmt)
        task_count = task_result.scalar() or 0

        if task_count > 0:
            logger.info("📋 Tasks already exist, skipping...")
            return

        # Get admin user for task creation
        admin_stmt = select(models.User).where(models.User.role == "admin")
        admin_result = await db.execute(admin_stmt)
        admin_user = admin_result.scalars().first()

        if not admin_user:
            logger.warning("⚠️ No admin user found, cannot create starter tasks")
            return

        starter_tasks = [
            {
                'title': 'Welcome to Impact ID!',
                'type': 'quiz',
                'difficulty': 'beginner',
                'instructions': 'Take this quick quiz to learn about the Impact ID platform and how you can make a difference.',
                'category': 'Education',
                'tags': ['welcome', 'onboarding', 'basics'],
                'xp_reward': 50,
                'essence_reward': 10,
                'quiz_question': {
                    'question': 'What is the main goal of Impact ID?',
                    'options': [
                        'To create social media content',
                        'To connect people with meaningful impact opportunities',
                        'To sell products online',
                        'To provide entertainment'
                    ],
                    'correct_answer': 'To connect people with meaningful impact opportunities'
                },
                'max_attempts': 3,
                'requires_review': False
            },
            {
                'title': 'Share Your Impact Vision',
                'type': 'upload',
                'difficulty': 'beginner',
                'instructions': 'Write a short paragraph (100-200 words) about what positive impact means to you. What change would you like to see in the world?',
                'category': 'Community Service',
                'tags': ['vision', 'goals', 'personal-growth'],
                'xp_reward': 100,
                'essence_reward': 20,
                'max_attempts': 2,
                'requires_review': True
            },
            {
                'title': 'Environmental Action Challenge',
                'type': 'challenge',
                'difficulty': 'intermediate',
                'instructions': (
                    "Complete one environmentally-friendly action today (e.g., use reusable bags, plant a seed, reduce water usage) "
                    "and document it with a photo or description."
                ),
                'category': 'Environmental Action',
                'tags': ['environment', 'sustainability', 'action'],
                'xp_reward': 150,
                'essence_reward': 30,
                'time_limit_minutes': 1440,  # 24 hours
                'max_attempts': 1,
                'requires_review': True
            },
            {
                'title': 'Community Impact Survey',
                'type': 'survey',
                'difficulty': 'beginner',
                'instructions': 'Help us understand your community better! Answer this short survey about the most pressing issues in your local area.',
                'category': 'Community Service',
                'tags': ['survey', 'community', 'research'],
                'xp_reward': 75,
                'essence_reward': 15,
                'quiz_question': {
                    'question': 'What do you think is the most important issue facing your community?',
                    'type': 'open_text',
                    'placeholder': 'Share your thoughts about local community challenges...'
                },
                'max_attempts': 1,
                'requires_review': False
            },
            {
                'title': 'Spread the Impact',
                'type': 'social_share',
                'difficulty': 'beginner',
                'instructions': 'Share Impact ID with your network! Post about your positive impact journey on social media and include #ImpactID. Paste the link to your post as your response.',
                'category': 'Community Service',
                'tags': ['social-media', 'sharing', 'community-growth'],
                'xp_reward': 80,
                'essence_reward': 15,
                'max_attempts': 1,
                'requires_review': True
            }
        ]

        for task_data in starter_tasks:
            task = models.Task(
                title=task_data['title'],
                type=task_data['type'],
                difficulty=task_data['difficulty'],
                instructions=task_data['instructions'],
                category=task_data['category'],
                tags=task_data['tags'],
                xp_reward=task_data['xp_reward'],
                essence_reward=task_data['essence_reward'],
                quiz_question=getattr(task_data, "quiz_question", None),
                time_limit_minutes=getattr(task_data, "time_limit_minutes", None),
                max_attempts=task_data['max_attempts'],
                requires_review=task_data['requires_review'],
                active=True,
                created_by_user_id=admin_user.id,
                created_at=datetime.utcnow()
            )
            db.add(task)
            self.seeded_items['tasks'] += 1

        logger.info("📋 Created %s starter tasks", len(starter_tasks))

    async def _seed_sample_users(self, db: AsyncSession):
        """👥 Seed sample users for development/demo."""
        logger.info("👥 Seeding sample users...")

        sample_users = [
            {
                'username': 'alex_green',
                'email': 'alex@example.com',
                'bio': 'Environmental advocate passionate about sustainable living.',
                'location': 'San Francisco, CA',
                'xp': 2500,
                'level': 15,
                'essence_balance': 300,
                'streak': 12
            },
            {
                'username': 'maria_educator',
                'email': 'maria@example.com',
                'bio': 'Teacher working to improve education access in underserved communities.',
                'location': 'Austin, TX',
                'xp': 3200,
                'level': 18,
                'essence_balance': 450,
                'streak': 8
            },
            {
                'username': 'david_tech',
                'email': 'david@example.com',
                'bio': 'Software developer using technology to solve social problems.',
                'location': 'Seattle, WA',
                'xp': 1800,
                'level': 12,
                'essence_balance': 200,
                'streak': 5
            }
        ]

        for user_data in sample_users:
            user = models.User(
                username=user_data['username'],
                email=user_data['email'],
                hashed_password=auth.hash_password('demo123'),
                role='user',
                status='active',
                email_verified=True,
                bio=user_data['bio'],
                location=user_data['location'],
                xp=user_data['xp'],
                level=user_data['level'],
                essence_balance=user_data['essence_balance'],
                streak=user_data['streak'],
                created_at=datetime.utcnow() - timedelta(days=30),
                last_active=datetime.utcnow() - timedelta(hours=2),
                privacy_settings={
                    "show_email": False,
                    "show_progress": True,
                    "allow_messages": True
                }
            )
            db.add(user)
            self.seeded_items['users'] += 1

        logger.info("👥 Created %s sample users", len(sample_users))

    async def _seed_sample_threads(self, db: AsyncSession):
        """🧵 Seed sample impact threads."""
        logger.info("🧵 Seeding sample impact threads...")

        sample_threads = [
            {
                'data_type': 'news',
                'content': 'https://example.com/renewable-energy-breakthrough',
                'meta_data': {
                    'title': 'Revolutionary Solar Panel Technology Achieves 47% Efficiency',
                    'summary': 'Scientists develop new perovskite-silicon solar cells that could transform renewable energy adoption.',
                    'source': 'Science Daily',
                    'category': 'sustainability',
                    'quality_score': 9.2,
                    'relevance_score': 8.8
                }
            },
            {
                'data_type': 'article',
                'content': 'https://example.com/education-initiative',
                'meta_data': {
                    'title': 'Community-Led Education Program Reaches 10,000 Students',
                    'summary': 'Local volunteers create after-school programs that improve literacy rates by 40%.',
                    'source': 'Education Weekly',
                    'category': 'education',
                    'quality_score': 8.5,
                    'relevance_score': 9.1
                }
            },
            {
                'data_type': 'research',
                'content': 'https://example.com/mental-health-study',
                'meta_data': {
                    'title': 'Community Gardens Shown to Reduce Depression by 30%',
                    'summary': 'Research demonstrates significant mental health benefits from community gardening programs.',
                    'source': 'Journal of Environmental Psychology',
                    'category': 'health',
                    'quality_score': 9.0,
                    'relevance_score': 8.5
                }
            }
        ]

        for thread_data in sample_threads:
            thread = models.ImpactThread(
                data_type=thread_data['data_type'],
                content=thread_data['content'],
                meta_data=thread_data['meta_data'],
                status='raw',
                created_at=datetime.utcnow() - timedelta(hours=12),
                is_active=True
            )
            db.add(thread)
            self.seeded_items['threads'] += 1

        logger.info("🧵 Created %s sample threads", len(sample_threads))

    async def _seed_sample_activities(self, db: AsyncSession):
        """📜 Seed sample activities for the activity feed."""
        logger.info("📜 Seeding sample activities...")

        # Get sample users
        users_stmt = select(models.User).where(models.User.role == 'user')
        users_result = await db.execute(users_stmt)
        users = users_result.scalars().all()

        if not users:
            logger.info("📜 No sample users found, skipping activity seeding")
            return

        sample_activities = [
            {
                'action': 'earned_badge',
                'detail': 'Pioneer',
                'meta_data': {'badge_type': 'milestone', 'points_earned': 50}
            },
            {
                'action': 'completed_task',
                'detail': 'Welcome to Impact ID!',
                'meta_data': {'xp_earned': 50, 'task_type': 'quiz'}
            },
            {
                'action': 'level_up',
                'detail': 'Level 15',
                'meta_data': {'previous_level': 14, 'new_level': 15}
            },
            {
                'action': 'thread_woven',
                'detail': 'Environmental Action',
                'meta_data': {'essence_earned': 25, 'category': 'sustainability'}
            }
        ]

        for i, activity_data in enumerate(sample_activities):
            if i < len(users):
                user = users[i]
                activity = models.Activity(
                    user_id=user.id,
                    username=user.username,
                    action=activity_data['action'],
                    detail=activity_data['detail'],
                    meta_data=activity_data['metadata'],
                    created_at=datetime.utcnow() - timedelta(hours=i * 2),
                    is_public=True
                )
                db.add(activity)
                self.seeded_items['activities'] += 1

        logger.info("📜 Created %s sample activities", len(sample_activities))

    async def _seed_user_progress(self, db: AsyncSession):
        """📈 Seed some user progress and achievements."""
        logger.info("📈 Seeding user progress...")

        # Get sample users and admin
        users_stmt = select(models.User).where(models.User.role.in_(['user', 'admin']))
        users_result = await db.execute(users_stmt)
        users = users_result.scalars().all()

        # Get some badges
        badges_stmt = select(models.Badge).limit(3)
        badges_result = await db.execute(badges_stmt)
        badges = badges_result.scalars().all()

        if not users or not badges:
            logger.info("📈 Insufficient data for progress seeding")
            return

        # Award some badges to users
        for user in users[:2]:  # Award to first 2 users
            for badge in badges[:2]:  # Award first 2 badges
                user_badge = models.UserBadge(
                    user_id=user.id,
                    badge_id=badge.id,
                    awarded_at=datetime.utcnow() - timedelta(days=5)
                )
                db.add(user_badge)

        logger.info("📈 Seeded user progress and badge awards")

# ================================
# 🎯 MAIN SEEDING FUNCTIONS
# ================================

async def seed_database_async(include_sample_data: bool = False) -> Dict[str, Any]:
    """
    🚀 Main async seeding function.
    """
    seeder = DatabaseSeeder()
    return await seeder.seed_all(include_sample_data)

def seed_database(include_sample_data: bool = False) -> Dict[str, Any]:
    """
    🔄 Sync wrapper for backward compatibility.
    """
    return asyncio.run(seed_database_async(include_sample_data))

async def reset_database_async() -> Dict[str, Any]:
    """
    ⚠️ DANGEROUS: Reset database by dropping all tables and recreating them.
    Only use in development!
    """
    environment = os.getenv("ENVIRONMENT", "development")
    if environment.lower() == "production":
        raise ValueError("❌ Cannot reset database in production environment!")

    logger.warning("⚠️ RESETTING DATABASE - ALL DATA WILL BE LOST!")

    try:
        # Drop and recreate all tables
        async with database.engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.drop_all)
            await conn.run_sync(models.Base.metadata.create_all)

        logger.info("🗑️ Database reset completed")

        # Seed with fresh data
        return await seed_database_async(include_sample_data=True)

    except Exception as e:
        logger.error("❌ Database reset failed: %s", e)
        return {'success': False, 'error': str(e)}

def reset_database() -> Dict[str, Any]:
    """
    🔄 Sync wrapper for database reset.
    """
    return asyncio.run(reset_database_async())

# ================================
# 🧪 UTILITY FUNCTIONS
# ================================

async def check_seeding_status() -> Dict[str, Any]:
    """
    🔍 Check current database seeding status.
    """
    try:
        async with database.get_async_session() as db:
            # Count various entities
            counts = {}

            entities = [
                ('users', models.User),
                ('badges', models.Badge),
                ('tasks', models.Task),
                ('threads', models.ImpactThread),
                ('activities', models.Activity)
            ]

            for name, model in entities:
                stmt = select(func.count(model.id))
                result = await db.execute(stmt)
                counts[name] = result.scalar() or 0

            # Check for admin user
            admin_stmt = select(models.User).where(models.User.role == "admin")
            admin_result = await db.execute(admin_stmt)
            has_admin = admin_result.scalars().first() is not None

            return {
                'counts': counts,
                'has_admin': has_admin,
                'is_seeded': has_admin and counts['badges'] > 0,
                'recommendations': _get_seeding_recommendations(counts, has_admin)
            }

    except Exception as e:
        logger.error("❌ Failed to check seeding status: %s", e)
        return {'error': str(e)}

def _get_seeding_recommendations(counts: Dict[str, int], has_admin: bool) -> List[str]:
    """Get recommendations based on current database state."""
    recommendations = []

    if not has_admin:
        recommendations.append("Create admin user for system management")

    if counts['badges'] == 0:
        recommendations.append("Seed system badges for user achievements")

    if counts['tasks'] == 0:
        recommendations.append("Add starter tasks for user onboarding")

    if counts['users'] <= 2:
        recommendations.append("Consider adding sample users for development")

    if counts['threads'] == 0:
        recommendations.append("Seed sample threads for weaving demonstrations")

    if not recommendations:
        recommendations.append("Database appears to be properly seeded!")

    return recommendations

# ================================
# 🎯 CLI INTERFACE
# ================================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "reset":
            print("⚠️ This will RESET the entire database. Are you sure? (y/N): ", end="")
            confirm = input().lower()
            if confirm == 'y':
                result = reset_database()
                print(f"Reset result: {result}")
            else:
                print("Database reset cancelled.")

        elif command == "sample":
            result = seed_database(include_sample_data=True)
            print(f"Seeding result: {result}")

        elif command == "status":
            result = asyncio.run(check_seeding_status())
            print(f"Database status: {result}")

        else:
            print("Usage: python seed.py [reset|sample|status]")
            print("  reset  - Reset database and seed with sample data")
            print("  sample - Seed database with sample data")
            print("  status - Check current seeding status")

    else:
        # Default seeding
        result = seed_database()
        print(f"Seeding result: {result}")
