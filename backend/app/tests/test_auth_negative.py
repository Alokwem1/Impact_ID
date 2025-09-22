"""
Negative authentication and authorization tests.
"""

import pytest
from httpx import AsyncClient, ASGITransport
import os, sys, pathlib, uuid

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app
from app.database import create_tables

@pytest.mark.asyncio
async def test_login_wrong_password():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        # First create a user via signup
        unique = uuid.uuid4().hex[:8]
        resp = await ac.post(
            "/api/users/signup",
            json={
                "username": f"neguser_{unique}",
                "email": f"neguser_{unique}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            },
        )
        assert resp.status_code in (201, 409)

        # Attempt login with wrong password via /api/users/login (OAuth2PasswordRequestForm)
        resp_login = await ac.post(
            "/api/users/login",
            data={
                "username": "neguser",
                "password": "WrongPass!"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        # Expect 401 Unauthorized
        assert resp_login.status_code in (400, 401)

@pytest.mark.asyncio
async def test_duplicate_signup():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        unique = uuid.uuid4().hex[:8]
        payload = {
            "username": f"dupeuser_{unique}",
            "email": f"dupeuser_{unique}@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
            "accept_terms": True,
        }
        first = await ac.post("/api/users/signup", json=payload)
        assert first.status_code == 201
        second = await ac.post("/api/users/signup", json=payload)
        # Conflict expected
        assert second.status_code in (400, 409)

@pytest.mark.asyncio
async def test_unauthorized_task_creation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        # Signup normal user
        unique = uuid.uuid4().hex[:8]
        resp = await ac.post(
            "/api/users/signup",
            json={
                "username": f"basicuser_{unique}",
                "email": f"basicuser_{unique}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            },
        )
        assert resp.status_code == 201

        # Try create task without admin auth token
        task_resp = await ac.post(
            "/api/tasks/",
            json={
                "title": "Sample Task",
                "type": "standard",
                "difficulty": "easy",
                "instructions": "Do something simple",
                "category": "general",
                "tags": ["test"],
                "xp_reward": 10,
                "essence_reward": 1,
                "time_limit_minutes": 30,
                "max_attempts": 3,
                "requires_review": False,
                "is_featured": False,
                "prerequisites": []
            }
        )
        # Expect unauthorized / forbidden (401/403) because no token / not admin
        assert task_resp.status_code in (401, 403)
