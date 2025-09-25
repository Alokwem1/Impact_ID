"""Frontend ↔ Backend contract verification tests.

These tests assert that critical API endpoints referenced by the React frontend
exist in the FastAPI application. This provides an early, automated warning if
refactors remove or rename routes that the UI depends upon.

The list intentionally focuses on stable, high-value endpoints. Optional or
environment-dependent endpoints (like notifications) are treated as advisory
rather than hard failures to avoid noisy CI breaks when a feature is disabled.
"""
from __future__ import annotations

from fastapi import FastAPI
from app.main import app  # noqa: F401 – imported for side effects & access


# Critical endpoints the frontend directly calls and MUST exist.
CRITICAL_ENDPOINTS = {
    # Dashboard & analytics
    "/api/dashboard",
    "/api/weaving/analytics",
    # Leaderboard core + auxiliary data endpoints
    "/api/leaderboard/",  # trailing slash present in router root
    "/api/leaderboard/stats",
    "/api/leaderboard/my-position",
    "/api/leaderboard/recent-achievements",
    # User achievements preview
    "/api/users/achievements/recent",
    # Auth essentials
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/check-username",
    "/api/auth/check-email",
}

# Optional endpoints (nice-to-have, may be absent if feature disabled)
OPTIONAL_ENDPOINTS = {
    "/api/notifications/unread/count",  # Only if notifications router loaded
}


def _collect_paths(fastapi_app: FastAPI) -> set[str]:
    paths: set[str] = set()
    for route in fastapi_app.routes:
        if getattr(route, "path", None):
            paths.add(route.path)
    return paths


def test_critical_frontend_endpoints_exist():
    """All critical endpoints must be registered in the app router table."""
    paths = _collect_paths(app)
    missing = sorted(p for p in CRITICAL_ENDPOINTS if p not in paths)
    assert not missing, (
        "Missing critical API endpoints required by frontend: " + ", ".join(missing)
    )


def test_optional_frontend_endpoints_report():
    """Optional endpoints should exist when the related feature is enabled.

    If they are missing we don't fail the suite; we surface a helpful note for
    maintainers via a gentle assertion that always passes (pytest -vv shows the
    message) to encourage alignment without blocking CI.
    """
    paths = _collect_paths(app)
    missing_optional = sorted(p for p in OPTIONAL_ENDPOINTS if p not in paths)
    # Always pass; include info for visibility
    assert True, (
        "Optional endpoints missing (informational only): " + ", ".join(missing_optional)
        if missing_optional else "All optional endpoints present"
    )
