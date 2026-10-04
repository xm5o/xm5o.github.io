import { mkdir, writeFile } from 'node:fs/promises';

const checks = [
  {
    name: 'Cloudflare Worker health',
    url: 'https://xm5o-github-io.eminem13981398.workers.dev/health/status',
    validate: async response => {
      const data = await response.json();
      const required = ['workerOk', 'githubOk', 'liveOk'];
      const missing = required.filter(key => typeof data[key] !== 'boolean');
      if (missing.length) return { ok: false, detail: 'missing boolean field(s): ' + missing.join(', ') };
      const falseFlags = required.filter(key => data[key] !== true);
      return falseFlags.length
        ? { ok: true, warning: 'health flag(s) false: ' + falseFlags.join(', ') }
        : { ok: true };
    }
  },
  {
    name: 'Lanyard presence API',
    url: 'https://api.lanyard.rest/v1/users/1282747277206884436',
    validate: async response => {
      const data = await response.json();
      const ok = data?.success === true && data?.data?.discord_user?.id === '1282747277206884436';
      return ok ? { ok: true } : { ok: false, detail: 'unexpected Lanyard response shape' };
    }
  },
  {
    name: 'Discord profile API',
    url: 'https://dcdn.dstn.to/profile/1282747277206884436',
    validate: async response => {
      const data = await response.json();
      const looksValid = data && typeof data === 'object' && (
        data.user || data.profile || data.user_profile || data.id || data.bio !== undefined
      );
      return looksValid ? { ok: true } : { ok: false, detail: 'unexpected profile response shape' };
    }
  }
];

const failures = [];
const warnings = [];
const rows = [];

async function runCheck(check) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(check.url, {
        headers: { 'user-agent': 'XM5O-Guard/2.0' },
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.status >= 500) throw new Error('HTTP ' + response.status);
      if (response.status === 404 || response.status === 410) {
        return { ok: false, detail: 'HTTP ' + response.status };
      }
      if ([401, 403, 429].includes(response.status)) {
        return { ok: true, warning: 'reachable but returned HTTP ' + response.status };
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const validated = await check.validate(response);
      return { ...validated, status: response.status };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1200));
    }
  }
  return { ok: false, detail: lastError?.message || 'request failed' };
}

for (const check of checks) {
  const result = await runCheck(check);
  rows.push({ name: check.name, ...result });
  if (!result.ok) failures.push(check.name + ': ' + (result.detail || 'failed'));
  else if (result.warning) warnings.push(check.name + ': ' + result.warning);
}

await mkdir('artifacts/xm5o-guard', { recursive: true });
const report = [
  '# XM5O Guard API health',
  '',
  ...rows.map(row => '- ' + row.name + ': ' + (row.ok ? 'reachable' : 'failed') + (row.warning ? ' (' + row.warning + ')' : '') + (row.detail ? ' (' + row.detail + ')' : '')),
  '',
  'Hard failures: **' + failures.length + '**',
  'Warnings: **' + warnings.length + '**',
  '',
  ...(failures.length ? ['## Failures', '', ...failures.map(v => '- ' + v), ''] : []),
  ...(warnings.length ? ['## Warnings', '', ...warnings.map(v => '- ' + v), ''] : []),
  failures.length ? 'API guard result: FAIL' : 'API guard result: PASS'
].join('\n');

await writeFile('artifacts/xm5o-guard/api.md', report);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
}
if (failures.length) process.exit(1);
