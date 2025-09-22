import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from app.main import app
from app.database import engine

@pytest.mark.asyncio
async def test_alembic_version_present():
    # Ensure the alembic_version table has at least one row (migrations applied)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT version_num FROM alembic_version"))
        rows = result.fetchall()
    assert rows, "alembic_version table is empty; migrations may not have run"
