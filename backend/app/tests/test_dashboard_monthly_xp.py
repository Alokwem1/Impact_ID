import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text

from app.main import app
from app.database import create_tables, engine


@pytest.mark.asyncio
async def test_dashboard_monthly_xp_accumulates_after_submission():
    """Ensure the dashboard's this_month_stats.xp_earned reflects XP from approved submissions."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await create_tables()

        admin_username = f"adm_{uuid.uuid4().hex[:6]}"
        user_username = f"usr_{uuid.uuid4().hex[:6]}"

        # Register admin & user via existing endpoints (fallback to /api/users/signup if present else /api/auth/register)
        for uname in (admin_username, user_username):
            resp = await client.post(
                "/api/users/signup",
                json={
                    "username": uname,
                    "email": f"{uname}@example.com",
                    "password": "TestPass123!",
                    "confirm_password": "TestPass123!",
                    "accept_terms": True,
                },
            )
            assert resp.status_code in (201, 200), resp.text
        # Promote first user to admin + verify emails directly
        async with engine.begin() as conn:
            for uname in (admin_username, user_username):
                await conn.execute(text("UPDATE users SET email_verified=1, status='active' WHERE username=:u"), {"u": uname})
            await conn.execute(text("UPDATE users SET role='admin' WHERE username=:u"), {"u": admin_username})

        # Login both
        def _login_payload(username: str):
            return {
                "username": username,
                "password": "TestPass123!",
            }
        # Support both login endpoints that might exist
        async def _login(username: str) -> str:
            # Try /api/users/login (form) then /api/auth/login (json)
            r = await client.post(
                "/api/users/login",
                data={"username": username, "password": "TestPass123!"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if r.status_code != 200:
                r = await client.post("/api/auth/login", json=_login_payload(username))
            assert r.status_code == 200, r.text
            return r.json()["access_token"]

        admin_token = await _login(admin_username)
        user_token = await _login(user_username)

        # Create a simple upload task awarding 40 XP (will manually approve)
        task_payload = {
            "title": f"Std {uuid.uuid4().hex[:5]}",
            "type": "upload",
            "difficulty": "beginner",
            "instructions": "Write something meaningful",
            "category": "general",
            "tags": ["std"],
            "xp_reward": 40,
        }
        r = await client.post(
            "/api/tasks/",
            json=task_payload,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r.status_code == 201, r.text
        task_id = r.json()["id"]

        # Submit response (will be pending)
        submit_payload = {
            "task_id": task_id,
            "response": "This is a valid response body",  # satisfy length
            "attachments": [],
            "time_spent_minutes": 2,
        }
        r = await client.post(
            f"/api/tasks/{task_id}/submit",
            json=submit_payload,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert r.status_code == 200, r.text
        sub = r.json()
        assert sub["status"] in {"pending", "approved", "rejected"}

        # Manually approve & award XP if not already approved
        submission_id = sub["submission_id"]
        if sub["status"] != "approved":
            async with engine.begin() as conn:
                await conn.execute(
                    text("UPDATE task_submissions SET status='approved', xp_awarded=40 WHERE id=:sid"),
                    {"sid": submission_id},
                )
                # Increment user xp
                await conn.execute(text("UPDATE users SET xp = COALESCE(xp,0) + 40 WHERE id=(SELECT user_id FROM task_submissions WHERE id=:sid)"), {"sid": submission_id})


        # Fetch dashboard; xp should be at least 40 in this_month_stats.xp_earned
        r = await client.get("/api/dashboard", headers={"Authorization": f"Bearer {user_token}"})
        assert r.status_code == 200, r.text
        dash = r.json()
        assert dash["this_month_stats"]["xp_earned"] >= 40, dash

        # Second call should be served (potentially) from cache with same value
        r2 = await client.get("/api/dashboard", headers={"Authorization": f"Bearer {user_token}"})
        assert r2.status_code == 200
        dash2 = r2.json()
        assert dash2["this_month_stats"]["xp_earned"] == dash["this_month_stats"]["xp_earned"]
