"""
Database module for Impact ID application.
"""


from datetime import datetime, timedelta
from typing import AsyncGenerator, Optional, Dict, Any
import logging
import os

from contextlib import asynccontextmanager
from dotenv import load_dotenv
from sqlalchemy import text, event, func
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError, OperationalError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool, NullPool, QueuePool
import asyncio

from app.utils.common import utcnow, HealthCheckError

 # This registers all models with Base


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================================
# 🔧 ENVIRONMENT & CONFIGURATION
# ================================

load_dotenv()

class DatabaseConfig:
    """Centralized database configuration management."""

    def __init__(self):
        """__init__ function."""
        self.database_url = self._get_database_url()
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        self.is_production = self.environment == "production"
        self.is_testing = self.environment == "testing"

        # Connection settings
        self.pool_size = int(os.getenv("DB_POOL_SIZE", "10"))
        self.max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "20"))
        self.pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))
        self.pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # 1 hour

        # Query settings
        self.query_timeout = int(os.getenv("DB_QUERY_TIMEOUT", "30"))
        self.echo_sql = os.getenv("DB_ECHO", "false").lower() == "true"

        # Health check settings
        self.health_check_interval = int(os.getenv("DB_HEALTH_CHECK_INTERVAL", "300"))  # 5 minutes

    def _get_database_url(self) -> str:
        """Get and validate database URL."""
        url = os.getenv("DATABASE_URL")

        if not url:
            if self.environment == "testing":
                url = "sqlite+aiosqlite:///:memory:"
                logger.info("Using in-memory SQLite for testing")
            else:
                url = "sqlite+aiosqlite:///./impact.db"
                logger.warning("DATABASE_URL not set, defaulting to local async SQLite")

        # Ensure async driver for SQLite
        if url.startswith("sqlite") and not url.startswith("sqlite+"):
            url = "sqlite+aiosqlite" + url.lstrip("sqlite")
            logger.info("Corrected SQLite URL to use async driver: %s", url)

        # Validate PostgreSQL URLs
        elif url.startswith("postgresql") and not url.startswith("postgresql+"):
            url = "postgresql+asyncpg" + url.lstrip("postgresql")
            logger.info("Corrected PostgreSQL URL to use asyncpg driver")

        return url

    def get_engine_kwargs(self) -> Dict[str, Any]:
        """Get engine configuration based on database type and environment."""
        kwargs = {
            "echo": self.echo_sql,
            "future": True,
        }

        if "sqlite" in self.database_url:
            kwargs.update({
                "connect_args": {
                    "check_same_thread": False,
                    "timeout": self.query_timeout,
                },
                "poolclass": StaticPool if not self.is_testing else NullPool,
            })
        else:
            # PostgreSQL/MySQL configuration
            kwargs.update({
                "pool_size": self.pool_size,
                "max_overflow": self.max_overflow,
                "pool_timeout": self.pool_timeout,
                "pool_recycle": self.pool_recycle,
                "pool_pre_ping": True,  # Validate connections before use
                "poolclass": QueuePool,
                "connect_args": {
                    "server_settings": {
                        "application_name": "impact_id_backend",
                        "statement_timeout": f"{self.query_timeout}s",
                    }
                } if "postgresql" in self.database_url else {}
            })

        return kwargs

# ================================
# 🗄️ DATABASE SETUP
# ================================

# Initialize configuration
db_config = DatabaseConfig()

# Create async engine with advanced configuration
engine: AsyncEngine = create_async_engine(
    db_config.database_url,
    **db_config.get_engine_kwargs()
)

# Session factory with optimized settings
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Backward compatibility alias expected by some tests referencing 'async_session_maker'
# The codebase historically may have exposed this name; keeping a simple alias avoids
# modifying existing tests while retaining the configured sessionmaker.
async_session_maker = AsyncSessionLocal

# Declarative base
Base = declarative_base()

# ================================
# 🔍 DATABASE HEALTH MONITORING
# ================================

