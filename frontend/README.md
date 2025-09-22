# Impact ID Frontend

## Overview
React + Vite application powering the Impact ID platform UI.

## Key Production Enhancements (V2)
- Code splitting & manual chunk strategy (see `vite.config.js`).
- Bundle analysis via `rollup-plugin-visualizer` (run `npm run analyze`).
- Web Vitals optional reporting (`src/reportWebVitals.js`).
- Accessibility: focus trap + return focus in `ConfirmationModal`, global skip link in `index.html`.
- Security meta & CSP, referrer policy, color-scheme meta.
- Error resilience: root error boundary with recovery actions.

## Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with proxy to backend |
| `npm run build` | Production build (terser) |
| `npm run preview` | Preview built bundle |
| `npm run analyze` | Build with bundle analyzer output to `dist/bundle-analysis.html` |

## Environment Variables (Vite)
Prefix custom variables with `VITE_` to expose to client. Examples:
| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_WS_BASE_URL` | WebSocket base URL |
| `VITE_USE_POLLING` | Enable polling watcher in constrained FS environments |

## Web Vitals
Initialized in `main.jsx` via `initWebVitals()`. Extend handler to POST metrics to backend if needed.

## Accessibility Notes
| Feature | Location | Notes |
|---------|----------|-------|
| Skip Link | `index.html` | Jumps to `#root` |
| Focus Trap | `ConfirmationModal` | Cycles tab focus inside modal |
| Return Focus | `ConfirmationModal` | Restores focus to trigger element |
| Visible Focus | Global CSS | Uses `:focus-visible` outline |

Further improvements: semantic landmarks for main content sections, automated axe testing.

## Performance Tips
- Use dynamic imports for large admin or analytics modules.
- Keep an eye on `react-vendor` and `vendor` chunk sizes via analyzer.
- Consider prefetching critical next-route components after idle.

## Security
- CSP baseline defined in backend & `index.html`; tighten by removing `unsafe-inline`/`unsafe-eval` once styles/scripts hashed.
- Referrer Policy set to `strict-origin-when-cross-origin`.

## Future Roadmap
- Add PWA offline caching strategy for tasks & badges.
- Implement real-time presence indicators via WebSocket.
- Add automated accessibility tests (axe) in CI.
