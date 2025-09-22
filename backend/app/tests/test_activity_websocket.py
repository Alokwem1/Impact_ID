"""Tests for activity websocket broadcast ensuring multiple clients receive new_activity messages.

Reuses signup/login helpers inline to avoid cross-file fixture coupling.
"""

import uuid
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import create_tables
from sqlalchemy import text

API_BASE = "http://test"


async def _signup(client: AsyncClient, username: str):
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


async def _verify_email(conn, user_id: int):
    await conn.execute(
        text("UPDATE users SET email_verified=1, status='active' WHERE id=:uid"),
        {"uid": user_id},
    )


async def _login(client: AsyncClient, username_or_email: str):
    resp = await client.post(
        "/api/users/login",
        data={"username": username_or_email, "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_activity_websocket_broadcast_new_activity():
    """Connect two websocket clients, create an activity, both should receive new_activity."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=API_BASE) as client:
        await create_tables()
        from app.database import engine

        # Create and verify user
        async with engine.begin() as conn:
            username = f"ws_{uuid.uuid4().hex[:6]}"
            user = await _signup(client, username)
            await _verify_email(conn, user["id"])
        token = await _login(client, username)

        # Open two websocket connections (anonymous for simplicity)
        ws1 = await client.ws_connect("/api/activities/live")
        ws2 = await client.ws_connect("/api/activities/live")

        # Each should first receive initial_feed
        init1 = json.loads((await ws1.receive_text()))
        init2 = json.loads((await ws2.receive_text()))
        assert init1["type"] == "initial_feed"
        assert init2["type"] == "initial_feed"

        # Create a new activity via API (authenticated)
        create_payload = {
            "action": "task_completed",
            "detail": "Completed a task via WS test",
            "meta_data": {"task_id": 42},
            "is_public": True,
            "user_id": user["id"],
            "username": user["username"],
        }
        resp = await client.post(
            "/api/activities/create",
            json=create_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200, resp.text
        activity_id = resp.json()["id"]

        # Both websockets should receive new_activity (order may vary)
        received_types = []
        for ws in (ws1, ws2):
            msg = json.loads((await ws.receive_text()))
            assert msg["type"] == "new_activity"
            received_types.append(msg["type"])
            assert msg["activity"]["id"] == activity_id
            assert msg["activity"]["action"] == "task_completed"

        assert received_types.count("new_activity") == 2

        await ws1.close()
        await ws2.close()