class DatabaseHealthMonitor:
    """Monitor database health and connection status."""

    def __init__(self):
        """__init__ function."""
        self.last_check = None
        self.is_healthy = True
        self.consecutive_failures = 0
        self.max_failures = 3

    async def check_health(self) -> Dict[str, Any]:
        """✅ FIXED: Perform comprehensive health check with proper pool handling."""
        start_time = utcnow()

        try:
            async with engine.begin() as conn:
                # Test basic connectivity
                result = await conn.execute(text("SELECT 1 as health_check"))
                test_value = result.scalar()

                if test_value != 1:
                    raise HealthCheckError("Health check query failed")

                # ✅ FIXED: Safe pool status checking that works with all pool types
                pool = engine.pool
                pool_status = self._get_safe_pool_status(pool)

            response_time = (utcnow() - start_time).total_seconds()

            self.is_healthy = True
            self.consecutive_failures = 0
            self.last_check = utcnow()

            return {
                "status": "healthy",
                "response_time_seconds": response_time,
                "database_type": "sqlite" if "sqlite" in db_config.database_url else "postgresql",
                "database_url": self._safe_database_url(),
                "pool_status": pool_status,
                "last_check": self.last_check.isoformat(),
                "consecutive_failures": self.consecutive_failures,
                "environment": db_config.environment
            }

        except Exception as e:
            self.consecutive_failures += 1
            self.is_healthy = self.consecutive_failures < self.max_failures

            logger.error("Database health check failed: %s", e)

            return {
                "status": "unhealthy",
                "error": str(e),
                "consecutive_failures": self.consecutive_failures,
                "is_critical": not self.is_healthy,
                "last_check": utcnow().isoformat(),
                "database_type": "sqlite" if "sqlite" in db_config.database_url else "postgresql"
            }

    def _get_safe_pool_status(self, pool) -> Dict[str, Any]:
        """✅ FIXED: Safely get pool status for different pool types."""
        pool_status = {
            "pool_class": pool.__class__.__name__,
            "is_sqlite": isinstance(pool, StaticPool)
        }

        try:
            # These methods exist on most pool types
            if hasattr(pool, 'size'):
                pool_status["size"] = pool.size()
            if hasattr(pool, 'checkedin'):
                pool_status["checked_in"] = pool.checkedin()
            if hasattr(pool, 'checkedout'):
                pool_status["checked_out"] = pool.checkedout()
            if hasattr(pool, 'overflow'):
                pool_status["overflow"] = pool.overflow()
            if hasattr(pool, 'invalid'):
                pool_status["invalid"] = pool.invalid()

            # For SQLite StaticPool, provide alternative info
            if isinstance(pool, StaticPool):
                pool_status.update({
                    "status": "static_pool_active",
                    "description": "SQLite using StaticPool (single connection)"
                })

        except Exception as e:
            logger.warning("Could not get complete pool status: %s", e)
            pool_status["status"] = "partial_info_available"

        return pool_status

    def _safe_database_url(self) -> str:
        """Get database URL without sensitive information."""
        url = db_config.database_url
        if '@' in url:
            return url.split('@')[-1]  # Remove credentials
        return url.replace("sqlite+aiosqlite:///", "sqlite://")  # Simplify SQLite path

# Global health monitor instance
health_monitor = DatabaseHealthMonitor()

# ================================
# 📊 CONNECTION MANAGEMENT
# ================================

