import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_security_cors_and_no_auth_cookie():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    # CORS headers (depending on middleware config these may appear differently)
    # We assert presence of at least one common CORS header and absence of Set-Cookie for stateless JWT
    cors_header_present = any(h.lower().startswith("access-control-allow") for h in resp.headers.keys())
    assert cors_header_present, "Expected a CORS header to be present"
    assert "set-cookie" not in {k.lower() for k in resp.headers.keys()}, "Did not expect Set-Cookie on public health endpoint"
    assert resp.headers.get("content-type", "").startswith("application/json")
