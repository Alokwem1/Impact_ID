"""Wallet login tests."""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import create_tables, AsyncSessionLocal
from app import models

@pytest.mark.asyncio
async def test_wallet_login_auto_register(monkeypatch):
    transport = ASGITransport(app=app)
    # Need exactly 40 hex chars after 0x; concatenate two UUID hex chunks
    raw_hex = (uuid.uuid4().hex + uuid.uuid4().hex)[:40]
    test_address = "0x" + raw_hex

    # Fake web3 recovery to return the same address regardless of signature
    class DummyAccount:
        def recover_message(self, message, signature):
            return test_address
    class DummyEth:
        account = DummyAccount()
    class DummyW3:
        eth = DummyEth()
    from app.routers import users as users_router_module
    monkeypatch.setattr(users_router_module, "w3", DummyW3())

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        payload = {
            "address": test_address,
            "message": "Login to Impact ID",
            "signature": "0xFAKE_SIGNATURE"
        }
        resp = await ac.post("/api/users/wallet-login", json=payload)
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["access_token"]
        assert data["user_id"] > 0
        # Ensure user persisted with wallet address
        async with AsyncSessionLocal() as session:
            user = await session.get(models.User, data["user_id"])
            assert user is not None
            assert user.wallet_address == test_address.lower()
            assert user.email_verified is True
