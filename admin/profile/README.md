# Immortal Admin

Private browser-based CMS for `xm5o.github.io`.

## Architecture

The admin UI is static and served from GitHub Pages under `/admin/profile/`. It never receives the GitHub repository write token.

Writes go through the Cloudflare Worker in `cloudflare/profile-uploader/`. The Worker authenticates the admin session, validates managed paths/payloads, creates backups, and commits allowed changes to the repository.

The main browser modules are:

- `app.js` - startup orchestration
- `auth.js` - GitHub OAuth / emergency publisher-key session
- `draft.js` - Draft Mode, Publish All payloads, IndexedDB draft recovery
- `site-controls.js` - content, appearance, SEO, and real-site preview
- `profile-editor.js` - profile crop/history/restore
- `asset-editor.js` - favicon/background/banner preparation
- `cms-ui.js` - publishing, library, presets, schedules, logs, import/export
- `workspace-loader.js` - lazy loading by workspace
- `ux.js` - toasts, accessible confirms, network state, focus handling
- `preferences.js` - browser-local admin appearance preferences
- `insights.js` - compact admin activity metrics
- `release.js` / `release.json` - admin version and changelog
- `stage.html` / `stage.js` - full-screen browser-local staging preview
- `pwa.js` / `sw.js` - install/update/offline behavior

## Draft recovery

Draft Mode is persisted in browser IndexedDB (`immortal-admin`, key `draft-v1`). Settings, SEO, and staged image blobs survive reloads and temporary connection loss.

The staging preview reads the same browser-local draft. Nothing in staging is public until **Publish All** succeeds.

If a browser profile is cleared, IndexedDB drafts are cleared too. For important long-term restore points, use a named snapshot or exported JSON backup instead.

## Publishing safety

A managed Publish All operation creates one Git commit and stores an automatic restore point first.

Retention:

- Automatic pre-publish backups: newest 20
- Manual named snapshots: newest 50
- Admin log entries: newest 60
- Reusable image library results: newest 80 shown
- Theme presets: newest 30
- Scheduled change records: newest 40

Manual snapshots are separate from automatic backups.

## Authentication

Preferred: GitHub OAuth. The Worker only accepts the configured GitHub account and issues a signed four-hour admin session. The GitHub OAuth access token is used server-side for the account lookup and is not returned to the browser.

Fallback: the emergency `ADMIN_KEY`. Keep it in Cloudflare secrets only; do not place it in repository files or screenshots.

Repeated failed authentication and OAuth-start attempts are rate-limited by the Worker.

## Staging

`/admin/profile/stage.html` is a local staging environment for the current browser draft. It renders the homepage full-screen with staged content/assets before public publishing.

This is intentionally browser-local. A true public branch/subdomain staging deployment would require enabling and configuring an additional GitHub Pages/Cloudflare deployment outside the repository.

## Testing

Two CI layers protect the admin:

1. `admin-smoke.yml` performs fast structural/import/syntax/security checks.
2. `admin-browser.yml` launches Chromium, exercises desktop/mobile navigation, command palette, draft recovery, staging preview, overflow invariants, and uploads visual screenshots as workflow artifacts.

The browser workflow never needs production admin secrets.

## Recovery checklist

If publishing breaks:

1. Open **System** and check authentication / logs.
2. Open **Overview** and refresh Worker/GitHub/live health.
3. Do not discard the draft; IndexedDB should keep it through reloads.
4. Retry publishing after connectivity recovers.
5. If a bad managed change went live, use **Undo last publish** or restore a named snapshot.
6. If the admin itself is broken, the repository data files and Worker remain independent of the browser UI and can be repaired through GitHub.

## Secret handling

Never commit or paste these values into website code, issues, logs, screenshots, or chat:

- `GITHUB_TOKEN`
- `ADMIN_KEY`
- `GITHUB_OAUTH_CLIENT_SECRET`

`GITHUB_OAUTH_CLIENT_ID` is an identifier, not a secret, but it is still configured through the Worker environment for consistency.
