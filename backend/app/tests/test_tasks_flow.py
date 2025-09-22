"""Task lifecycle tests (existing functionality only).

Covers:
1. Admin creates a quiz task.
2. Regular user retrieves task feed and specific task detail.
3. User submits correct quiz answer -> auto approved & XP awarded.
4. Duplicate submission rejected.

Assumptions:
- Auth endpoints mounted at /api/auth/*
- Tasks endpoints mounted at /api/tasks/* (see main.py include_router order).
- In-memory SQLite DB (create_tables) is sufficient for these isolated tests.
"""

import asyncio
import pathlib
import sys
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

# Ensure backend project root on path
CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent  # backend/app/ -> backend/
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables  # noqa: E402


@pytest.mark.asyncio
async def test_task_quiz_submission_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Ensure tables exist
        await create_tables()

        # 1. Register admin user (then manually elevate role for test) & normal user
        unique = uuid.uuid4().hex[:6]
        admin_username = f"admin_{unique}"
        user_username = f"user_{unique}"

        # Register admin (starts as normal user)
        resp = await ac.post("/api/auth/register", json={
            "username": admin_username,
            "email": f"{admin_username}@example.com",
            "password": "AdminPass123!",
            "confirm_password": "AdminPass123!",
            "accept_terms": True
        })
        assert resp.status_code == 201, resp.text

        # Register normal user
        resp = await ac.post("/api/auth/register", json={
            "username": user_username,
            "email": f"{user_username}@example.com",
            "password": "UserPass123!",
            "confirm_password": "UserPass123!",
            "accept_terms": True
        })
        assert resp.status_code == 201, resp.text

        # Directly elevate first user to admin via lightweight DB patch (internal API not exposed)
        # Import models + session factory locally to avoid over-coupling
        from app.database import async_session_maker
        from app import models
        async with async_session_maker() as session:
            result = await session.execute(
                models.User.__table__.select().where(models.User.username == admin_username)
            )
            row = result.first()
            assert row, "Admin user row not found"
            await session.execute(
                models.User.__table__.update().where(models.User.id == row.id).values(role="admin")
            )
            await session.commit()

        # Login admin to obtain token
        resp = await ac.post("/api/auth/login", json={
            "username": admin_username,
            "password": "AdminPass123!"
        })
        assert resp.status_code == 200, resp.text
        admin_token = resp.json()["access_token"]

        # 2. Admin creates a quiz task
        quiz_title = f"Climate Quiz {unique}"
        create_payload = {
            "title": quiz_title,
            "type": "quiz",
            "difficulty": "beginner",
            "instructions": "Answer the question correctly.",
            "category": "Environment",
            "tags": ["climate", "quiz"],
            "quiz_question": {"q": "What gas do plants absorb?"},
            "correct_answer": "carbon dioxide",
            "xp_reward": 25,
            "essence_reward": 3
        }
        resp = await ac.post(
            "/api/tasks/",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=create_payload,
        )
        assert resp.status_code == 201, resp.text
        task_id = resp.json()["id"]
        assert resp.json()["title"] == quiz_title

        # 3. Normal user login
        resp = await ac.post("/api/auth/login", json={
            "username": user_username,
            "password": "UserPass123!"
        })
        assert resp.status_code == 200, resp.text
        user_token = resp.json()["access_token"]

        # 4. User fetches task feed & sees task
        resp = await ac.get(
            "/api/tasks/",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert any(t["id"] == task_id for t in items)

        # 5. User fetches task detail
        resp = await ac.get(
            f"/api/tasks/{task_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 200
        detail = resp.json()
        assert detail["id"] == task_id
        assert detail["title"] == quiz_title

        # 6. User submits correct quiz answer -> auto approved
        submission_payload = {
            "response": "Carbon Dioxide",  # case-insensitive match
            "attachments": [],
            "time_spent_minutes": 1
        }
        resp = await ac.post(
            f"/api/tasks/{task_id}/submit",
            headers={"Authorization": f"Bearer {user_token}"},
            json=submission_payload
        )
        assert resp.status_code == 200, resp.text
        submission_data = resp.json()
        assert submission_data["status"] == "approved"
        assert submission_data["auto_approved"] is True
        assert submission_data["xp_earned"] == 25

        # 7. Duplicate submission should fail
        resp = await ac.post(
            f"/api/tasks/{task_id}/submit",
            headers={"Authorization": f"Bearer {user_token}"},
            json=submission_payload
        )
        assert resp.status_code == 400
        assert "already submitted" in resp.text.lower()

        # 8. User submissions listing reflects the approved submission
        resp = await ac.get(
            "/api/tasks/my-submissions",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 200
        subs = resp.json()
        assert any(s["task_id"] == task_id and s["status"] == "approved" for s in subs)
