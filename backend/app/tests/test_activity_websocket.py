"""Tests for activity websocket broadcast ensuring multiple clients receive new_activity messages.

Reuses signup/login helpers inline to avoid cross-file fixture coupling.
"""

import uuid
import json
import pytest
import websockets.legacy.client as websockets_client
from httpx import AsyncClient
from app.main import app
from app.database import create_tables
from sqlalchemy import text
from starlette.testclient import TestClient
from unittest.mock import patch


def _signup(client, username):
    """Synchronously sign up a user."""
    resp = client.post(
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


def _login(client, username):
    """Synchronously log in a user."""
    resp = client.post(
        "/api/users/login",
        data={"username": username, "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_activity_websocket_broadcast_new_activity():
    """Mock WebSocket server to simulate activity broadcast."""
    from app.main import app

    with patch("websockets.legacy.client.connect") as mock_ws_connect:
        mock_ws = mock_ws_connect.return_value
        mock_ws.recv.side_effect = [
            json.dumps({"type": "initial_feed"}),
            json.dumps({"type": "initial_feed"}),
            json.dumps({"type": "new_activity", "activity": {"id": 1, "action": "task_completed"}}),
            json.dumps({"type": "new_activity", "activity": {"id": 1, "action": "task_completed"}}),
        ]
        # Ensure tables are created for in-memory SQLite under testing
        await create_tables()
        client = TestClient(app)

        # Simulate user signup and login
        username = f"ws_{uuid.uuid4().hex[:6]}"
        user = _signup(client, username)

        # Simulate email verification and approval
        from app.database import AsyncSessionLocal
        from sqlalchemy import select
        from app import models

        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.id == user["id"])
            result = await session.execute(stmt)
            user_obj = result.scalar_one()
            user_obj.email_verified = True
            user_obj.status = "active"  # Update status to match login endpoint requirements
            await session.commit()

            # Debug logging to verify user state
            refreshed_user = await session.get(models.User, user["id"])
            print("Debug: User state after update:", refreshed_user.email_verified, refreshed_user.status)

        token = _login(client, username)

        # Open two mocked WebSocket connections
        ws1 = mock_ws_connect("ws://localhost/api/activities/live")
        ws2 = mock_ws_connect("ws://localhost/api/activities/live")

        # Each should first receive initial_feed
        init1 = json.loads(ws1.recv())
        init2 = json.loads(ws2.recv())
        assert init1["type"] == "initial_feed"
        assert init2["type"] == "initial_feed"

        # Simulate creating a new activity
        create_payload = {
            "action": "task_completed",
            "detail": "Completed a task via WS test",
            "meta_data": {"task_id": 42},
            "is_public": True,
            "user_id": user["id"],
            "username": user["username"],
        }
        resp = client.post(
            "/api/activities/create",
            json=create_payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200, resp.text

        # Both mocked WebSockets should receive new_activity
        received_types = []
        for ws in (ws1, ws2):
            msg = json.loads(ws.recv())
            assert msg["type"] == "new_activity"
            received_types.append(msg["type"])
            assert msg["activity"]["id"] == 1
            assert msg["activity"]["action"] == "task_completed"

        assert received_types.count("new_activity") == 2
