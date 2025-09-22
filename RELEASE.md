# Release Process

A lightweight process to cut a tagged release of Impact ID.

## 1. Preflight
Run automated checks:
```
node scripts/release-check.mjs
```
If icons are missing, generate them:
```
cd frontend
npm run generate:icons -- logo-source.png .
```

## 2. Manual Validation
- Open the built app locally (or staging) and verify:
  - Websocket events propagate (e.g., create a task and see UI update)
  - PWA install prompt appears (or can be forced via dev tools > Applications > Manifest)
  - Offline mode loads core shell after one successful online visit
- Run Lighthouse (Chrome DevTools) and capture scores (Performance, PWA, Accessibility, Best Practices, SEO). Add major deltas to CHANGELOG.

## 3. Update Changelog
Edit `CHANGELOG.md` under `[Unreleased]` – move entries to a new version block:
```
## [0.1.1] - 2025-10-01
### Added
- Example feature...
```

## 4. Bump Versions
Frontend version already tracked via `frontend/package.json`. For backend (if versioning needed), add an `__version__` constant or environment-provided build meta and note it here.

## 5. Commit & Tag
```
git add .
git commit -m "release: v0.1.0"
git tag -a v0.1.0 -m "Impact ID 0.1.0"
git push origin main --follow-tags
```

## 6. Deploy
Use your deployment platform (container registry push, etc.). After deploy:
- Hit `/live`, `/ready`, `/health` endpoints.
- Open websocket client path in browser to ensure no 403/400 regressing.

## 7. Post-Release
- Update any external docs / status pages.
- Monitor logs & error tracking for anomalies first 30 minutes.
- If rollback needed: deploy previous image tag & restore DB snapshot if schema changed.

## 8. Automate (Future Enhancements)
Potential future improvements:
- GitHub Action for automated tag creation on version bump PR merge.
- Lighthouse CI job with budgets.
- Release notes generation via conventional commits.

---
Keep this document accurate—revise whenever the process evolves.
