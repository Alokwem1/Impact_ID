import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_alias_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r_root = await client.get("/health")
        assert r_root.status_code == 200, r_root.text
        root_json = r_root.json()
        r_alias = await client.get("/api/health")
        assert r_alias.status_code == 200, r_alias.text
        alias_json = r_alias.json()
        # Basic parity checks
        assert alias_json.get("status") == root_json.get("status")
        assert alias_json.get("version") == root_json.get("version")