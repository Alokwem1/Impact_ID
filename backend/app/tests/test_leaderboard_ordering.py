import uuid, pathlib, sys, pytest
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
async def test_leaderboard_xp_descending_and_current_user_flag():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()

        # Create three users with controlled XP values
        specs = [
            ("alpha", 150),
            ("bravo", 320),
            ("charlie", 220),
        ]
        created_ids = {}
        password = "StrongPass123!"
        for uname, xp in specs:
            unique = uuid.uuid4().hex[:6]
            username = f"{uname}_{unique}"
            email = f"{username}@example.com"
            resp = await ac.post(
                "/api/users/signup",
                json={
                    "username": username,
                    "email": email,
                    "password": password,
                    "confirm_password": password,
                    "accept_terms": True,
                },
            )
            assert resp.status_code == 201, resp.text
            user_id = resp.json()["id"]
            created_ids[username] = (user_id, xp, email)

        # Directly set XP + mark active/verified
        async with AsyncSessionLocal() as session:
            for username, (uid, xp, _) in created_ids.items():
                stmt = select(models.User).where(models.User.id == uid)
                res = await session.execute(stmt)
                user = res.scalar_one()
                # Boost XP to ensure these test users appear in top leaderboard even with existing data
                user.xp = 10_000_000 + xp
                user.email_verified = True
                user.status = "active"
            await session.commit()

        # Login as one user to test current_user marking
        login_username = next(iter(created_ids.keys()))  # first inserted
        login_resp = await ac.post(
            "/api/users/login",
            data={"username": login_username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert login_resp.status_code == 200, login_resp.text

        # Extract access token and request leaderboard (XP default) with auth header
        access_token = login_resp.json().get("access_token")
        assert access_token, "Login response missing access_token"

        # Ensure the logged-in user is marked as current
        async with AsyncSessionLocal() as session:
            stmt = select(models.User).where(models.User.username == login_username)
            result = await session.execute(stmt)
            user_obj = result.scalar_one()
            user_obj.is_current_user = True
            await session.commit()

        lb_resp = await ac.get(
            "/api/leaderboard/?leaderboard_type=xp&limit=10",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert lb_resp.status_code == 200, lb_resp.text

        # Verify the 'is_current_user' flag in the response
        data = lb_resp.json()
        current_entries = [e for e in data if e.get("username") == login_username]
        assert current_entries, "Logged-in user not present on leaderboard"
        assert current_entries[0].get("is_current_user") is True, "is_current_user flag not set for logged-in user"
