"""End-to-end weaving flow tests.

Validates:
 - User can view weaving status
 - Harvester absence handled: we create a thread manually
 - Claim + submit weave updates essence, xp, streak
 - Weaving leaderboard reflects submission
"""
import pathlib, sys, uuid, pytest
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables, async_session_maker  # noqa: E402
from app import models  # noqa: E402


@pytest.mark.asyncio
async def test_weaving_end_to_end():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()

        uname = f"weaver_{uuid.uuid4().hex[:6]}"
        resp = await ac.post("/api/auth/register", json={
            "username": uname,
            "email": f"{uname}@example.com",
            "password": "WeavePass123!",
            "confirm_password": "WeavePass123!",
            "accept_terms": True
        })
        assert resp.status_code == 201, resp.text

        # Login
        resp = await ac.post("/api/auth/login", json={
            "username": uname,
            "password": "WeavePass123!"
        })
        assert resp.status_code == 200
        token = resp.json()["access_token"]

        # Manually create a raw ImpactThread
        async with async_session_maker() as session:
            thread = models.ImpactThread(content="Sample URL content for weaving", status="raw", category="Tech")
            session.add(thread)
            await session.commit()
            await session.refresh(thread)
            thread_id = thread.id

        # Weaving status
        resp = await ac.get("/api/weaving/status", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        status_payload = resp.json()
        assert status_payload["is_ready"] is True

        # Claim thread
        resp = await ac.post(f"/api/weaving/claim/{thread_id}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == thread_id

        # Submit weave
        submit_payload = {
            "thread_id": thread_id,  # required by schema
            "category": "Technology",
            # Pydantic model uses alias 'insight' for 'reasoning'
            "insight": "This content advances sustainable tech through innovation and scalable impact." * 2
        }
        resp = await ac.post(
            f"/api/weaving/submit/{thread_id}",
            json=submit_payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200, resp.text
        result = resp.json()
        assert result["essence_earned"] >= 5
        assert result["new_essence_balance"] >= result["essence_earned"]
        assert result["new_xp"] >= result["essence_earned"] // 2

        # Leaderboard (weekly default) contains user
        resp = await ac.get("/api/weaving/leaderboard", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        lb = resp.json()
        assert any(e["username"] == uname for e in lb)
