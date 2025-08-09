"""
Test Users module for Impact ID application.
"""


from httpx import AsyncClient
import pytest

from app.main import app


@pytest.mark.asyncio
async def test_signup():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/users/signup", json={
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!"
        })
    assert response.status_code == 200
    assert "user_id" in response.json()
