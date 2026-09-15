# Immortal Profile Uploader

This Worker is the private write bridge for the website Profile Manager.

The public GitHub Pages site never receives the GitHub token. The browser sends only the prepared JPEG plus a separate publisher key to this Worker. The Worker validates the request and updates only the configured profile-picture path through GitHub's Contents API.

## One-time Cloudflare setup

1. In Cloudflare, open **Workers & Pages** and choose **Create application**.
2. Choose **Import a repository**, connect GitHub, and select `xm5o/xm5o.github.io`.
3. Use `cloudflare/profile-uploader` as the project/root directory.
4. The Worker project name is `xm5o-github-io`, matching `wrangler.jsonc`.
5. Deploy the Worker from the latest `main` commit. Do not retry an older failed build after changing the repository config, because a retry stays tied to that older commit.
6. In the deployed Worker's **Settings → Variables and Secrets**, add these two encrypted runtime secrets:
   - `GITHUB_TOKEN`
   - `ADMIN_KEY`
7. Redeploy after the secrets are saved.

Cloudflare will give the Worker a URL similar to:

```text
https://xm5o-github-io.<your-subdomain>.workers.dev
```

Open the website Profile Manager and save that URL plus the same `ADMIN_KEY` once. The browser remembers the publisher connection on that device.

## GitHub token

Create a fine-grained GitHub token restricted to only:

```text
xm5o/xm5o.github.io
```

Required repository permission:

```text
Contents: Read and write
```

Store the token only as the Cloudflare `GITHUB_TOKEN` runtime secret. Never put it in the website files, browser settings, build-variable names, Wrangler config, or commits.

## Publisher key

`ADMIN_KEY` is separate from the GitHub token. Use a long random value. This is the only credential the Profile Manager needs after setup.

If the publisher key is changed in Cloudflare, use **Forget connection** on the Profile Manager and save the new key.

## Routes

- `GET /health` checks Worker configuration.
- `GET /auth-check` verifies the publisher key.
- `POST /profile` accepts a JPEG and replaces `assets/pfp.jpg`.

The Worker accepts browser requests from `https://xm5o.github.io` and does not accept a client-selected repository, branch, or file path.
