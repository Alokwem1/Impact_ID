# Changelog
All notable changes to this project will be documented here.

The format is based on Keep a Changelog (https://keepachangelog.com/en/1.0.0/) and this project adheres (aspirationally) to Semantic Versioning (https://semver.org/).

## [Unreleased]
### Added
- Initial governance & hygiene: CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE, CODEOWNERS.
- CI workflow (backend + frontend tests & build).
- Deployment checklist and PWA asset guidance.
- Ignore files normalized for backend/frontend & Docker contexts.

### Pending
- PWA large icon assets & screenshots.
- Lighthouse baseline metrics.
- Postgres migration path for production.

## [0.1.0] - 2025-09-22
### Added
- Core FastAPI backend (auth, tasks, badges, leaderboard, websocket events).
- React/Vite frontend with real-time updates, theming, and service worker.
- Websocket test coverage & query invalidation patterns.

### Security
- Structured logging with redaction, CSP, and hardened headers.

[Unreleased]: https://github.com/Alokwem1/Impact_ID/compare/v0.1.0...HEAD
