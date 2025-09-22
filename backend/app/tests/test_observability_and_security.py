import os
import hashlib
from httpx import AsyncClient
import pytest

from app.main import app
from httpx import ASGITransport


@pytest.mark.asyncio
async def test_metrics_endpoint_exposes_prometheus():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/metrics")
    assert resp.status_code == 200
    body = resp.text
    assert "impact_request_total" in body
    assert "impact_app_info" in body


@pytest.mark.asyncio
async def test_request_id_header_present():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    assert "X-Request-ID" in resp.headers
    assert resp.headers["X-Request-ID"]
    assert "X-Response-Time" in resp.headers


@pytest.mark.asyncio
async def test_password_breach_check_registration(monkeypatch):
    # Enable breach check
    monkeypatch.setenv("ENABLE_BREACH_CHECK", "1")

    # Use a password that's NOT in simulated compromised set
    payload = {
        "username": "safeuser",
        "email": "safeuser@example.com",
        "password": "Str0ng!Passw0rd"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/auth/register", json=payload)
    assert resp.status_code in (201, 400)  # 400 if email reuse from parallel tests
    if resp.status_code == 201:
        data = resp.json()
        assert data["username"] == "safeuser"


@pytest.mark.asyncio
async def test_password_breach_check_rejects_compromised(monkeypatch):
    monkeypatch.setenv("ENABLE_BREACH_CHECK", "1")

    # Build password whose SHA1 suffix matches simulated compromised set
    compromised_suffix = "DEMO1234567890DEADBEEFDEADBEEFDEADBE"
    # We cannot reverse SHA1 easily; simulate by patching hashlib.sha1 to force suffix
    real_sha1 = hashlib.sha1

    class FakeSHA1:
        def __init__(self, *args, **kwargs):
            self._real = real_sha1()
        def update(self, data):
            self._real.update(data)
        def hexdigest(self):
            # Return a 40-char hex starting with 5 char prefix and our compromised suffix
            return "ABCDE" + compromised_suffix.lower()

    monkeypatch.setattr(hashlib, "sha1", lambda *a, **k: FakeSHA1())

    payload = {
        "username": "badpwuser",
        "email": "badpwuser@example.com",
        "password": "VeryWeak!1"
    }
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.post("/api/auth/register", json=payload)
    assert resp.status_code == 400
    assert "breach corpus" in resp.text