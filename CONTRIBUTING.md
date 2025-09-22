# Contributing to Impact ID

Thanks for your interest in contributing! This document provides a lightweight guide so contributions stay consistent, secure, and easy to review.

## Table of Contents
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Issue Guidelines](#issue-guidelines)
- [Branch Strategy](#branch-strategy)
- [Commit Messages](#commit-messages)
- [Code Style](#code-style)
- [Backend Notes](#backend-notes)
- [Frontend Notes](#frontend-notes)
- [Testing](#testing)
- [Security](#security)
- [Pull Request Checklist](#pull-request-checklist)

## Project Structure
```
backend/     FastAPI + SQLAlchemy services
frontend/    React/Vite PWA client
.core/       (if present) shared config/utilities
```

## Development Workflow
1. Fork or clone repository.
2. Create a feature branch from `main`.
3. Make focused changes (small logical scope per PR).
4. Run all tests (backend + frontend) before opening PR.
5. Open PR with clear description and any screenshots.

## Issue Guidelines
When filing an issue include:
- Summary (1–2 sentences)
- Expected vs actual behavior
- Reproduction steps (if bug)
- Environment (OS, browser, versions)
- Security impact (if relevant)

## Branch Strategy
- `main` – stable, deployable.
- `feature/<short-desc>` – new features.
- `fix/<short-desc>` – bug fixes.
- `chore/<short-desc>` – build/docs/refactor.

## Commit Messages
Conventional style encouraged:
```
feat(auth): add email verification token rotation
fix(ws): prevent double reconnect flood
chore(ci): add coverage artifact upload
```

## Code Style
Backend:
- Python 3.12+ features allowed; prefer typing everywhere.
- Keep functions small; move complex logic to utility modules.
- Avoid broad `except:`—catch explicit exceptions.

Frontend:
- React functional components with hooks.
- Keep components < 250 lines where practical.
- Co-locate tests next to significant components *or* in a `__tests__` folder.

## Backend Notes
- Use Pydantic schema models for all request/response boundaries.
- Database migrations (Alembic) should be deterministic; avoid data-destructive ops without safeguards.
- Prefer async SQLAlchemy patterns already established in codebase.

## Frontend Notes
- Query/data fetching via TanStack Query; do not manually duplicate cache logic.
- Websocket events should invalidate query keys through a single manager.
- Keep styling in Tailwind + minimal inline styles.

## Testing
Backend:
```
pytest -q
```
Frontend:
```
cd frontend
npm test -- --run
```
Add at least one test for each new non-trivial branch of logic. Avoid snapshot tests that add little value.

## Security
Report vulnerabilities privately (see `SECURITY.md`). Do NOT open public issues for unpatched vulnerabilities.

## Pull Request Checklist
- [ ] Linked issue (if applicable)
- [ ] Tests added/updated & all pass
- [ ] Lint passes (`npm run lint` / Python lint if configured)
- [ ] No secrets / credentials committed
- [ ] Docs / README updated if behavior changed
- [ ] Screenshots for UI changes (desktop + mobile when relevant)

Welcome aboard—your contributions help grow the Impact ID ecosystem!
