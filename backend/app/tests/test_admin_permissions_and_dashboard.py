import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import create_tables
from app.database import AsyncSessionLocal
from sqlalchemy import select
from app import models

@pytest.mark.asyncio
async def test_admin_dashboard_requires_admin_role():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Accept-Encoding": "identity"}) as client:
        await create_tables()
        # Create a normal user and attempt to access /api/admin/dashboard
        resp = await client.post("/api/users/signup", json={
        "username": "normal_admin_guard",
        "email": "normal_admin_guard@example.com",
        "password": "StrongPass123!",
        "confirm_password": "StrongPass123!",
        "accept_terms": True,
        })
        assert resp.status_code in (201, 409)

        # Activate and verify the user so login works in tests
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "normal_admin_guard")
            result = await session.execute(stmt)
            user = result.scalars().first()
            user.email_verified = True
            user.status = "active"
            await session.commit()

        login = await client.post(
            "/api/users/login",
            data={"username": "normal_admin_guard", "password": "StrongPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]

        # Should be forbidden for non-admin
        r = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code in (401, 403)

        # Create an admin via signup then promote in DB
        resp_admin = await client.post("/api/users/signup", json={
            "username": "admin_guard",
            "email": "admin_guard@example.com",
            "password": "AdminPass123!",
            "confirm_password": "AdminPass123!",
            "accept_terms": True,
        })
        assert resp_admin.status_code in (201, 409)
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "admin_guard")
            result = await session.execute(stmt)
            admin_user = result.scalars().first()
            admin_user.role = "admin"
            admin_user.email_verified = True
            admin_user.status = "active"
            await session.commit()
        login2 = await client.post(
            "/api/users/login",
            data={"username": "admin_guard", "password": "AdminPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login2.status_code == 200
        access_token = login2.json()["access_token"]

        # Admin should access dashboard
        r2 = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {access_token}"})
        assert r2.status_code == 200
        body = r2.json()
        # Basic shape checks
        for key in [
            "total_users",
            "new_users_today",
            "active_users_this_week",
            "pending_submissions",
            "total_active_tasks",
            "submissions_today",
            "avg_response_time_hours",
            "platform_health_score",
        ]:
            assert key in body

@pytest.mark.asyncio
async def test_admin_list_users_pagination_and_search():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Accept-Encoding": "identity"}) as client:
        await create_tables()

        # Ensure an admin (signup then promote in DB)
        resp_admin = await client.post("/api/users/signup", json={
            "username": "admin_list",
            "email": "admin_list@example.com",
            "password": "AdminPass123!",
            "confirm_password": "AdminPass123!",
            "accept_terms": True,
        })
        assert resp_admin.status_code in (201, 409)
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "admin_list")
            result = await session.execute(stmt)
            admin_user = result.scalars().first()
            admin_user.role = "admin"
            admin_user.email_verified = True
            admin_user.status = "active"
            await session.commit()
        login = await client.post(
            "/api/users/login",
            data={"username": "admin_list", "password": "AdminPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login.status_code == 200
        admin_token = login.json()["access_token"]

        # Create a couple users
        for i in range(3):
            u = f"list_user_{i}"
            resp = await client.post("/api/users/signup", json={
                "username": u,
                "email": f"{u}@example.com",
                "password": "StrongPass123!",
                "confirm_password": "StrongPass123!",
                "accept_terms": True,
            })
            assert resp.status_code in (201, 409)
            # Activate them for completeness (not strictly required for listing)
            async with AsyncSessionLocal() as session:
                stmt = select(models.User).where(models.User.username == u)
                result = await session.execute(stmt)
                user = result.scalars().first()
                user.email_verified = True
                user.status = "active"
                await session.commit()

        # List users (first page)
        r = await client.get("/api/admin/users?limit=2&offset=0", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        users_page_1 = r.json()
        assert len(users_page_1) <= 2

        # Search by username fragment
        r2 = await client.get(
            "/api/admin/users?search=list_user_",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r2.status_code == 200
        assert any("list_user_" in u["username"] for u in r2.json())
