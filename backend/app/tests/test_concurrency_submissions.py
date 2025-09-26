"""Tests optimistic concurrency / uniqueness around task submissions."""
import pathlib, sys, uuid, pytest, asyncio
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables, async_session_maker  # noqa: E402
from app import models  # noqa: E402


@pytest.mark.asyncio
async def test_duplicate_task_submission_attempt_number_constraint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        unique = uuid.uuid4().hex[:6]
        uname = f"sub_{unique}"
        # Register & elevate to admin for task creation
        r = await ac.post("/api/auth/register", json={
            "username": uname,
            "email": f"{uname}@example.com",
            "password": "SubPass123!",
            "confirm_password": "SubPass123!",
            "accept_terms": True
        })
        assert r.status_code == 201
        # Elevate role
        async with async_session_maker() as session:
            user = (await session.execute(models.User.__table__.select().where(models.User.username == uname))).first()
            await session.execute(models.User.__table__.update().where(models.User.id == user.id).values(role="admin"))
            await session.commit()

        login = await ac.post("/api/auth/login", json={"username": uname, "password": "SubPass123!"})
        token = login.json()["access_token"]

        # Create task
        payload = {
            "title": f"Concurrency Task {unique}",
            "type": "upload",
            "difficulty": "beginner",
            "instructions": "Upload proof.",
            "category": "Test",
            "tags": ["c"],
            "xp_reward": 10,
            "essence_reward": 0
        }
        r = await ac.post("/api/tasks/", headers={"Authorization": f"Bearer {token}"}, json=payload)
        assert r.status_code == 201
        task_id = r.json()["id"]

        # Submit once
        sub_payload = {"response": "First", "attachments": []}
        r = await ac.post(f"/api/tasks/{task_id}/submit", headers={"Authorization": f"Bearer {token}"}, json=sub_payload)
        assert r.status_code == 200

        # Rapid second submission should fail (already submitted)
        r = await ac.post(f"/api/tasks/{task_id}/submit", headers={"Authorization": f"Bearer {token}"}, json=sub_payload)
        assert r.status_code == 400
