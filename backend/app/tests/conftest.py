"""Global pytest fixtures and helpers for backend tests.

Centralizes user creation, auth token retrieval, and common utilities
so individual test modules can stay focused on behavioral assertions.
"""
import asyncio
import os
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

"""
IMPORTANT: Configure test environment before importing the application so the
database engine is created with testing settings (in-memory SQLite).
"""
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from app.main import app
from app.database import create_tables, async_session_maker, engine, Base
from sqlalchemy import text
from app import models, auth


@pytest.fixture(scope="session")
def event_loop():  # Override default function-scoped loop for async tests
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture()
async def client():
    transport = ASGITransport(app=app)
    # Disable gzip in tests to avoid unraisable gzip.close warnings on Python 3.13
    default_headers = {"Accept-Encoding": "identity"}
    async with AsyncClient(transport=transport, base_url="http://test", headers=default_headers) as ac:
        await create_tables()
        yield ac

@pytest.fixture(autouse=True)
async def _db_isolation():
    """Function-scoped DB isolation across all tables.

    Uses SQLAlchemy metadata to delete rows from every application table
    in reverse dependency order, both before and after each test. This
    avoids persistent cross-test state from the file-based SQLite DB.
    """
    # Ensure all models are imported so Base.metadata is fully populated
    # before we enumerate tables for deletion. Without this, if tests
    # construct their own client and import order differs, the metadata
    # may be empty and cleanup would miss tables created by prior tests.
    import app.models  # noqa: F401

    # Build ordered table names list using SQLAlchemy metadata, skipping alembic_version
    all_tables = [t.name for t in Base.metadata.sorted_tables if t.name != 'alembic_version']
    # Reverse to delete child tables first (respect FKs)
    delete_order = list(reversed(all_tables))

    async def _wipe():
        async with engine.begin() as conn:
            # Be tolerant regardless of FK constraints; we're deleting children first, but
            # disabling FKs on SQLite helps if any constraint ordering slips through.
            try:
                await conn.execute(text("PRAGMA foreign_keys=OFF"))
            except Exception:
                pass

            for tname in delete_order:
                try:
                    await conn.execute(text(f"DELETE FROM {tname}"))
                except Exception:
                    # Ignore if table doesn't exist yet in this test context
                    pass

            try:
                await conn.execute(text("PRAGMA foreign_keys=ON"))
            except Exception:
                pass

    # Pre-test cleanup
    await _wipe()
    yield
    # Post-test cleanup
    await _wipe()

async def _create_user(username: str, password: str = "TestPass123!", *, verified: bool = True, active: bool = True):
    async with async_session_maker() as session:
        user = models.User(
            username=username.lower(),
            email=f"{username}@example.com",
            hashed_password=auth.hash_password(password),
            email_verified=verified,
            status="active" if active else "pending",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

@pytest.fixture()
async def make_user():
    async def _maker(prefix: str = "user", **kwargs):
        uname = f"{prefix}_{uuid.uuid4().hex[:6]}"
        user = await _create_user(uname, **kwargs)
        return user
    return _maker

@pytest.fixture()
async def auth_token(make_user, client):
    user = await make_user("authed")
    # Perform login through API to keep token generation path realistic
    resp = await client.post("/api/users/login", data={
        "username": user.username,
        "password": "TestPass123!"
    }, headers={"Content-Type":"application/x-www-form-urlencoded"})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"], user
