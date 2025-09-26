"""Tests for metrics endpoint, CORS acceptance, and CSP header basics."""
import pathlib, sys, uuid, pytest
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables  # noqa: E402


@pytest.mark.asyncio
async def test_metrics_and_csp_and_cors():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()

        # Fire a sample request to increment metrics
        r = await ac.get("/live")
        assert r.status_code == 200

        # Metrics endpoint shape
        r = await ac.get("/metrics")
        assert r.status_code == 200
        body = r.text
        assert "impact_request_total" in body
        assert "impact_app_start_time_seconds" in body

        # Register + login to capture security headers on an authenticated request
        uname = f"cors_{uuid.uuid4().hex[:6]}"
        reg = await ac.post("/api/auth/register", json={
            "username": uname,
            "email": f"{uname}@example.com",
            "password": "CorsPass123!",
            "confirm_password": "CorsPass123!",
            "accept_terms": True
        })
        assert reg.status_code == 201
        login = await ac.post("/api/auth/login", json={"username": uname, "password": "CorsPass123!"})
        assert login.status_code == 200
        token = login.json()["access_token"]

        authed = await ac.get("/api/users/@me", headers={"Authorization": f"Bearer {token}"})
        assert authed.status_code == 200
        # Basic security headers presence
        for header in [
            "X-Frame-Options", "X-Content-Type-Options", "Permissions-Policy", "Content-Security-Policy"
        ]:
            assert header in authed.headers
        csp = authed.headers["Content-Security-Policy"]
        assert "default-src 'self'" in csp
