import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SITE_URL || 'https://xm5o.github.io';
const expectedSha = (process.env.EXPECTED_SHA || '').trim();
const worker = 'https://xm5o-github-io.eminem13981398.workers.dev/health/status';

const pages = [
  { name: 'home', url: '/', selector: '#home, main, body', text: 'Immortal' },
  { name: 'commission', url: '/commission/', selector: 'main', text: 'FNF' },
  { name: 'selina', url: '/selina/', selector: 'body', text: 'Selina' },
  { name: 'selina-case-study', url: '/projects/selina/', selector: 'main', text: 'Selina' },
  { name: 'privacy', url: '/privacy.html', selector: 'main', text: 'Privacy' }
];

const errors = [];
const warnings = [];
const rows = [];

async function verifyWorkerCommit() {
  let last = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(worker, {
        headers: { 'user-agent': 'XM5O-Deploy-Verify/2.0' },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      last = data.latestCommit || null;
      if (!expectedSha || last === expectedSha) return { ok: true, latest: last };
    } catch (error) {
      last = error.message;
    }
    await new Promise(resolve => setTimeout(resolve, 8000));
  }
  return { ok: false, latest: last };
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const pageErrors = [];
const localFailures = [];

page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => {
  try {
    const url = new URL(request.url());
    if (url.hostname === 'xm5o.github.io') {
      localFailures.push(url.pathname + ': ' + (request.failure()?.errorText || 'failed'));
    }
  } catch {}
});

for (const item of pages) {
  const beforeErrors = pageErrors.length;
  const beforeFailures = localFailures.length;
  try {
    const response = await page.goto(base + item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector(item.selector, { timeout: 10000 });
    await page.waitForTimeout(500);
    const body = await page.locator('body').innerText();
    const status = response?.status() ?? 0;
    const ok = status >= 200 && status < 400 && body.includes(item.text);
    rows.push({ name: item.name, status, ok });
    if (!ok) errors.push(item.name + ': production page did not match expected content (HTTP ' + status + ')');
  } catch (error) {
    rows.push({ name: item.name, status: 0, ok: false });
    errors.push(item.name + ': production navigation failed: ' + error.message);
  }

  const newErrors = pageErrors.slice(beforeErrors);
  const newFailures = localFailures.slice(beforeFailures);
  if (newErrors.length) errors.push(item.name + ': browser error(s): ' + newErrors.join(' | '));
  if (newFailures.length) errors.push(item.name + ': failed production local request(s): ' + [...new Set(newFailures)].join(' | '));
}

await context.close();
await browser.close();

const commit = await verifyWorkerCommit();
if (!commit.ok) {
  errors.push('Worker/GitHub managed state did not report deployed commit ' + expectedSha + '; latest was ' + commit.latest);
}

await mkdir('artifacts/xm5o-guard', { recursive: true });
const report = [
  '# XM5O Guard production deploy verification',
  '',
  ...rows.map(row => '- ' + row.name + ': HTTP ' + row.status + ', ' + (row.ok ? 'content verified' : 'failed')),
  '- Worker latest commit: ' + (commit.latest || 'unknown'),
  '- Expected commit: ' + (expectedSha || 'not supplied'),
  '',
  'Hard failures: **' + errors.length + '**',
  'Warnings: **' + warnings.length + '**',
  '',
  ...(errors.length ? ['## Failures', '', ...errors.map(v => '- ' + v), ''] : []),
  errors.length ? 'Production verification result: FAIL' : 'Production verification result: PASS'
].join('\n');

await writeFile('artifacts/xm5o-guard/deploy.md', report);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
}
if (errors.length) process.exit(1);
