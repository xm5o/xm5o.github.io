import { readdir, readFile, lstat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const bundle = path.join(root, 'artifacts', 'public-preview');
const manifest = JSON.parse(await readFile(path.join(root, 'artifacts', 'deployment', 'public-file-manifest.json'), 'utf8'));
function assert(ok, text) {
  if (!ok) throw new Error(text);
}
async function walk(dir, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) out.push(...await walk(path.join(dir, entry.name), name));
    else out.push(name);
  }
  return out;
}
const actual = (await walk(bundle)).filter(f => f !== '.nojekyll').sort();
const expected = manifest.publicFiles.slice().sort();
assert(actual.length === expected.length, 'Staging bundle size differs from manifest.');
for (let i = 0; i < expected.length; i++) {
  assert(actual[i] === expected[i], 'Public file mismatch at index ' + i);
}
const required = [
  'index.html', '404.html', 'robots.txt', 'sitemap.xml',
  'admin/profile/index.html', 'admin/profile/auth.js',
  'scripts/analytics.js', 'scripts/discord-activity.js',
  'data/site-settings.json', 'data/i18n-ar.json',
  'assets/pfp.jpg', 'css/style.css', 'projects/selina/index.html'
];
for (const file of required) assert(expected.includes(file), 'Missing runtime asset: ' + file);
const blocked = [
  '.github/workflows/xm5o-guard.yml',
  'cloudflare/profile-uploader/src/router.js',
  'data/site-auto-backups.json',
  'data/site-manager-log.json',
  'data/site-snapshots.json',
  'data/site-schedule.json',
  'admin/profile/README.md',
  'tests/admin-smoke.mjs',
  'scripts/generate-admin-release-notes.mjs'
];
for (const file of blocked) assert(!expected.includes(file), 'Internal file was published: ' + file);
assert((await lstat(path.join(bundle, '.nojekyll'))).isFile(), 'Missing .nojekyll');
console.log('Public preview verification passed: ' + actual.length + ' public files and ' + blocked.length + ' internal paths excluded.');
