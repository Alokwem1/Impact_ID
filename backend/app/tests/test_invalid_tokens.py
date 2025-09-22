"""Negative tests for invalid password reset and email verification tokens."""
import uuid, pathlib, sys
import pytest
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables  # noqa: E402

@pytest.mark.asyncio
async def test_invalid_password_reset_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        # Attempt reset with obviously invalid token
        resp = await ac.post("/api/auth/reset-password", json={"token": "invalidtoken123", "new_password": "NewPass123!"})
    # Backend may return 400 or 404 depending on implementation; assert client error
    assert resp.status_code in (400, 404), resp.text

@pytest.mark.asyncio
async def test_invalid_email_verification_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        resp = await ac.get("/api/users/verify-email?token=notavalidtoken")
    assert resp.status_code in (400, 404), resp.text
