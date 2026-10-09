# XM5O Security Rollout

This checklist tracks the security migration without breaking `https://xm5o.github.io`, site analytics, visitor counts, or the existing admin publishing workflow.

## Current state (2026-10-09)

- The Pages repository `xm5o/xm5o.github.io` is public.
- The `main` branch has no protection or active rulesets.
- The Cloudflare Worker has privileged write access to `main`, so enabling mandatory pull requests before changing that workflow will disrupt the admin.
- GitHub OAuth is supported by the CMS. Emergency-key browser persistence removal is proposed separately in PR #33.
- Worker source, administrative metadata, and development tests are in the public repository.
- A full history audit, Cloudflare deployment review, and Firebase Security Rules review remain outstanding.

## Stage A. Prevent new accidental exposures

- Run `node tests/site-security.mjs` in XM5O Guard on pull requests and changes to `main`.
- Block tracked credential files, production source maps, and recognized secret patterns.
- Keep `.gitignore` in place, but remember it does not remove already tracked files or history.
- Run GitHub Secret Scanning, including a manual review of historical commits. Never paste identified secret values into issue reports.
- Revoke and rotate any credential confirmed exposed, even if subsequently removed from git.

## Stage B. Finish admin authentication hardening

- Review and merge PR #33 after OAuth and emergency-key manual verification.
- Rotate `ADMIN_KEY` in Cloudflare Worker runtime secrets after rollout. The old key also signs current OAuth sessions, so key rotation expires them.
- Prefer GitHub OAuth; retain emergency access under restricted procedures.
- Consider revocable, short-lived server-managed sessions in a future Worker update.

## Stage C. Split source from deployment

- Create a private source repository with application source, Worker code, tests, and build configuration.
- Keep the GitHub Pages deployment repository public with only intended browser assets.
- Generate the published files using a CI workflow from the private source.
- Exclude the admin internal history, logs, source maps, backup metadata, test suites, and Worker source from future deployments when the architecture supports it.
- Build a private test deployment and compare its output against production before changing Pages.
- Preserve the existing public URL and analytics wiring. Do not move or modify visitor-view counters.

## Stage D. Protect the publish path

- Give the Worker narrowly scoped write access to the private source/publish workflow instead of direct unrestricted commits to the public `main`.
- Require reviews or successful security tests on changes to the deployment branch.
- Add branch protection or a GitHub ruleset only AFTER confirming the Worker publishing and scheduled CMS changes still work.
- Limit `GITHUB_TOKEN` and GitHub Actions permissions to the minimum required.
- Review third-party Actions, pin critical ones to reviewed commit SHAs, and protect production environments.

## Stage E. Harden runtime and verify

- Review Cloudflare Worker route authorization, server-side rate limiting, OAuth callback/session handling, and allowed origins.
- Verify Firebase Security Rules and API key restrictions. Browser Firebase configuration is not a secret by itself.
- Test unauthenticated access to sensitive APIs and files without impacting production users.
- Verify desktop/mobile pages, the admin, Discord activity, site SEO, and visitor counts.
- Keep a rollback plan and a verified recovery point.

## Important limitations

Code delivered to a user's browser stays accessible to that user through DevTools or HTTP requests. Minification is not access control. GitHub `Private` source protection only helps with files excluded from public deployment. Previously published source or leaked secrets cannot be made secret retroactively by rewriting the current branch.
