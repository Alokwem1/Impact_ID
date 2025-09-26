import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import create_tables, AsyncSessionLocal
from sqlalchemy import select
from app import models

@pytest.mark.asyncio
async def test_task_create_requires_admin_and_quiz_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Accept-Encoding": "identity"}) as client:
        await create_tables()
        # Create non-admin user
        r = await client.post("/api/users/signup", json={
        "username": "task_non_admin",
        "email": "task_non_admin@example.com",
        "password": "StrongPass123!",
        "confirm_password": "StrongPass123!",
        "accept_terms": True,
        })
        assert r.status_code in (201, 409)
        # Activate and verify the user so login works
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "task_non_admin")
            result = await session.execute(stmt)
            user = result.scalars().first()
            user.email_verified = True
            user.status = "active"
            await session.commit()
        login = await client.post(
            "/api/users/login",
            data={"username": "task_non_admin", "password": "StrongPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login.status_code == 200
        token_user = login.json()["access_token"]

        # Non-admin should be forbidden to create a task
        payload = {
            "title": "Quiz Task",
            "type": "quiz",
            "difficulty": "beginner",
            "instructions": "Answer the question",
            "category": "Education",
            "tags": ["quiz"],
            "xp_reward": 50,
            # Missing quiz_question/correct_answer -> should 400
        }
        r2 = await client.post("/api/tasks/", json=payload, headers={"Authorization": f"Bearer {token_user}"})
        assert r2.status_code in (401, 403)

        # Create admin via signup then promote in DB
        resp_admin = await client.post("/api/users/signup", json={
            "username": "task_admin",
            "email": "task_admin@example.com",
            "password": "AdminPass123!",
            "confirm_password": "AdminPass123!",
            "accept_terms": True,
        })
        assert resp_admin.status_code in (201, 409)
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "task_admin")
            result = await session.execute(stmt)
            admin_user = result.scalars().first()
            admin_user.role = "admin"
            admin_user.email_verified = True
            admin_user.status = "active"
            await session.commit()
        login2 = await client.post(
            "/api/users/login",
            data={"username": "task_admin", "password": "AdminPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login2.status_code == 200
        token_admin = login2.json()["access_token"]

        # Quiz validation should fail if missing required fields
        r3 = await client.post("/api/tasks/", json=payload, headers={"Authorization": f"Bearer {token_admin}"})
        assert r3.status_code == 400
        assert "quiz" in r3.text.lower()

        # Provide proper quiz fields
        payload_ok = dict(payload)
        payload_ok.update({
            "quiz_question": {"question": "2+2?", "options": ["3", "4"]},
            "correct_answer": "4",
        })
        r4 = await client.post("/api/tasks/", json=payload_ok, headers={"Authorization": f"Bearer {token_admin}"})
        assert r4.status_code == 201
        task = r4.json()

        # Attempt to review non-existent submission -> expect 404
        r5 = await client.post(f"/api/tasks/review/999999", json={"approve": True, "feedback": "ok"}, headers={"Authorization": f"Bearer {token_admin}"})
        assert r5.status_code in (404, 400)
