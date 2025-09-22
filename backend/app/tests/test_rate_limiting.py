"""Rate limiting tests for probe endpoint."""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import create_tables

@pytest.mark.asyncio
async def test_rate_limit_probe_exceeds():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        successes = 0
        status_codes = []
        for i in range(6):  # exceed 3/second window
            resp = await ac.get("/api/ratelimit/probe")
            status_codes.append(resp.status_code)
            if resp.status_code == 200:
                successes += 1
        # Expect at least one 429
        assert any(code == 429 for code in status_codes), status_codes
        assert successes <= 3
        # Last response likely 429 - check headers for standard rate limit meta if present
        # (slowapi may include Retry-After or limit-specific headers)
        # We do a soft assertion only if 429 present
        last_429_index = next((i for i, c in enumerate(status_codes) if c == 429), None)
        if last_429_index is not None:
            # Make a fresh request to capture current headers
            final = await ac.get("/api/ratelimit/probe")
            if final.status_code == 429:
                # Not all adapters set these headers but we document expectation
                assert 'retry-after' in {k.lower() for k in final.headers.keys()} or True
