import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['index.html', '404.html', 'privacy.html', 'analytics.html', 'commission', 'selina', 'projects'];
const ignoredHosts = new Set(['localhost', '127.0.0.1']);
const links = new Map();

async function exists(target) {
  try { await readFile(target); return true; } catch { return false; }
}

async function walk(target) {
  const full = path.resolve(target);
  try {
    const entries = await readdir(full, { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'artifacts') continue;
      const next = path.join(full, entry.name);
      if (entry.isDirectory()) out.push(...await walk(next));
      else if (entry.name.endsWith('.html')) out.push(next);
    }
    return out;
  } catch {
    return target.endsWith('.html') && await exists(full) ? [full] : [];
  }
}

for (const root of roots) {
  for (const file of await walk(root)) {
    const text = await readFile(file, 'utf8');
    for (const tagMatch of text.matchAll(/<(?:a|area|audio|embed|iframe|img|link|script|source|video)\b[^>]*>/gi)) {
      const tag = tagMatch[0];
      for (const match of tag.matchAll(/\b(?:href|src|poster|data-src)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) {
        try {
          const url = new URL(match[1]);
          if (ignoredHosts.has(url.hostname)) continue;
          const clean = url.href;
          const sources = links.get(clean) || [];
          sources.push(path.relative(process.cwd(), file).replaceAll('\\', '/'));
          links.set(clean, sources);
        } catch {}
      }
    }
  }
}

const failures = [];
const warnings = [];
const results = [];

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      headers: { 'user-agent': 'XM5O-Link-Watch/2.0' },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

for (const [url, sources] of links) {
  let status = null;
  let error = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      let response = await request(url, 'HEAD');
      if (response.status === 405 || response.status === 501) response = await request(url, 'GET');
      status = response.status;
      error = null;
      break;
    } catch (err) {
      error = err;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 900));
    }
  }

  const sourceLabel = [...new Set(sources)].slice(0, 3).join(', ');
  if (status === 404 || status === 410) {
    failures.push(url + ' -> HTTP ' + status + ' (' + sourceLabel + ')');
  } else if (status && status >= 500) {
    warnings.push(url + ' -> HTTP ' + status + ' (' + sourceLabel + ')');
  } else if (error) {
    warnings.push(url + ' -> ' + (error.message || 'network failure') + ' (' + sourceLabel + ')');
  } else if (status && !((status >= 200 && status < 400) || [401, 403, 429].includes(status))) {
    warnings.push(url + ' -> HTTP ' + status + ' (' + sourceLabel + ')');
  }

  results.push({ url, status, sourceLabel, error: error?.message || null });
}

await mkdir('artifacts/xm5o-guard', { recursive: true });
const report = [
  '# XM5O Guard external link watch',
  '',
  'External URLs checked: **' + links.size + '**',
  'Confirmed broken links: **' + failures.length + '**',
  'Transient/suspicious responses: **' + warnings.length + '**',
  '',
  ...(failures.length ? ['## Broken', '', ...failures.map(v => '- ' + v), ''] : []),
  ...(warnings.length ? ['## Warnings', '', ...warnings.map(v => '- ' + v), ''] : []),
  failures.length ? 'External link watch result: FAIL' : 'External link watch result: PASS'
].join('\n');

await writeFile('artifacts/xm5o-guard/external-links.md', report);
await writeFile('artifacts/xm5o-guard/external-links.json', JSON.stringify(results, null, 2));
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
}
if (failures.length) process.exit(1);
