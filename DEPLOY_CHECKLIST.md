# Deployment Checklist

A concise, repeatable list to safely deploy the Impact ID platform.

## 1. Environment & Secrets
- [ ] Copy `backend/.env.example` to `backend/.env` and fill values.
- [ ] Confirm all required secrets exist in deployment platform (API keys, JWT secrets, email creds, DB URL, Redis URL if used).
- [ ] Ensure no placeholder values remain (search for `CHANGE_ME`).

## 2. Database
- [ ] Provision production database (PostgreSQL recommended vs SQLite) and update `DATABASE_URL`.
- [ ] Run migrations (if using Alembic) or ensure schema initialization routine has executed.
- [ ] (Optional) Run seed script ONLY if first-time bootstrap and idempotent.

## 3. Backend Build & Runtime
- [ ] Verify `backend/requirements.txt` locked & install succeeds.
- [ ] Run backend test suite (if any pytest tests beyond smoke) locally: `pytest -q`.
- [ ] Start backend with production settings locally to smoke test core endpoints & websocket.
- [ ] Confirm CORS & allowed origins include frontend production domain.

## 4. Frontend Build
- [ ] Install deps: `npm ci` (or `pnpm install --frozen-lockfile`).
- [ ] Run tests: `npm test -- --run`. All must pass.
- [ ] Build: `npm run build` (ensure no warnings you consider blocking).
- [ ] Confirm generated `dist/` contains `manifest.webmanifest` and service worker.

## 5. PWA Assets
- [ ] Provide required icons (at minimum 192x192 & 512x512 PNG) referenced in manifest.
- [ ] Add optional larger screenshots for app stores / install UI (manifest `screenshots`).
- [ ] Lighthouse PWA audit score >= 90 for Progressive Web App category.

## 6. Docker / Container
- [ ] `.dockerignore` files present (backend & frontend) to reduce context size.
- [ ] Build images: `docker compose build` (or separate builds) – ensure no cache bloat.
- [ ] Run `docker compose up` locally and complete smoke test: auth flow, websocket event, static asset load.

## 7. Observability & Logging
- [ ] Ensure structured logging enabled (JSON or key=value) in backend for production.
- [ ] Verify no sensitive data logged (tokens, passwords, secrets).
- [ ] (Optional) Hook to monitoring (e.g., Prometheus, Sentry) configured & DSN present.

## 8. Security
- [ ] HTTPS enforced at ingress / reverse proxy.
- [ ] JWT secret length >= 32 chars; rotate if compromised.
- [ ] CSRF mitigations (not needed for pure token auth + API, but verify no cookie auth mixing).
- [ ] Security headers (via nginx / frontend) set: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

## 9. Performance
- [ ] Bundle size check (< 300KB initial JS compressed target, adjust if realistic).
- [ ] Websocket reconnect logic observed working after forced network drop.
- [ ] API latency within acceptable SLA on staging.

## 10. Final Smoke Test (Staging)
Perform in a fresh browser session:
- [ ] Register new user, verify email (if flow enabled) or login existing.
- [ ] Perform an activity that triggers websocket broadcast (e.g., create task or action) – see UI update without refresh.
- [ ] Leaderboard and badges reflect changes after event.
- [ ] Install PWA (Add to Home Screen) prompt appears or can be manually triggered.
- [ ] App works offline for cached routes (at least shell + core assets).

## 11. Go / No-Go
- [ ] All critical severity issues resolved.
- [ ] Rollback plan defined (previous image tag & DB snapshot timestamp).
- [ ] Stakeholder sign-off recorded.

## 12. Post-Deployment
- [ ] Run quick health check (HTTP 200 on `/health` or root, plus websocket connect).
- [ ] Tail logs for first 10 minutes – no error bursts.
- [ ] Record deployment time, image digests, migration revision in changelog.

---
Keep this file versioned. Revise after each retrospective to improve reliability.
