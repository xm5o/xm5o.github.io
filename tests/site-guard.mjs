import { access, readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const CORE_ROOTS = ['index.html', '404.html', 'privacy.html', 'analytics.html', 'commission', 'selina', 'projects'];
const CODE_ROOTS = ['scripts', 'commission', 'selina', 'projects'];
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'artifacts']);
const errors = [];
const warnings = [];
const notes = [];

const rel = file => path.relative(root, file).replaceAll('\\', '/');

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

async function walk(target) {
  const full = path.join(root, target);
  if (!(await exists(full))) return [];
  const s = await stat(full);
  if (s.isFile()) return [full];
  const out = [];
  for (const entry of await readdir(full, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) out.push(...await walk(rel(child)));
    else out.push(child);
  }
  return out;
}

const unique = list => [...new Set(list)];
const coreFiles = unique((await Promise.all(CORE_ROOTS.map(walk))).flat());
const codeFiles = unique((await Promise.all(CODE_ROOTS.map(walk))).flat());
const htmlFiles = coreFiles.filter(file => file.endsWith('.html'));
const cssFiles = coreFiles.filter(file => file.endsWith('.css'));
const jsFiles = codeFiles.filter(file => /\.(?:js|mjs)$/i.test(file));

function stripQueryHash(value) {
  return value.split('#')[0].split('?')[0];
}

function isExternalOrDynamic(value) {
  return !value || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|#|\/\/)/i.test(value) || /[{}$]/.test(value);
}

