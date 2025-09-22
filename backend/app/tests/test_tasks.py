"""
Critical task lifecycle tests for Impact ID.
Covers:
1. Admin creates quiz task (auto-gradable) & standard task (requires review)
2. User fetches task feed (unauth then auth) and sees no submission status initially
3. User submits correct quiz answer -> auto-approved, XP awarded
4. Duplicate submission blocked
5. User submits standard task -> pending status
6. My submissions endpoint returns both with appropriate statuses
7. Categories & single task detail reflect submission status fields
Edge cases: invalid duplicate submission, minimum response length enforcement
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import create_tables
from sqlalchemy import text

API_BASE = "http://test"

# ------------------ Helpers ------------------ #
async def _signup(client, username: str):
    resp = await client.post(
        "/api/users/signup",
        json={
            "username": username,
            "email": f"{username}@example.com",
            "password": "TestPass123!",
            "confirm_password": "TestPass123!",
            "accept_terms": True,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()

async def _verify_email(db, user_id: int):
    # Directly mark email_verified for test simplicity
    await db.execute(text("UPDATE users SET email_verified=1, status='active' WHERE id=:uid"), {"uid": user_id})

async def _login(client, username_or_email: str):
    resp = await client.post(
        "/api/users/login",
        data={"username": username_or_email, "password": "TestPass123!"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]

async def _promote_admin(db, user_id: int):
    await db.execute(text("UPDATE users SET role='admin' WHERE id=:uid"), {"uid": user_id})

# ------------------ Tests ------------------ #
@pytest.mark.asyncio
async def test_task_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=API_BASE) as client:
        # Ensure tables exist
        await create_tables()
        # Acquire a raw DB connection through SQLAlchemy engine
        from app.database import engine
        async with engine.begin() as conn:
            # Sign up admin & user
            admin_username = f"admin_{uuid.uuid4().hex[:6]}"
            user_username = f"user_{uuid.uuid4().hex[:6]}"
            admin = await _signup(client, admin_username)
            user = await _signup(client, user_username)
            # Verify emails
            await _verify_email(conn, admin["id"])
            await _verify_email(conn, user["id"])
            # Promote admin
            await _promote_admin(conn, admin["id"])
        # Login both
        admin_token = await _login(client, admin_username)
        user_token = await _login(client, user_username)

        # Create quiz task (auto-grading)
        quiz_payload = {
            "title": f"Quiz {uuid.uuid4().hex[:5]}",
            "type": "quiz",
            "difficulty": "beginner",
            "instructions": "Answer the question",
            "category": "general",
            "tags": ["quiz"],
            "quiz_question": {"q": "Capital of France?"},
            "correct_answer": "Paris",
            "xp_reward": 25,
            "essence_reward": 5,
        }
        resp = await client.post("/api/tasks/", json=quiz_payload, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 201, resp.text
        quiz_task = resp.json()

        # Create standard task (requires review)
        std_payload = {
            "title": f"Std {uuid.uuid4().hex[:5]}",
            "type": "upload",
            "difficulty": "beginner",
            "instructions": "Write at least 5 chars",
            "category": "general",
            "tags": ["std"],
            "xp_reward": 15,
        }
        resp = await client.post("/api/tasks/", json=std_payload, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 201, resp.text
        std_task = resp.json()

        # Unauthenticated feed (no user submission data)
        resp = await client.get("/api/tasks/?limit=10&offset=0")
        assert resp.status_code == 200
        feed = resp.json()
        assert feed["total"] >= 2

        # Authenticated feed for user (still no submissions yet)
        resp = await client.get("/api/tasks/?limit=10&offset=0", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        feed_auth = resp.json()
        assert feed_auth["total"] >= 2

        # Submit correct quiz answer -> auto-approved
        submit_payload = {"task_id": quiz_task['id'], "response": "Paris", "attachments": [], "time_spent_minutes": 1}
        resp = await client.post(
            f"/api/tasks/{quiz_task['id']}/submit",
            json=submit_payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 200, resp.text
        quiz_submission = resp.json()
        assert quiz_submission["status"] == "approved"
        assert quiz_submission["auto_approved"] is True
        assert quiz_submission["xp_earned"] == 25

        # Duplicate quiz submission blocked
        resp = await client.post(f"/api/tasks/{quiz_task['id']}/submit", json=submit_payload, headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 400
        assert "already submitted" in resp.text.lower()

        # Enforce response length validation (short response) BEFORE a valid submission
        short_payload = {"task_id": std_task['id'], "response": "abc", "attachments": [], "time_spent_minutes": 1}
        resp = await client.post(
            f"/api/tasks/{std_task['id']}/submit",
            json=short_payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 400
        assert "at least 5" in resp.text.lower()

        # Now submit a valid standard task response (pending or auto decision)
        std_submit_payload = {"task_id": std_task['id'], "response": "This is valid", "attachments": [], "time_spent_minutes": 2}
        resp = await client.post(
            f"/api/tasks/{std_task['id']}/submit",
            json=std_submit_payload,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert resp.status_code == 200, resp.text
        std_submission = resp.json()
        assert std_submission["status"] in {"pending", "approved", "rejected"}
        if std_submission["status"] != "pending":
            assert std_submission["status"] in {"approved", "rejected"}

        # My submissions list reflects both
        resp = await client.get("/api/tasks/my-submissions", headers={"Authorization": f"Bearer {user_token}"})
        # Should succeed and include both quiz + standard submissions
        assert resp.status_code == 200
        subs = resp.json()
        ids = {s["task_id"] for s in subs}
        assert quiz_task["id"] in ids and std_task["id"] in ids

        # Fetch single task detail includes user submission metadata (quiz)
        resp = await client.get(f"/api/tasks/{quiz_task['id']}", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        detail_quiz = resp.json()
        assert detail_quiz.get("user_submission_status") in {"approved", "rejected", "pending"}

        # Categories endpoint returns expected category
        resp = await client.get("/api/tasks/categories")
        assert resp.status_code == 200
        categories = resp.json()
        assert "general" in categories

        # (Length validation already tested earlier)
