import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SITE_URL || 'https://xm5o.github.io';
const expectedSha = (process.env.EXPECTED_SHA || '').trim();

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

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      'user-agent': 'XM5O-Deploy-Verify/2.0',
      'cache-control': 'no-cache'
    },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
  return response.text();
}

async function waitForExpectedProduction() {
  if (!expectedSha) return { ok: false, detail: 'Expected commit SHA was not supplied.' };

  let expected;
  try {
    expected = await fetchText(
      'https://raw.githubusercontent.com/xm5o/xm5o.github.io/' +
      encodeURIComponent(expectedSha) +
      '/index.html'
    );
  } catch (error) {
    return { ok: false, detail: 'Could not fetch expected index.html: ' + error.message };
  }

  let lastDetail = 'production index did not match yet';
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const live = await fetchText(base + '/index.html?xm5o_guard=' + Date.now());
      if (live === expected) return { ok: true, attempts: attempt };
      lastDetail = 'live index differs from expected commit';
    } catch (error) {
      lastDetail = error.message;
    }
    if (attempt < 12) await new Promise(resolve => setTimeout(resolve, 10000));
  }
  return { ok: false, detail: lastDetail };
}

const deployment = await waitForExpectedProduction();
if (!deployment.ok) {
  errors.push('Production never matched commit ' + expectedSha + ': ' + deployment.detail);
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
    const reason = request.failure()?.errorText || 'failed';
    const mediaPath = /\.(?:mp4|webm|mov|mp3|ogg|wav)$/i.test(url.pathname);
    const intentionalMediaAbort = reason.includes('ERR_ABORTED') && mediaPath;
    if (url.hostname === 'xm5o.github.io' && !intentionalMediaAbort) {
      localFailures.push(url.pathname + ': ' + reason);
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

await mkdir('artifacts/xm5o-guard', { recursive: true });
const report = [
  '# XM5O Guard production deploy verification',
  '',
  '- Expected commit: ' + (expectedSha || 'not supplied'),
  '- Production commit match: ' + (deployment.ok ? 'verified' : 'failed'),
  '- Match attempts: ' + (deployment.attempts || 'n/a'),
  ...rows.map(row => '- ' + row.name + ': HTTP ' + row.status + ', ' + (row.ok ? 'content verified' : 'failed')),
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
