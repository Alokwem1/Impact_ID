"""
Test Users module for Impact ID application.
"""

from httpx import AsyncClient, ASGITransport
import os, sys, pathlib, uuid

# Ensure project root (backend) is on sys.path so 'app' package resolves consistently
CURRENT_DIR = pathlib.Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent  # backend/app/ -> backend/
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
import pytest

from app.main import app
from app.database import create_tables


@pytest.mark.asyncio
async def test_signup():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Ensure tables are created for the test (lifespan not auto-run with ASGITransport)
        await create_tables()
        unique = uuid.uuid4().hex[:8]
        response = await ac.post(
            "/api/users/signup",
            json={
                "username": f"testuser_{unique}",
                "email": f"testuser_{unique}@example.com",
                "password": "TestPass123!",
                "confirm_password": "TestPass123!",
                "accept_terms": True,
            },
        )
    assert response.status_code == 201, response.text
    body = response.json()
    assert "id" in body and body["username"].startswith("testuser_")
