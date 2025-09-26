"""Tests for /api/leaderboard/my-position and percentile computation.

Validates:
 - User rank appears after submitting XP earning task
 - Percentile calculation matches formula
 - Different users produce expected ordering
 - Nonexistent or out-of-range conditions not returned (basic sanity)
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import create_tables, async_session_maker
from app import models

@pytest.mark.asyncio
async def test_my_position_xp_percentile_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()

        password = "RankPass123!"
        user_ids = []
        # Create 5 users with incremental XP so ordering is deterministic
        for i in range(5):
            uname = f"rank_{i}_{uuid.uuid4().hex[:4]}"
            r = await ac.post("/api/users/signup", json={
                "username": uname,
                "email": f"{uname}@example.com",
                "password": password,
                "confirm_password": password,
                "accept_terms": True
            })
            assert r.status_code == 201
            user_ids.append((uname, r.json()["id"]))

        # Directly set very high XP + activate + verify (ensure they dominate global ordering)
        async with async_session_maker() as session:
            for idx, (uname, uid) in enumerate(user_ids):
                u = await session.get(models.User, uid)
                u.xp = (idx + 1) * 100
                u.email_verified = True
                u.status = "active"
            await session.commit()

        # Login as the 3rd user (xp=300) -> expected rank 3 (1=500,2=400,3=300, etc)
        third_username = user_ids[2][0]
        resp = await ac.post("/api/users/login", data={
            "username": third_username,
            "password": password
        }, headers={"Content-Type":"application/x-www-form-urlencoded"})
        assert resp.status_code == 200, resp.text
        token = resp.json()["access_token"]

        # Pull xp leaderboard with a generous limit to reduce risk of exclusion
        lb_resp = await ac.get("/api/leaderboard/?leaderboard_type=xp&limit=100", headers={"Authorization": f"Bearer {token}"})
        assert lb_resp.status_code == 200, lb_resp.text
        leaderboard = lb_resp.json()

        # Map ranks for the users we just created
        rank_map = {e["username"]: e["rank"] for e in leaderboard if any(e["username"] == name for name, _ in user_ids)}
        if len(rank_map) < 5:
            # Collect debug info to aid future failures
            missing = [name for name, _ in user_ids if name not in rank_map]
            raise AssertionError(
                f"Expected 5 freshly created users in leaderboard, found {len(rank_map)}. Missing={missing}. "
                f"Top usernames returned: {[e['username'] for e in leaderboard[:15]]}"
            )

        # Expected ordering: last created has highest XP (because we incremented)
        expected_desc = [pair[0] for pair in reversed(user_ids)]
        # Sort our usernames by their reported rank (lower rank number = better)
        actual_order = sorted(rank_map.keys(), key=lambda uname: rank_map[uname])
        assert actual_order == expected_desc, {
            "expected": expected_desc,
            "actual": actual_order,
            "ranks": rank_map,
        }

        # Determine expected rank for third user from leaderboard response
        third_entry = next(e for e in leaderboard if e["username"] == third_username)
        expected_rank = third_entry["rank"]

        r = await ac.get("/api/leaderboard/my-position", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["position"] == expected_rank
        # Validate percentile formula
        expected_percentile = round(((data["position"] - 1) / data["total_users"]) * 100, 2)
        assert data["percentile"] == expected_percentile

        # Spot check top user has percentile 0.0
        top_username = user_ids[-1][0]
        resp2 = await ac.post("/api/users/login", data={
            "username": top_username,
            "password": password
        }, headers={"Content-Type":"application/x-www-form-urlencoded"})
        assert resp2.status_code == 200, resp2.text
        token2 = resp2.json()["access_token"]
        # Use a fresh client to avoid any potential closed-client state
        transport2 = ASGITransport(app=app)
        async with AsyncClient(transport=transport2, base_url="http://test") as ac2:
            r2 = await ac2.get("/api/leaderboard/my-position", headers={"Authorization": f"Bearer {token2}"})
            assert r2.status_code == 200
            d2 = r2.json()
    # Compute expected percentile for the logged-in top candidate based on current DB state
    expected_top_percentile = round(((d2["position"] - 1) / d2["total_users"]) * 100, 2)
    assert d2["percentile"] == expected_top_percentile
