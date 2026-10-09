import { spawnSync } from 'node:child_process';
import { copyFile, lstat, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'artifacts', 'deployment');
const destination = path.join(root, 'artifacts', 'public-preview');
const shouldCopy = process.argv.includes('--copy');

const ROOT_FILES = new Set([
  'index.html', '404.html', 'analytics.html', 'privacy.html',
  'robots.txt', 'sitemap.xml', 'CNAME'
]);
const PUBLIC_TREES = ['assets/', 'css/', 'commission/', 'projects/', 'qudurat/', 'selina/'];
const DATA_FILES = new Set([
  'data/i18n-ar.json', 'data/optimized-assets.json',
  'data/site-seo.json', 'data/site-settings.json', 'data/theme-presets.json'
]);
const EXCLUDE_PATTERN = /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git(?:\/|$)|node_modules|README\.md|[^/]+\.(?:pem|key|p12|pfx)|[^/]+\.(?:js|css)\.map)$/i;
const PUBLIC_EXTENSION = /\.(?:html?|css|js|json|svg|webmanifest|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|mp3|ogg|wav|m4a|mp4|webm|mov|vtt|txt|xml|pdf)$/i;

function included(file) {
  if (file.startsWith('/') || file.includes('..') || EXCLUDE_PATTERN.test(file)) return false;
  if (ROOT_FILES.has(file)) return true;
  if (DATA_FILES.has(file)) return true;
  if (!PUBLIC_EXTENSION.test(file)) return false;
  if (file.startsWith('admin/profile/')) return true;
  if (file.startsWith('scripts/')) return file.endsWith('.js');
  return PUBLIC_TREES.some(prefix => file.startsWith(prefix));
}

const command = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (command.status !== 0) throw new Error('Cannot read tracked Git file list.');
const tracked = command.stdout.split('\0').filter(Boolean);
const publicFiles = tracked.filter(included).sort();
const required = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'admin/profile/index.html', 'scripts/analytics.js', 'scripts/discord-activity.js', 'data/site-settings.json'];
for (const file of required) {
  if (!publicFiles.includes(file)) throw new Error('Missing required public file: ' + file);
}
if (publicFiles.some(p => p.startsWith('cloudflare/') || p.startsWith('tests/') || p.startsWith('.github/') || p.startsWith('docs/'))) {
  throw new Error('Private source or development tooling entered the public build.');
}
if (publicFiles.some(p => /data\/(?:site-auto-backups|site-manager-log|site-schedule|site-snapshots)\.json/.test(p))) {
  throw new Error('Internal CMS metadata entered the public build.');
}

let bytes = 0;
for (const file of publicFiles) {
  const source = path.join(root, file);
  const info = await lstat(source);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('Public asset must be a regular file: ' + file);
  bytes += info.size;
}
if (shouldCopy) {
  // Only remove an artifact directory. Never touch the source checkout or Pages branch.
  await rm(destination, { recursive: true, force: true });
  for (const file of publicFiles) {
    const target = path.join(destination, file);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(root, file), target);
  }
  await writeFile(path.join(destination, '.nojekyll'), '');
}
const excluded = tracked.filter(file => !included(file)).sort();
const report = [
  '# XM5O isolated public build preview',
  '',
  '- Build mode: ' + (shouldCopy ? 'copy into artifact directory' : 'manifest only'),
  '- Public files: ' + publicFiles.length,
  '- Internal/excluded files: ' + excluded.length,
  '- Public asset bytes: ' + bytes,
  '- Live Pages configuration changed: no',
  '- Site visitor counter changed: no',
  '',
  '## Excluded paths (review before migration)',
  '',
  ...excluded.map(file => '- ' + file),
  '',
  '## What this does not secure',
  '',
  'This preview does not remove historical public Git files or update the Cloudflare Worker.',
  'The static browser code, including the admin UI, remains publicly inspectable when deployed.',
  'The private source migration and production Pages configuration still require separate steps.',
  ''
].join('\n');
await mkdir(reportDir, { recursive: true });
await writeFile(path.join(reportDir, 'public-build-preview.md'), report);
await writeFile(path.join(reportDir, 'public-file-manifest.json'), JSON.stringify({ version: 1, count: publicFiles.length, bytes, publicFiles, excluded }, null, 2) + '\n');
console.log('XM5O public build preview PASS: ' + publicFiles.length + ' files, ' + excluded.length + ' excluded.');
console.log('Mode: ' + (shouldCopy ? 'copied locally without deployment' : 'manifest only'));