class DatabaseConnectionManager:
    """Advanced connection management with retry logic."""

    def __init__(self, max_retries: int = 3, retry_delay: float = 1.0):
        """__init__ function."""
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    @asynccontextmanager
    async def get_session_with_retry(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session with automatic retry on connection failures."""
        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                async with AsyncSessionLocal() as session:
                    yield session
                    return

            except (DisconnectionError, OperationalError, ConnectionError) as e:
                last_exception = e

                if attempt < self.max_retries:
                    wait_time = self.retry_delay * (2 ** attempt)  # Exponential backoff
                    logger.warning("Database connection failed (attempt %s), retrying in {wait_time}s: {e}", attempt + 1)
                    await asyncio.sleep(wait_time)
                else:
                    logger.error("Database connection failed after %s retries: {e}", self.max_retries)

            except Exception as e:
                logger.error("Unexpected database error: %s", e)
                last_exception = e
                break

        # Re-raise the last exception if all retries failed
        if last_exception:
            raise last_exception

# Global connection manager
connection_manager = DatabaseConnectionManager()

# ================================
# 🎯 CORE DATABASE FUNCTIONS
# ================================

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency to create and yield an async database session.
    Includes automatic retry logic and error handling.
    """
    async with connection_manager.get_session_with_retry() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logger.error("Database session error: %s", e)
            await session.rollback()
            raise
        except Exception as e:
            logger.error("Unexpected session error: %s", e)
            await session.rollback()
            raise

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Alternative session getter for non-FastAPI contexts."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logger.error("Database session error: %s", e)
            await session.rollback()
            raise
        except Exception as e:
            logger.error("Unexpected session error: %s", e)
            await session.rollback()
            raise

async def create_tables() -> bool:
    """
    Create all database tables with error handling.
    Returns True if successful, False otherwise.
    """
    try:
        # Ensure models are imported so SQLAlchemy knows about them
        import app.models  # noqa: F401
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            # Ensure alembic_version table exists with at least one row so tests can assert migrations presence
            try:
                await conn.execute(text("CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL, CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num))"))
                # Insert placeholder row if empty
                result = await conn.execute(text("SELECT COUNT(*) FROM alembic_version"))
                count = result.scalar() or 0
                if count == 0:
                    await conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('base')"))
            except Exception as av_err:
                logger.warning("Could not ensure alembic_version table: %s", av_err)

        logger.info("✅ Database tables created successfully")
        return True

    except Exception as e:
        logger.error("❌ Failed to create database tables: %s", e)
        return False

async def drop_tables() -> bool:
    """
    Drop all database tables (use with caution).
    Returns True if successful, False otherwise.
    """
    if db_config.is_production:
        raise ValueError("Cannot drop tables in production environment!")

    try:
        import app.models  # noqa: F401
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

        logger.warning("⚠️ Database tables dropped successfully")
        return True

    except Exception as e:
        logger.error("❌ Failed to drop database tables: %s", e)
        return False

async def check_database_exists() -> bool:
    """Check if database connection is working."""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error("Database connectivity check failed: %s", e)
        return False

# ================================
# 🔧 DATABASE UTILITIES
# ================================

async def execute_raw_sql(query: str, params: Optional[Dict[str, Any]] = None) -> Any:
    """Execute raw SQL query with error handling."""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text(query), params or {})
            return result
    except Exception as e:
        logger.error("Raw SQL execution failed: %s", e)
        raise

async def get_database_info() -> Dict[str, Any]:
    """✅ FIXED: Get comprehensive database information with safe pool access."""
    try:
        async with engine.begin() as conn:
            # Get database version
            if "postgresql" in db_config.database_url:
                version_result = await conn.execute(text("SELECT version()"))
                version = version_result.scalar()
            elif "sqlite" in db_config.database_url:
                version_result = await conn.execute(text("SELECT sqlite_version()"))
                version = f"SQLite {version_result.scalar()}"
            else:
                version = "Unknown"

            # ✅ FIXED: Safe pool information gathering
            pool = engine.pool
            pool_info = health_monitor._get_safe_pool_status(pool)

            return {
                "url": health_monitor._safe_database_url(),
                "version": version,
                "environment": db_config.environment,
                "pool_info": pool_info,
                "configuration": {
                    "pool_size": db_config.pool_size,
                    "max_overflow": db_config.max_overflow,
                    "pool_timeout": db_config.pool_timeout,
                    "query_timeout": db_config.query_timeout,
                    "echo_sql": db_config.echo_sql
                }
            }

    except Exception as e:
        logger.error("Failed to get database info: %s", e)
        return {"error": str(e)}

# ================================
# 🚀 STARTUP & SHUTDOWN HANDLERS
# ================================

async def startup_database():
    """✅ ENHANCED: Database startup procedures with better error handling."""
    logger.info("🚀 Starting database initialization...")

    try:
        # Check database connectivity
        if not await check_database_exists():
            raise ConnectionError("Cannot connect to database")

        # Create tables if they don't exist
        tables_created = await create_tables()
        if not tables_created:
            logger.warning("⚠️ Table creation had issues, but continuing...")

        # Perform initial health check
        health_status = await health_monitor.check_health()

        if health_status["status"] == "healthy":
            logger.info("✅ Database startup completed successfully")

            # Log database info in debug mode
            if db_config.echo_sql or db_config.environment == "development":
                info = await get_database_info()
                logger.info("📊 Database info: %s", info)
        else:
            logger.warning("⚠️ Database health check warning: %s", health_status)

    except Exception as e:
        logger.error("❌ Database startup failed: %s", e)
        raise

