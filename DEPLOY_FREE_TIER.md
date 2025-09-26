# Impact ID — Free Tier Deployment Guide

This guide deploys the app for $0 now and lets you upgrade later.

Recommended stack:
- Backend API: Render (Free Web Service, Docker)
- Database: Neon (Free Postgres)
- Frontend: Cloudflare Pages (Free)
- DNS/HTTPS (optional): Cloudflare Free

## 1) Database — Neon
1. Create a Neon account and a new project.
2. Create a database (e.g., `impact_id_prod`).
3. Copy the connection string and convert to asyncpg format:
   - postgresql://user:pass@host/db -> postgresql+asyncpg://user:pass@host/db

## 2) Backend — Render
1. Connect GitHub repo to Render.
2. Add new Web Service from repo, choose Docker, root=`./backend`.
3. Render will detect `backend/Dockerfile`.
4. Set environment variables:
   - ENVIRONMENT=production
   - RUN_DB_MIGRATIONS=1
   - DEBUG=false
   - SECRET_KEY=(generate a long random string)
   - DATABASE_URL=postgresql+asyncpg://... (from Neon)
   - ALLOWED_ORIGINS=https://<your-pages-subdomain>.pages.dev,https://<your-domain>
5. First deploy may take 1–2 minutes. Health check: `/health`.

## 3) Frontend — Cloudflare Pages
1. Create a new Pages project from GitHub.
2. Build settings:
   - Build command: `npm ci && npm run build`
   - Root directory: `frontend`
   - Output directory: `dist`
3. Environment variables (Production):
   - VITE_API_BASE_URL=https://<your-render-service>.onrender.com
4. Ensure SPA routing: `_redirects` file (`/* /index.html 200`).
5. Optional headers hardening: `_headers` file added.

## 4) Domain & HTTPS (optional)
- Add your domain to Cloudflare (Free) and point `app.yourdomain.com` to Cloudflare Pages.
- Add the domain to `ALLOWED_ORIGINS` in Render.
- Update VITE_API_BASE_URL to your domain if you switch from the platform URL.

## 5) WebSockets
- Frontend derives WebSocket host from VITE_API_BASE_URL in production.
- Backend exposes `/api/activities/live`.

## 6) Rollback & Observability
- Render keeps previous deploys for rollback.
- Backend exposes `/metrics` for Prometheus (optional).

If you want to switch providers later, no code changes are needed—just update env vars.
