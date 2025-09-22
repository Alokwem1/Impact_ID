"""Email verification flow tests."""
import uuid, pathlib, sys
import pytest
from httpx import AsyncClient, ASGITransport

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables  # noqa: E402
from sqlalchemy import select  # noqa: E402
from app import models  # noqa: E402

@pytest.mark.asyncio
async def test_email_verification_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        unique = uuid.uuid4().hex[:8]
        signup_resp = await ac.post(
            "/api/users/signup",
            json={
                "username": f"verify_{unique}",
                "email": f"verify_{unique}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            },
        )
        assert signup_resp.status_code == 201, signup_resp.text
        user_data = signup_resp.json()

        # Fetch verification token via direct DB query (test-only approach)
        # Need a session: reuse database engine via ORM
        from app.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.id == user_data["id"])
            result = await session.execute(stmt)
            user = result.scalars().first()
            assert user is not None
            token = user.verification_token
            assert token is not None

        verify_resp = await ac.get(f"/api/users/verify-email?token={token}")
        assert verify_resp.status_code == 200, verify_resp.text
        body = verify_resp.json()
        assert "Email verified" in body.get("message", "")

        # Attempt login now should no longer get 403 for unverified
        login_resp = await ac.post(
            "/api/users/login",
            data={"username": f"verify_{unique}", "password": "StrongPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_resp.status_code == 200, login_resp.text
        login_body = login_resp.json()
        assert "access_token" in login_body
