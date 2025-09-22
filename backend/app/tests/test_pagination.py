"""Pagination metadata tests."""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, delete

from app.main import app
from app.database import create_tables, AsyncSessionLocal
from app import models

@pytest.mark.asyncio
async def test_tasks_pagination_envelope():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await create_tables()
        # Seed tasks directly (avoid needing admin auth path)
        async with AsyncSessionLocal() as session:
            # Ensure deterministic state: remove dependent rows before tasks to satisfy FK constraints
            await session.execute(delete(models.TaskSubmission))
            await session.execute(delete(models.TaskLog))
            await session.execute(delete(models.Task))
            await session.commit()

            for i in range(15):
                t = models.Task(
                    title=f"Task {i}-{uuid.uuid4().hex[:6]}",
                    type="quiz",  # valid TaskType
                    difficulty="beginner",  # valid TaskDifficulty
                    instructions="Do something impactful and meaningful for testing pagination.",
                    category="general",
                    tags=["impact"],
                    quiz_question={"q": "What?"},
                    correct_answer="Yes",
                    xp_reward=10,
                    essence_reward=1,
                    time_limit_minutes=5,
                    max_attempts=3,
                    requires_review=False,
                    is_featured=False,
                    scheduled_start=None,
                    scheduled_end=None,
                    prerequisites=[],
                    active=True,
                    created_by_user_id=1,
                )
                session.add(t)
            await session.commit()

        resp = await ac.get("/api/tasks/?limit=5&offset=0")
        assert resp.status_code == 200, resp.text
        data = resp.json()
        # Envelope keys
        for key in ["items", "total", "limit", "offset", "has_more"]:
            assert key in data, f"Missing key {key}"
        assert data["limit"] == 5
        assert data["offset"] == 0
        assert data["total"] >= 15
        assert data["has_more"] is True
        assert len(data["items"]) == 5

        # Next page
        resp2 = await ac.get("/api/tasks/?limit=5&offset=5")
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["offset"] == 5
        assert len(data2["items"]) == 5

        # Last page should set has_more False
        resp_last = await ac.get("/api/tasks/?limit=10&offset=10")
        assert resp_last.status_code == 200
        data_last = resp_last.json()
        assert data_last["has_more"] is False
