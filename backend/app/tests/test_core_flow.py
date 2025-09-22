"""Minimal core backend flow test.

Validates fundamental user lifecycle without covering every edge:
1. Register user via /api/auth/register
2. Login via /api/auth/login
3. Access /api/auth/me with Bearer token
"""

import uuid
import pathlib, sys
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
async def test_core_register_login_me():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Ensure DB schema present (lifespan not auto-run under ASGITransport)
        await create_tables()
        unique = uuid.uuid4().hex[:8]
        username = f"core_{unique}"
        email = f"core_{unique}@example.com"

        # Register
        r_reg = await ac.post(
            "/api/auth/register",
            json={
                "username": username,
                "email": email,
                "password": "CoreTest123!"
            }
        )
        assert r_reg.status_code == 201, r_reg.text
        user_id = r_reg.json()["id"]

        # Login
        r_login = await ac.post(
            "/api/auth/login",
            json={"username": username, "password": "CoreTest123!"}
        )
        assert r_login.status_code == 200, r_login.text
        token = r_login.json()["access_token"]
        assert token

        # /me
        r_me = await ac.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert r_me.status_code == 200, r_me.text
        me = r_me.json()
        assert me["id"] == user_id
        assert me["username"] == username
        assert me["email"].lower() == email.lower()
