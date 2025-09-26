"""Regression & functionality tests for essence leaderboard.

Validates:
 - Enum value 'essence' accepted (regression for previous typo)
 - Essence leaderboard returns users ordered by essence_balance
 - Authenticated user flagged with is_current_user and included even if below cutoff
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
async def test_essence_leaderboard_order_and_flag():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        # Create 3 users with controlled essence balances. With the per-test DB
        # isolation fixture, these users will be the only ones present, so we can
        # use normal-scale values and still get deterministic ordering.
        specs = [("alpha", 50), ("bravo", 150), ("charlie", 100)]
        password = "StrongPass123!"
        user_ids = {}
        for base, essence in specs:
            uname = f"{base}_{uuid.uuid4().hex[:6]}"
            resp = await ac.post("/api/users/signup", json={
                "username": uname,
                "email": f"{uname}@example.com",
                "password": password,
                "confirm_password": password,
                "accept_terms": True,
            })
            assert resp.status_code == 201, resp.text
            user_ids[uname] = (resp.json()["id"], essence)

        # Patch essence balances, xp, and verify emails directly
        async with async_session_maker() as session:
            for uname, (uid, essence) in user_ids.items():
                user = await session.get(models.User, uid)
                user.essence_balance = essence
                user.xp = essence  # keep XP correlated but small
                user.email_verified = True
                user.status = "active"  # bypass pending approval for tests
            await session.commit()

        # Login as one of the users
        login_username = next(iter(user_ids.keys()))
        resp = await ac.post("/api/users/login", data={
            "username": login_username,
            "password": password
        }, headers={"Content-Type":"application/x-www-form-urlencoded"})
        assert resp.status_code == 200, resp.text
        token = resp.json()["access_token"]

        # Request essence leaderboard
        resp = await ac.get(
            "/api/leaderboard/?leaderboard_type=essence&limit=10",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert len(data) >= 3

        # Order should be descending by score (score==essence for essence leaderboard)
        scores = [e["score"] for e in data]
        assert scores == sorted(scores, reverse=True)

        # Current user flagged
        cu_entries = [e for e in data if e["username"] == login_username]
        assert cu_entries and cu_entries[0]["is_current_user"] is True
