"""Password reset flow tests."""
import uuid, pathlib, sys
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.main import app  # noqa: E402
from app.database import create_tables, AsyncSessionLocal  # noqa: E402
from app import models  # noqa: E402

@pytest.mark.asyncio
async def test_password_reset_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        unique = uuid.uuid4().hex[:8]
        email = f"reset_{unique}@example.com"
        username = f"reset_{unique}"
        password = "OrigPass123!"

        # Register user via users signup endpoint (auth register not used elsewhere)
        reg_resp = await ac.post(
            "/api/users/signup",
            json={
                "username": username,
                "email": email,
                "password": password,
                "confirm_password": password,
                "accept_terms": True,
            },
        )
        assert reg_resp.status_code == 201, reg_resp.text
        user_id = reg_resp.json()["id"]

        # Manually mark email verified & active to allow login later
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.id == user_id)
            res = await session.execute(stmt)
            user = res.scalar_one()
            user.email_verified = True
            user.status = "active"
            await session.commit()

        # Initiate password reset
        forgot_resp = await ac.post(
            "/api/auth/forgot-password", json={"email": email}
        )
        assert forgot_resp.status_code == 200

        # Retrieve reset token from DB
        async with AsyncSessionLocal() as session:
            token_stmt = select(models.PasswordResetToken).join(models.User).where(models.User.id == user_id)
            token_res = await session.execute(token_stmt)
            reset_token = token_res.scalars().first()
            assert reset_token is not None
            token_value = reset_token.token

        # Submit new password
        new_password = "NewPass456!"
        reset_resp = await ac.post(
            "/api/auth/reset-password",
            json={"token": token_value, "new_password": new_password},
        )
        assert reset_resp.status_code == 200, reset_resp.text

        # Old password should fail login
        old_login = await ac.post(
            "/api/auth/login",
            json={"username": username, "password": password},
        )
        assert old_login.status_code in (400, 401)

        # New password login succeeds
        new_login = await ac.post(
            "/api/auth/login",
            json={"username": username, "password": new_password},
        )
        assert new_login.status_code == 200, new_login.text
        body = new_login.json()
        assert "access_token" in body
        assert body.get("username") == username
