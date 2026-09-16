# Immortal Admin disaster recovery

This document describes how to recover the managed website and Immortal Admin without storing or exporting secrets.

## What the recovery bundle contains

A manually generated recovery artifact contains the managed configuration, public managed assets, site-manager source, Worker configuration, release metadata, and this checklist. It intentionally does **not** contain Cloudflare runtime secrets, GitHub OAuth secrets, GitHub tokens, browser-local publisher sessions, or private keys.

## Recovery order

1. Restore the repository files from the latest known-good Git commit or recovery artifact.
2. Confirm GitHub Pages is enabled for the repository and the public site loads.
3. Confirm the Cloudflare Worker project points at `cloudflare/profile-uploader` and deploys `src/router.js` through the existing Wrangler configuration.
4. Recreate Worker secrets from your own secure records. Never recover them from source control.
5. Confirm `GET /health` returns a healthy Worker response.
6. Open `/admin/profile/` and sign in with GitHub OAuth or the emergency publisher key.
7. Check Overview → Health before publishing anything.
8. If the public managed state is wrong, restore a named snapshot or import the managed JSON backup from the recovery bundle.
9. Publish a harmless test change and confirm the deployment timeline reaches Live.

## Important files

- `data/site-settings.json`
- `data/site-seo.json`
- `data/site-auto-backups.json`
- `data/site-snapshots.json`
- `data/theme-presets.json`
- `data/site-schedule.json`
- `assets/pfp.jpg`
- `assets/site-favicon.jpg`
- `assets/site-background.jpg`
- `assets/site-banner.jpg`
- `admin/profile/`
- `cloudflare/profile-uploader/`

## Secrets that must never be in a recovery artifact

- `GITHUB_TOKEN`
- `ADMIN_KEY`
- `GITHUB_OAUTH_CLIENT_SECRET`
- OAuth access tokens or signed browser sessions

Keep those values only in the appropriate provider secret store or your own secure password manager.
