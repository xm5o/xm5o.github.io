# XM5O Private Source Migration

Status: preparation only. This change does not change GitHub Pages settings, Cloudflare Worker configuration, or the production website.

## Purpose

Keep development files, security test scripts, Worker source code and internal CMS metadata out of the site build. The static HTML, CSS, JavaScript, image files and other browser-required assets remain visible to website visitors even after migration.

## What the preview does

1. Run `node scripts/build-public-preview.mjs --copy`.
2. A clean site candidate is written to `artifacts/public-preview/`, not the GitHub Pages branch.
3. `tests/public-build-preview.mjs` compares every copied file with its allowlisted manifest.
4. The GitHub workflow uploads only its manifest/report, NOT the site, and does not request GitHub Pages deployment permission.

The output includes the current static admin UI because GitHub Pages cannot restrict its URL. Access to administration must be enforced by the Cloudflare Worker. Moving the admin UI behind a separate authenticated gateway is a different migration.

## Files explicitly withheld from the new public bundle

- `.github/`, `cloudflare/`, `tests/`, `docs/`, and development-only `.mjs` scripts.
- Local credentials, environment files, source maps and repository documentation.
- `data/site-auto-backups.json`, `data/site-manager-log.json`, `data/site-snapshots.json`, and `data/site-schedule.json`.

These exclusions do not hide already-committed files in the current public repository. The build becomes meaningful only once source is stored privately and the existing public repository is replaced or cleaned appropriately.

## Required steps before production cutover

1. Review and merge the prior admin-key and secret-scanner PRs after successful tests.
2. Create a new private GitHub repository under `xm5o`, such as `xm5o/xm5o-site-source`. Do not change the visibility or Pages settings of `xm5o/xm5o.github.io`.
3. Copy the full source project into the private repository. Keep credentials in GitHub Secrets or Cloudflare secrets, never in the repository.
4. Create a deployment workflow in the private repository. Build the allowlisted public artifact, then publish only those files to the public `xm5o/xm5o.github.io` repository. Use a narrowly scoped GitHub App or fine-grained deployment token, with rotation and rollback instructions.
5. Update the Cloudflare Worker to read/write the private source repository. Migrate settings, snapshots, logs, scheduled operations, upload assets, and the GitHub token together. Verify a CMS publish triggers a public-site deployment.
6. Test the public output via a separate staging destination, comparing HTML, images, CSS, JS, 404 page, admin login, i18n, SEO, Discord activity and the existing visitor counter before cutover.
7. Replace the public repository contents with the reviewed deployment output. Plan separately how to remove historic source from the public Git history: simply deleting files in one commit does not prevent access to old commits. Preserve backups and the same Pages URL.
8. Switch the GitHub Pages publishing source to the validated workflow/branch only after the deployment pipeline works.
9. Enable a branch ruleset, allowing ONLY the reviewed deployment workflow/bot to publish. Rotate source/deployment credentials following the migration.

## Rollback

Keep a verified private backup and the previous Pages settings before migrating. If publishing or the admin panel fails, restore the last good static build and the prior compatible Worker configuration. Do not restore any known-compromised credentials.

## Restrictions

- Do not automatically merge or deploy any migration from this preview.
- Do not disable or rework website analytics, visitor views, or their storage.
- Do not assume minification, noindex, removing F12, or hiding a repository prevents browser asset downloads.
- Cloudflare Worker and Firebase rules must receive a separate security review.
