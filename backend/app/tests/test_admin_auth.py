"""Admin authorization tests."""
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
async def test_admin_dashboard_authorization():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()

        # Create normal user (unverified -> verify for login)
        unique_user = uuid.uuid4().hex[:6]
        resp_user = await ac.post(
            "/api/users/signup",
            json={
                "username": f"norm_{unique_user}",
                "email": f"norm_{unique_user}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            },
        )
        assert resp_user.status_code == 201
        user_id = resp_user.json()["id"]

        # Promote second user to admin
        unique_admin = uuid.uuid4().hex[:6]
        resp_admin = await ac.post(
            "/api/users/signup",
            json={
                "username": f"adm_{unique_admin}",
                "email": f"adm_{unique_admin}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            },
        )
        assert resp_admin.status_code == 201
        admin_id = resp_admin.json()["id"]

        # Mark both verified + activate + promote admin
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.id.in_([user_id, admin_id]))
            res = await session.execute(stmt)
            for u in res.scalars().all():
                u.email_verified = True
                u.status = "active"
                if u.id == admin_id:
                    u.role = "admin"
            await session.commit()

        # Login normal user (should get 403 on admin dashboard)
        login_user = await ac.post(
            "/api/users/login",
            data={"username": f"norm_{unique_user}", "password": "StrongPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_user.status_code == 200
        user_token = login_user.json()["access_token"]

        dash_forbidden = await ac.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert dash_forbidden.status_code in (401, 403)

        # Login admin
        login_admin = await ac.post(
            "/api/users/login",
            data={"username": f"adm_{unique_admin}", "password": "StrongPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_admin.status_code == 200
        admin_token = login_admin.json()["access_token"]

        dash_allowed = await ac.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert dash_allowed.status_code == 200, dash_allowed.text
        body = dash_allowed.json()
        assert "total_users" in body and isinstance(body["total_users"], int)
