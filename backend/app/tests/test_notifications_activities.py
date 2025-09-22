"""Integration tests for notifications and activities flows.
Focus: existing functionality validation without adding new features.
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text

from app.main import app
from app.database import create_tables

API_BASE = "http://test"


async def _signup(client, username: str):
    resp = await client.post(
        "/api/users/signup",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "accept_terms": True,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def _verify_email(db, user_id: int):
    await db.execute(text("UPDATE users SET email_verified=1, status='active' WHERE id=:uid"), {"uid": user_id})


async def _login(client, username_or_email: str):
    resp = await client.post(
        "/api/users/login",
        data={"username": username_or_email, "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_notifications_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=API_BASE) as client:
        await create_tables()
        from app.database import engine
        async with engine.begin() as conn:
            username = f"notify_{uuid.uuid4().hex[:6]}"
            user = await _signup(client, username)
            await _verify_email(conn, user["id"])
        token = await _login(client, username)

        # Initially unread count is 0
        resp = await client.get("/api/notifications/unread/count", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["unread_count"] == 0

        # Create notifications directly in DB (simulate system events)
        from app.database import engine
        async with engine.begin() as conn:
            for i in range(3):
                await conn.execute(text(
                    """
                    INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
                    VALUES (:uid, :title, :msg, 'info', 0, CURRENT_TIMESTAMP)
                    """
                ), {"uid": user["id"], "title": f"Note {i}", "msg": f"Message {i}"})

        # Fetch notifications (all)
        resp = await client.get("/api/notifications/", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        notes = resp.json()
        assert len(notes) == 3
        ids = [n["id"] for n in notes]

        # Unread count should now be 3
        resp = await client.get("/api/notifications/unread/count", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["unread_count"] == 3

        # Mark single notification read
        first_id = ids[0]
        resp = await client.patch(f"/api/notifications/{first_id}/read", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

        # Unread count now 2
        resp = await client.get("/api/notifications/unread/count", headers={"Authorization": f"Bearer {token}"})
        assert resp.json()["unread_count"] == 2

        # Mark all read
        resp = await client.post("/api/notifications/mark-all-read", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

        # All read -> count 0
        resp = await client.get("/api/notifications/unread/count", headers={"Authorization": f"Bearer {token}"})
        assert resp.json()["unread_count"] == 0

        # unread_only filter (should return empty)
        resp = await client.get("/api/notifications/?unread_only=true", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json() == []


@pytest.mark.asyncio
async def test_activities_create_and_react_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=API_BASE) as client:
        await create_tables()
        from app.database import engine
        async with engine.begin() as conn:
            username = f"activity_{uuid.uuid4().hex[:6]}"
            user = await _signup(client, username)
            await _verify_email(conn, user["id"])
        token = await _login(client, username)

        # Create an activity (uses current user context)
        create_payload = {
            "action": "task_completed",
            "detail": "Completed task X",
            "meta_data": {"task_id": 999},
            "is_public": True,
            "user_id": user["id"],
            "username": user["username"]
        }
        resp = await client.post("/api/activities/create", json=create_payload, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200, resp.text
        activity = resp.json()
        activity_id = activity["id"]

        # React (like)
        react_payload = {"reaction_type": "like"}
        resp = await client.post(f"/api/activities/{activity_id}/react", json=react_payload, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["reaction_type"] == "like" and data["is_removed"] is False

        # Same reaction again should remove
        resp = await client.post(f"/api/activities/{activity_id}/react", json=react_payload, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["reaction_type"] is None and data["is_removed"] is True

        # Add different reaction
        react_payload = {"reaction_type": "wow"}
        resp = await client.post(f"/api/activities/{activity_id}/react", json=react_payload, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["reaction_type"] == "wow"

        # Fetch reactions list
        resp = await client.get(f"/api/activities/{activity_id}/reactions", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        reactions = resp.json()
        assert len(reactions) == 1 and reactions[0]["reaction_type"] == "wow"

        # Activity feed (ALL) should include it
        resp = await client.get("/api/activities/?filter_type=all&limit=10", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        feed = resp.json()
        assert any(a["id"] == activity_id for a in feed)

        # Personal filter
        resp = await client.get("/api/activities/?filter_type=personal", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        personal = resp.json()
        assert all(a["user_id"] == user["id"] for a in personal)

        # Stats endpoint
        resp = await client.get(f"/api/activities/stats?user_id={user['id']}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        stats = resp.json()
        assert stats["total_activities"] >= 1
