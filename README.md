# Impact ID Backend & Frontend

[![CI](https://github.com/Alokwem1/Impact_ID/actions/workflows/ci.yml/badge.svg)](https://github.com/Alokwem1/Impact_ID/actions/workflows/ci.yml) • [Release Process](RELEASE.md)

## Overview
Impact ID is a platform for tracking and rewarding positive actions using a gamified task & badge system. The stack includes:

- FastAPI (async) backend with JWT auth, role-based admin endpoints, rate limiting, and structured logging.
- React/Vite frontend.
- SQLite (development) with SQLAlchemy ORM (ready for Postgres/MySQL in production).

## Key Backend Features
- Unified token system (access, refresh, verification, password reset)
- Badge + task submission workflow with admin review
- Pagination & leaderboard endpoints
- Health, metrics, and rate limit probe endpoints
- Security middleware: hardened headers, CORS (environment-based), gzip, request correlation
- Structured JSON logging (production-ready)
 - Optional auto Alembic migration runner (`RUN_DB_MIGRATIONS=1`)
 - Prometheus metrics endpoint (`/metrics`) + internal summary (`/api/metrics`)
 - Dynamic security headers (CSP, COOP, COEP, Permissions-Policy, HSTS in prod)
 - Request ID + response time headers (`X-Request-ID`, `X-Response-Time`)
 - Optional password breach check stub (`ENABLE_BREACH_CHECK=1`)

## Structured Logging
Logging is centralized via `app.core.logging.init_logging()` using a JSON formatter in production/staging for easy ingestion into tools like Loki, Datadog, ELK, etc.

### Standard Log Fields
Each request log includes (when available):
`ts, level, logger, message, event, component, request_id, path, method, status, duration_ms, ip, ua, environment, service, version`.

### Redaction
Sensitive keys such as `password`, `authorization`, `token`, `access_token`, `refresh_token` are automatically redacted.

### Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `ENVIRONMENT` | Controls environment mode (`development`, `staging`, `production`) | `development` |
| `JSON_LOGS` | Force JSON logs on/off (`true`/`false`) | Auto: on in staging/production |
| `LOG_LEVEL` | Root logging level (`INFO`, `DEBUG`, etc.) | `INFO` |
| `SERVICE_NAME` | Service identifier added to each log line | `impact-id-backend` |
| `APP_VERSION` | Application version in log context | `unknown` |
| `THIRD_PARTY_LOG_LEVEL` | Noise suppression for libs (uvicorn/sqlalchemy) | `WARNING` |

### Example (Development Plain Text)
```
2024-01-01 12:00:00 INFO impact_id - request completed
```

### Example (Production JSON)
```json
{"ts":"2024-01-01T12:00:00.123456+00:00","level":"INFO","logger":"impact_id","message":"request completed","event":"request","component":"http","request_id":"...","path":"/api/tasks","method":"GET","status":200,"duration_ms":8.41,"ip":"127.0.0.1","ua":"Mozilla/5.0","environment":"production","service":"impact-id-backend","version":"2.0.0"}
```

## Running (Development Quick Start)
1. Backend: `uvicorn app.main:app --reload` (ensure virtualenv + deps installed from `backend/requirements.txt`).
2. Frontend: `npm install && npm run dev` inside `frontend/`.

## Tests
FastAPI tests live in `backend/app/tests/` (run with `pytest`). They cover auth, pagination, badge workflows, and core health endpoints.

## Rate Limiting
Exposed probe endpoint: `GET /api/ratelimit/probe` (bursty tests use it). Adjust limiter config in `main.py` if needed.

## Health & Metrics
- `/live` liveness probe (container/process up)
- `/ready` readiness probe (DB reachable + startup complete)
- `/health` consolidated health (DB & runtime + feature flags)
- `/api/metrics` lightweight uptime & feature flags
 - `/metrics` Prometheus exposition (counters + histogram)

### Timezone-Aware Timestamps
All ORM models now use a centralized `utcnow()` helper (timezone-aware) instead of naive `datetime.utcnow()` to avoid deprecation warnings and ensure consistent ISO 8601 timestamps.

## SPA Fallback
Non-API requests resolve to the built frontend `index.html` when present; in dev a helpful JSON message is returned if missing.

---
For deployment hardening consider: enabling HTTPS + HSTS in production, externalizing secrets, switching to Postgres, adding Alembic migrations automation, and integrating a log collector.

## Environment Feature Flags
| Variable | Description | Example |
|----------|-------------|---------|
| `RUN_DB_MIGRATIONS` | Auto-run Alembic migrations at startup | `1` |
| `ENABLE_BREACH_CHECK` | Enable password breach check stub on register/reset | `1` |
| `JSON_LOGS` | Force JSON logs on/off | `true` |
| `LOG_LEVEL` | Logging verbosity | `INFO` |

## Prometheus Metrics
Exposed metrics include:
| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `impact_request_total` | Counter | method, path, status | Total HTTP requests |
| `impact_request_duration_seconds` | Histogram | method, path | Request latency |
| `impact_app_start_time_seconds` | Gauge | - | Process start time |
| `impact_app_info` | Gauge | version, environment | Static app info gauge set to 1 |

Avoid high path cardinality: numeric path segments are replaced with `:id`.

## Security Headers Summary
| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Restrict resource origins |
| `Cross-Origin-Opener-Policy` | Isolation / security for popups |
| `Cross-Origin-Embedder-Policy` | Required for powerful APIs (prod) |
| `Permissions-Policy` | Disable sensitive browser features |
| `Referrer-Policy` | Limit referrer leakage |
| `Strict-Transport-Security` | Enforce HTTPS (prod only) |
| `X-Content-Type-Options` | Prevent MIME sniffing |
| `X-Frame-Options` | Mitigate clickjacking |

## Request Correlation
Every response includes:
| Header | Description |
|--------|-------------|
| `X-Request-ID` | Correlation ID (can be supplied by client) |
| `X-Response-Time` | Duration in milliseconds |

Include `X-Request-ID` in client logs to trace end-to-end.

## Quick QA & Test Guide

### Backend
Run all backend tests:
```
pytest -q
```
Run only smoke tests:
```
pytest -m smoke -q
```
Run backend with coverage (HTML + XML):
```
pytest --cov=app --cov-report=term-missing --cov-report=html --cov-report=xml
```
HTML report: `coverage_backend_html/index.html` (configured via `.coveragerc`).
Fail-under threshold currently 70% (raise gradually as feature set stabilizes).

Recent Additions:
- Added leaderboard ordering test (`test_leaderboard_ordering.py`) validating XP leaderboard returns descending order and flags the authenticated user (`is_current_user`).
- Refactored leaderboard endpoint to return schema-aligned fields (xp, level, streak, essence_balance, badge_count, tasks_completed, score) without triggering async lazy-load (eliminated `MissingGreenlet` errors).

### Frontend
Install deps then run unit + integration tests:
```
cd frontend
npm test
```
Generate coverage (HTML in coverage/):
```
npm run test:coverage
```
Accessibility smoke (jest-axe) is included in the normal test run; keep it light to avoid slowing CI.

### Minimal End-to-End Flow (Manual)
1. Start backend (with migrations): `RUN_DB_MIGRATIONS=1 uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Register user, login, open dashboard; verify WebSocket indicator and no console errors.

## CI Plan (Stub)
Short-term GitHub Actions outline (future `.github/workflows/ci.yml`):
1. Trigger: push + PR on `main`.
2. Jobs:
	- backend: setup Python, install `backend/requirements.txt`, run `pytest -q`.
	- frontend: setup Node 20.x, install with `--legacy-peer-deps`, run `npm run test:coverage` (fail below thresholds).
3. Artifacts: upload `frontend/coverage/lcov.info`.
4. (Optional) Add CodeQL / dependency audit later.

Raising Coverage: thresholds intentionally conservative (mid 70s). Increase by +5 after meaningful test additions (avoid chasing trivial lines).

## Progressive Web App (PWA) Notes
The frontend is installable as a PWA. To ensure a high Lighthouse PWA score:
- Required icons (192, 512) plus maskable 512 now supported (add monochrome if desired).
- Add `screenshots` (recommended) to `manifest.webmanifest` for richer install banners.
- Service worker strategy: precache app shell + network-first for API calls; verify offline load of root + static assets.
- Install prompt delay currently: 3s (development) / 30s (production) after first user interaction.
- Test offline by: building (`npm run build`), serving from a local HTTP static server, loading once, then toggling device offline.

Generating Icons (two options):
1. Script (preferred – generates all sizes + maskable):
```
cd frontend
npm install sharp --save-dev   # first time only
npm run generate:icons
```
2. Manual (example using sharp CLI):
```
npx sharp assets/images/logo-source.svg -resize 512 512 public/android-chrome-512x512.png
```
After generation: ensure `android-chrome-512x512-maskable.png` referenced with purpose `maskable`.

Preflight release check (icons + build):
```
node scripts/release-check.mjs
```

## Deployment Checklist Reference
See `DEPLOY_CHECKLIST.md` at the repo root for a step-by-step preflight list before releasing.