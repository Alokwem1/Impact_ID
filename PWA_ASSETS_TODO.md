# PWA Assets TODO

The manifest references icons and screenshots that must exist for a polished install experience. Generate these before production launch.

## Required Icons
Place in `frontend/` root (or adjust paths in `site.webmanifest`):
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

Recommended maskable variant (improves adaptive icon rendering):
- `android-chrome-512x512-maskable.png` (add to manifest with `"purpose": "maskable any"`)

## Optional but Recommended
- Monochrome icon: `icon-monochrome.svg` (reference with `"purpose": "monochrome"`)
- Additional sizes: 256x256, 384x384 for completeness.

## Screenshots (for install UI)
Add under `frontend/screenshots/` (create folder):
- Desktop: 1280x720 (`desktop.png`)
- Mobile: 390x844 (`mobile.png`)
- Optional extra states: onboarding, leaderboard, badge detail.

Update `site.webmanifest` `screenshots` array accordingly (current placeholders already point to `/screenshots/desktop.png` & `/screenshots/mobile.png`).

## Generation Commands (Node + sharp)
Install sharp (dev):
```
npm install sharp --save-dev
```
Generate from a high-res square source logo (e.g., `logo-source.png`):
```
npx sharp logo-source.png -resize 192 192 android-chrome-192x192.png
npx sharp logo-source.png -resize 512 512 android-chrome-512x512.png
npx sharp logo-source.png -resize 512 512 android-chrome-512x512-maskable.png
```

## Verification Checklist
- [ ] All referenced icon files exist (no 404s in Network tab).
- [ ] Lighthouse PWA audit: Icons maskable + installable passes.
- [ ] Manifest warning-free in browser dev tools.
- [ ] Offline test loads app shell after one successful online load.

## After Generation
1. Commit new assets.
2. Update `site.webmanifest` if adding maskable/monochrome entries.
3. Re-run `npm run build` and Lighthouse audit.

Keep this file until assets are finalized; remove or archive once complete.
