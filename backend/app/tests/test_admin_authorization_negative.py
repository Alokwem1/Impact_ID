"""Negative authorization tests for admin endpoints.

Ensures that a non-admin user cannot access /api/admin protected resources.
"""
import pathlib, sys, uuid, pytest
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables  # noqa: E402


@pytest.mark.asyncio
async def test_non_admin_cannot_access_admin_dashboard():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        uname = f"user_{uuid.uuid4().hex[:6]}"
        resp = await ac.post("/api/auth/register", json={
            "username": uname,
            "email": f"{uname}@example.com",
            "password": "UserPass123!",
            "confirm_password": "UserPass123!",
            "accept_terms": True
        })
        assert resp.status_code == 201

        resp = await ac.post("/api/auth/login", json={
            "username": uname,
            "password": "UserPass123!"
        })
        assert resp.status_code == 200
        token = resp.json()["access_token"]

        # Attempt admin dashboard
        resp = await ac.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code in (401, 403)