async function resolveLocalRef(raw, sourceFile) {
  let value = String(raw || '').trim().replace(/^['"]|['"]$/g, '');
  if (isExternalOrDynamic(value)) return null;
  value = stripQueryHash(value);
  if (!value) return null;
  try { value = decodeURIComponent(value); } catch {}

  let candidate = value.startsWith('/')
    ? path.join(root, value.slice(1))
    : path.resolve(path.dirname(sourceFile), value);

  const attempts = [candidate];
  if (path.extname(candidate) === '') attempts.push(candidate + '.html');
  attempts.push(path.join(candidate, 'index.html'));

  for (const attempt of attempts) {
    try {
      const s = await stat(attempt);
      if (s.isFile()) return attempt;
      if (s.isDirectory()) {
        const index = path.join(attempt, 'index.html');
        if (await exists(index)) return index;
      }
    } catch {}
  }
  return false;
}

function collectRefs(text, file) {
  const refs = [];
  if (file.endsWith('.html')) {
    for (const match of text.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) refs.push(match[1]);
    for (const match of text.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      for (const part of match[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
    }
  }
  if (file.endsWith('.html') || file.endsWith('.css')) {
    for (const match of text.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) refs.push(match[1]);
  }
  return refs;
}

for (const file of [...htmlFiles, ...cssFiles]) {
  const text = await readFile(file, 'utf8');
  for (const raw of collectRefs(text, file)) {
    const resolved = await resolveLocalRef(raw, file);
    if (resolved === false) errors.push('Broken local reference: ' + rel(file) + ' -> ' + raw);
  }
}

function checkSyntax(source, label, moduleMode = false) {
  const run = spawnSync(process.execPath, ['--check', '--input-type=' + (moduleMode ? 'module' : 'commonjs')], {
    input: source,
    encoding: 'utf8'
  });
  if (run.status !== 0) {
    const detail = String(run.stderr || run.stdout || '').trim().split('\n').slice(0, 7).join('\n');
    errors.push('JavaScript syntax error in ' + label + (detail ? '\n' + detail : ''));
  }
}

for (const file of jsFiles) {
  const source = await readFile(file, 'utf8');
  const moduleMode = file.endsWith('.mjs') || /(^|\n)\s*(?:import\s|export\s)/m.test(source);
  checkSyntax(source, rel(file), moduleMode);
}

for (const file of htmlFiles) {
  const text = await readFile(file, 'utf8');
  const name = rel(file);
  const lower = text.toLowerCase();

  if (!/^\s*<!doctype html>/i.test(text)) warnings.push(name + ': missing <!DOCTYPE html>.');
  if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(text)) warnings.push(name + ': missing html lang attribute.');
  if (!/<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(text)) warnings.push(name + ': missing viewport meta tag.');
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(text)) errors.push(name + ': missing or empty <title>.');

  const ids = [...text.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
  const seen = new Set();
  const dupes = unique(ids.filter(id => seen.has(id) ? true : (seen.add(id), false)));
  if (dupes.length) warnings.push(name + ': duplicate id(s): ' + dupes.slice(0, 8).join(', '));

  const noindex = /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*content\s*=\s*["'][^"']*noindex/i.test(lower) ||
    /<meta\b[^>]*content\s*=\s*["'][^"']*noindex[^"']*["'][^>]*name\s*=\s*["']robots["']/i.test(lower);
  if (!noindex) {
    if (!/<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["'][^"']{20,}["']/i.test(text) &&
        !/<meta\b[^>]*content\s*=\s*["'][^"']{20,}["'][^>]*name\s*=\s*["']description["']/i.test(text)) {
      warnings.push(name + ': indexable page has no useful meta description.');
    }
    if (!/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["'][^"']+["']/i.test(text) &&
        !/<link\b[^>]*href\s*=\s*["'][^"']+["'][^>]*rel\s*=\s*["']canonical["']/i.test(text)) {
      warnings.push(name + ': indexable page has no canonical URL.');
    }
  }
}

async function sizeRegression() {
  const base = process.env.XM5O_GUARD_BASE?.trim();
  if (!base || /^0+$/.test(base)) return;
  const verify = spawnSync('git', ['cat-file', '-e', base + '^{commit}']);
  if (verify.status !== 0) {
    notes.push('Performance comparison skipped because the base commit is unavailable.');
    return;
  }

  const diff = spawnSync('git', ['diff', '--name-status', '-z', base, 'HEAD'], { encoding: 'utf8' });
  if (diff.status !== 0) return;
  const parts = diff.stdout.split('\0').filter(Boolean);
  const changes = [];
  for (let i = 0; i < parts.length;) {
    const statusCode = parts[i++];
    if (statusCode.startsWith('R') || statusCode.startsWith('C')) {
      i++;
      const current = parts[i++];
      changes.push([statusCode[0], current]);
    } else {
      changes.push([statusCode[0], parts[i++]]);
    }
  }

  const monitored = /\.(?:html|css|js|mjs|json|svg|png|jpe?g|webp|avif|gif|ico|mp3|ogg|wav|mp4|webm)$/i;
  let totalGrowth = 0;
  for (const [statusCode, name] of changes) {
    if (!name || !monitored.test(name) || statusCode === 'D') continue;
    const full = path.join(root, name);
    if (!(await exists(full))) continue;
    const now = (await stat(full)).size;
    let before = 0;
    if (statusCode !== 'A') {
      const old = spawnSync('git', ['cat-file', '-s', base + ':' + name], { encoding: 'utf8' });
      if (old.status === 0) before = Number(old.stdout.trim()) || 0;
    }
    const growth = now - before;
    totalGrowth += Math.max(0, growth);
    const ratio = before > 0 ? growth / before : 1;
    if (growth > 128 * 1024 && ratio > 0.25) warnings.push('Size regression: ' + name + ' grew by ' + (growth / 1024).toFixed(0) + ' KB.');
    if (/\.(?:html|css|js|mjs)$/i.test(name) && growth > 512 * 1024) errors.push('Large code-size regression: ' + name + ' grew by more than 512 KB.');
    if (/\.(?:png|jpe?g|webp|avif|gif|mp3|ogg|wav|mp4|webm)$/i.test(name) && now > 25 * 1024 * 1024) errors.push('Oversized changed asset: ' + name + ' is over 25 MB.');
    else if (/\.(?:png|jpe?g|webp|avif|gif|mp3|ogg|wav|mp4|webm)$/i.test(name) && now > 5 * 1024 * 1024) warnings.push('Heavy changed asset: ' + name + ' is over 5 MB.');
  }
  if (totalGrowth > 5 * 1024 * 1024) warnings.push('Changed monitored files added ' + (totalGrowth / 1024 / 1024).toFixed(1) + ' MB in total.');
}

await sizeRegression();

const summary = [
  '# XM5O Guard',
  '',
  '- HTML pages checked: ' + htmlFiles.length,
  '- JavaScript files syntax-checked: ' + jsFiles.length,
  '- Hard failures: ' + errors.length,
  '- Warnings: ' + warnings.length,
  ''
];

if (errors.length) summary.push('## Failures', '', ...errors.slice(0, 80).map(item => '- ' + item.replaceAll('\n', '\n  ')), '');
if (warnings.length) summary.push('## Warnings', '', ...warnings.slice(0, 100).map(item => '- ' + item), '');
if (notes.length) summary.push('## Notes', '', ...notes.map(item => '- ' + item), '');
if (!errors.length) summary.push('Guard result: PASS');

console.log(summary.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary.join('\n') + '\n');
}

if (errors.length) process.exit(1);
