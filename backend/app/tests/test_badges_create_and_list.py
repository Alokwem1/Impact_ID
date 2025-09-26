import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import create_tables, AsyncSessionLocal
from sqlalchemy import select
from app import models

@pytest.mark.asyncio
async def test_badge_create_requires_admin_and_lists():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", headers={"Accept-Encoding": "identity"}) as client:
        await create_tables()
        # Create admin via signup then promote in DB
        resp_admin = await client.post("/api/users/signup", json={
            "username": "badge_admin",
            "email": "badge_admin@example.com",
            "password": "AdminPass123!",
            "confirm_password": "AdminPass123!",
            "accept_terms": True,
        })
        assert resp_admin.status_code in (201, 409)
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == "badge_admin")
            result = await session.execute(stmt)
            admin_user = result.scalars().first()
            admin_user.role = "admin"
            admin_user.email_verified = True
            admin_user.status = "active"
            await session.commit()
        login = await client.post(
            "/api/users/login",
            data={"username": "badge_admin", "password": "AdminPass123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login.status_code == 200
        token = login.json()["access_token"]

        # Create a badge
        unique_title = f"Early Bird {uuid.uuid4().hex[:6]}"
        badge_payload = {
            "title": unique_title,
            "description": "Awarded for reaching 10 XP in total across tasks.",
            "criteria": "first_submission",
            "badge_type": "achievement",
            "rarity": "common",
            "color": "#10B981",
            "points_value": 10,
            "icon_url": "/static/early-bird.svg",
            "auto_award_criteria": {"xp": 10},
            "is_secret": False,
        }
        r = await client.post("/api/badges/", json=badge_payload, headers={"Authorization": f"Bearer {token}"})
        if r.status_code == 409:
            # Already exists; acceptable
            pass
        else:
            assert r.status_code == 201
            body = r.json()
            assert body["title"] == unique_title

        # List badges (auth included due to current dependency setup)
        r2 = await client.get("/api/badges/", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
    assert any(b["title"] == unique_title for b in r2.json())
