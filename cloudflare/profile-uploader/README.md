# Immortal Admin Worker

This Cloudflare Worker is the private write bridge for `https://xm5o.github.io/admin/profile/`.

The public GitHub Pages site never receives the GitHub write token. The Worker owns repository writes and restricts the browser to the fixed Immortal site-management features implemented in `src/`.

## Required Cloudflare setup

The Worker is deployed from this repository with root directory:

```text
cloudflare/profile-uploader
```

Project/Worker name:

```text
xm5o-github-io
```

Required encrypted runtime secrets under **Worker → Settings → Variables and Secrets**:

- `GITHUB_TOKEN`
- `ADMIN_KEY`

`GITHUB_TOKEN` should be a fine-grained token restricted to `xm5o/xm5o.github.io` with **Contents: Read and write** only.

`ADMIN_KEY` is the emergency fallback site-manager login secret. Use a long random value. Never put either secret in Wrangler config, build-variable names, website JavaScript, Git commits, screenshots, or logs.

## GitHub account login

The CMS supports GitHub OAuth in addition to the emergency `ADMIN_KEY`.

Create a GitHub OAuth App owned by the `xm5o` account and use this callback URL:

```text
https://xm5o-github-io.eminem13981398.workers.dev/auth/github/callback
```

Then add these as encrypted Worker runtime secrets:

- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`

`GITHUB_ALLOWED_LOGIN` is fixed to `xm5o` in `wrangler.jsonc`. The callback rejects any other account.

Successful OAuth creates a signed **four-hour** admin session. The session contains only the allowed GitHub login and timing/nonce metadata. The GitHub OAuth access token is used server-side for the account lookup and is never returned to the admin browser.

## CMS features

The Worker supports:

- Profile picture upload, history and restore
- Managed favicon, background and banner
- Content, commission status, manual theme colors and maintenance mode
- Static SEO / Open Graph / Twitter metadata
- Draft **Publish All** transactions using one Git commit
- Automatic pre-publish restore points and **Undo last publish**
- Whole-site named snapshots
- Image library
- Theme presets
- Scheduled preset changes
- Portable JSON export/import
- Health checks and admin logs
- GitHub OAuth admin login with emergency-key fallback

## Security model

The repository, branch, managed paths, and allowed browser origin are fixed on the Worker side. The browser cannot select arbitrary repository paths.

Security protections include:

- CORS restricted to `https://xm5o.github.io`
- Constant-time comparison for the fallback admin key
- Signed, expiring GitHub OAuth sessions
- Four-hour OAuth session lifetime
- Ten-minute signed OAuth state window
- Per-IP throttling for repeated failed admin authentication
- Per-IP throttling for OAuth start/callback spam
- `Cache-Control: no-store` on API responses
- HSTS, `nosniff`, no-referrer, permissions restrictions, frame denial, and API CSP headers
- Managed JPEG validation before repository writes
- Automatic backup creation before instant legacy writes and transactional publishes

Rate limiting is intentionally a lightweight Worker-isolate guard. It is useful against repeated accidental/brute-force attempts but is not a substitute for Cloudflare account-level WAF/rate-limit rules if the Worker ever becomes a high-traffic public API.

## Retention rules

The Worker bounds repository-managed state so it does not grow indefinitely:

- Automatic pre-publish backups: 20
- Manual named snapshots: 50
- Admin log entries: 60
- Image library results returned to the admin: 80
- Theme presets: 30
- Scheduled change records: 40

Manual snapshots are stored separately from automatic backup metadata.

## Scheduled changes

`wrangler.jsonc` includes a five-minute Cron Trigger:

```text
*/5 * * * *
```

Immortal Admin stores scheduled preset changes in `data/site-schedule.json`. The scheduled Worker handler applies due presets and records their result.

## Main routes

Authentication and diagnostics:

- `GET /health`
- `GET /health/full`
- `GET /auth-check`
- `GET /auth/config`
- `GET /auth/github/start`
- `GET /auth/github/callback`

Publishing and history:

- `POST /profile`
- `GET /profile/history`
- `POST /profile/restore`
- `POST /cms/publish`
- `POST /cms/undo`

CMS data:

- `GET|POST /settings`
- `GET|POST /seo`
- `GET /activity`
- `GET|POST /snapshots`
- `POST /snapshots/restore`
- `GET|POST /presets`
- `GET|POST /schedule`
- `GET|POST /library`
- `GET /logs`
- `GET /backup/export`
- `POST /backup/import`

## Public-site headers

The Worker can harden its own API responses, but `xm5o.github.io` itself is served by GitHub Pages. Repository code cannot configure arbitrary HTTP response headers for GitHub Pages.

If strict server-level CSP/HSTS/custom header control is later needed for the public site, place a configurable CDN/proxy or a different hosting layer in front of the site rather than pretending a meta tag is equivalent to an HTTP security header.
