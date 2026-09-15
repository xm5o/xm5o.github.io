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

`ADMIN_KEY` is the fallback site-manager login secret. Use a long random value. Never put either secret in Wrangler config, build-variable names, website JavaScript, or Git commits.

The Worker URL is currently used by the admin app as its default publisher origin.

## Optional GitHub account login

The CMS supports GitHub OAuth in addition to the fallback `ADMIN_KEY`.

To enable it, create a GitHub OAuth App owned by the `xm5o` account and use this callback URL:

```text
https://xm5o-github-io.eminem13981398.workers.dev/auth/github/callback
```

Then add these as encrypted Worker runtime secrets:

- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`

`GITHUB_ALLOWED_LOGIN` is already fixed to `xm5o` in `wrangler.jsonc`. The OAuth callback rejects any other GitHub account. Successful login creates a signed, temporary admin session using the Worker-side `ADMIN_KEY`; the browser does not receive the GitHub OAuth access token.

If OAuth is not configured, Immortal Admin automatically keeps the private-key login available.

## CMS features

The Worker now supports:

- Profile picture upload, history and restore
- Managed favicon, background and banner
- Content, commission status, manual theme colors and maintenance mode
- Static SEO / Open Graph / Twitter metadata
- Draft **Publish All** transactions using one Git commit
- Automatic pre-publish restore points and **Undo last publish**
- Whole-site snapshots
- Image library
- Theme presets
- Scheduled preset changes
- Portable JSON export/import
- Health checks and admin logs
- Optional GitHub OAuth admin login

## Scheduled changes

`wrangler.jsonc` includes a five-minute Cron Trigger:

```text
*/5 * * * *
```

Immortal Admin stores scheduled preset changes in `data/site-schedule.json`. The scheduled Worker handler applies due presets and records their result.

## Safety model

The browser cannot select an arbitrary repository. The repository and branch are fixed by Worker environment variables.

The transactional publisher accepts only the managed site files and known CMS data files. Images are prepared as JPEGs in the admin UI, and the Worker validates managed image payloads before committing them.

Automatic backup metadata is stored in `data/site-auto-backups.json`, so managed publishes can be reversed without rolling back unrelated repository code.

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

Browser CORS is restricted to `https://xm5o.github.io`.