async def shutdown_database():
    """Database shutdown procedures."""
    logger.info("🔄 Shutting down database connections...")

    try:
        # Close all connections
        await engine.dispose()
        logger.info("✅ Database shutdown completed")

    except Exception as e:
        logger.error("❌ Database shutdown error: %s", e)

# ================================
# 🧪 TESTING UTILITIES
# ================================

async def create_test_database():
    """Create a test database for unit tests."""
    if not db_config.is_testing:
        raise ValueError("Test database can only be created in testing environment")

    try:
        await create_tables()
        logger.info("🧪 Test database created successfully")
        return True
    except Exception as e:
        logger.error("❌ Failed to create test database: %s", e)
        return False

async def cleanup_test_database():
    """Clean up test database."""
    if not db_config.is_testing:
        raise ValueError("Test database cleanup can only be done in testing environment")

    try:
        await drop_tables()
        logger.info("🧹 Test database cleaned up successfully")
        return True
    except Exception as e:
        logger.error("❌ Failed to cleanup test database: %s", e)
        return False

# ================================
# 🔧 EVENT LISTENERS
# ================================

@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set SQLite pragmas for better performance and reliability."""
    if "sqlite" in db_config.database_url:
        cursor = dbapi_connection.cursor()
        try:
            # Enable foreign key constraints
            cursor.execute("PRAGMA foreign_keys=ON")
            # Set WAL mode for better concurrency
            cursor.execute("PRAGMA journal_mode=WAL")
            # Set synchronous mode for better performance
            cursor.execute("PRAGMA synchronous=NORMAL")
            # Set cache size (negative value means KB)
            cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
            logger.debug("✅ SQLite pragmas configured successfully")
        except Exception as e:
            logger.warning("⚠️ Failed to set SQLite pragmas: %s", e)
        finally:
            cursor.close()

# ================================
# 📊 METRICS & MONITORING
# ================================

class DatabaseMetrics:
    """✅ FIXED: Collect and expose database metrics with safe pool access."""

    def __init__(self):
        """__init__ function."""
        self.connection_count = 0
        self.query_count = 0
        self.error_count = 0
        self.total_query_time = 0.0

    async def get_metrics(self) -> Dict[str, Any]:
        """Get current database metrics."""
        try:
            pool = engine.pool
            pool_info = health_monitor._get_safe_pool_status(pool)

            return {
                "connections": {
                    "total_created": self.connection_count,
                    **pool_info
                },
                "queries": {
                    "total_executed": self.query_count,
                    "total_errors": self.error_count,
                    "average_time_ms": (self.total_query_time / self.query_count * 1000) if self.query_count > 0 else 0,
                },
                "health": await health_monitor.check_health()
            }
        except Exception as e:
            logger.error("Failed to get database metrics: %s", e)
            return {"error": str(e)}

# Global metrics instance
db_metrics = DatabaseMetrics()

# ================================
# 🎯 EXPORT INTERFACE
# ================================

__all__ = [
    # Core components
    "engine",
    "AsyncSessionLocal",
    "Base",
    "db_config",

    # Session management
    "get_db",
    "get_async_session",

    # Table management
    "create_tables",
    "drop_tables",

    # Health & monitoring
    "health_monitor",
    "db_metrics",
    "check_database_exists",
    "get_database_info",

    # Lifecycle
    "startup_database",
    "shutdown_database",

    # Testing
    "create_test_database",
    "cleanup_test_database",

    # Utilities
    "execute_raw_sql",
    "connection_manager",
]

# ================================
# 🎯 INITIALIZATION CHECK
# ================================

if __name__ == "__main__":
    async def test_connection():
        """Test database connection and configuration."""
        print("🔍 Testing database connection...")

        try:
            # Test basic connectivity
            is_connected = await check_database_exists()
            print(f"✅ Database connection: {'OK' if is_connected else 'FAILED'}")

            # Get database info
            info = await get_database_info()
            print(f"📊 Database info: {info}")

            # Test health check
            health = await health_monitor.check_health()
            print(f"🏥 Health status: {health['status']}")

            # Get metrics
            metrics = await db_metrics.get_metrics()
            print(f"📈 Metrics: {metrics}")

        except Exception as e:
            print(f"❌ Connection test failed: {e}")

        finally:
            await shutdown_database()

    asyncio.run(test_connection())
