# Design Assets Guide

This guide lists professional, permissively licensed sources for icons, illustrations, backgrounds, and avatars that fit this application's style. It also explains what should be fetched online vs. what you should add manually (brand/logo files).

## Primary recommendations (licenses)

- Heroicons (MIT) — primary UI icons. https://heroicons.com/ https://github.com/tailwindlabs/heroicons
- Tabler Icons (MIT) — supplemental icons (analytics/admin). https://tabler.io/icons https://github.com/tabler/tabler-icons
- Simple Icons (CC0-1.0) — brand logos (GitHub, Discord, Twitter/X, etc.). https://simpleicons.org/
- Lucide (ISC) / Feather (MIT) — alternative lightweight line icons. https://lucide.dev/ https://feathericons.com/
- unDraw (free to use; see license) — SVG illustrations for onboarding/empty states. https://undraw.co/illustrations
- Storyset by Freepik (requires attribution) — themed illustration packs. https://storyset.com/
- Haikei / Hero Patterns (MIT-ish) — SVG background shapes/patterns. https://haikei.app/ https://heropatterns.com/
- DiceBear (MIT) — generated avatars for users without profile photos. https://www.dicebear.com/

Always check each asset's license and attribution requirements before use in production.

## What to add manually (brand-specific)

- App logo variants: `logo.svg`, `logo-dark.svg`, `logo-monochrome.svg`
- Favicon/Apple Touch icons (generated from your logo)
- Social share images (Open Graph): `og-dashboard.png`, `og-admin.png`, `og-badges.png`
- Email header/footer graphics matching your brand

Place brand/logo assets under `src/assets/images/` and keep the existing PWA icons in `public/`.

## Where the app benefits from visuals


We’ve added safe placeholders you can replace later:


Feature flag: Some optional UI enhancements can be enabled via Vite environment variable:

- Set `VITE_UI_ENHANCEMENTS=true` to preview enhanced EmptyState components where available.
- By default, the app behaves exactly as before (flag is off).

## Suggested picks to fetch (examples)

- unDraw: "On the way", "Dashboard", "Analytics", "Mobile life" (use for empty states/onboarding)
- Tabler Icons: chart-line, activity, bolt, shield, settings, user, users, bell, crown (use where Heroicons lacks coverage)
- Simple Icons: github, discord, x, linkedin (for social links and share)

## Optional: automated fetching

See `frontend/scripts/fetch-assets.mjs` for a scaffold that can download assets from known URLs. Keep the manifest list small and review licenses before running.

## Conventions

- Prefer SVG over PNG for crispness and small size; use `width="1em" height="1em"` or CSS size utilities.
- Keep a consistent stroke width across icon sets (mixing families can look off).
- Keep backgrounds subtle and non-distracting (low alpha, soft gradients).
