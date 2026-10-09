import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_LIMIT = 2 * 1024 * 1024;
const TEXT_EXT = /\.(?:html?|css|js|mjs|cjs|json|jsonc|ya?ml|toml|md|txt|xml|svg|sh|py|ps1|bat|env|ini|cfg)$/i;
const SENSITIVE_PATHS = [
  { label: 'environment file', regex: /(?:^|\/)\.env(?:\.(?!example$|sample$|template$)[^/]+)?$/i },
  { label: 'private key or certificate', regex: /(?:^|\/)(?:id_rsa|id_ed25519|[^/]+\.(?:pem|p12|pfx|key))$/i },
  { label: 'credential/config file', regex: /(?:^|\/)(?:\.npmrc|\.pypirc|credentials\.json|service-account\.json)$/i },
  { label: 'production source map', regex: /\.(?:js|css)\.map$/i }
];
// Assemble token signatures in pieces to avoid storing example credentials in this scanner.
const SECRET_RULES = [
  { label: 'GitHub token', regex: new RegExp('gh' + '[pousr]' + '_' + '[A-Za-z0-9]{30,}') },
  { label: 'GitHub fine-grained token', regex: new RegExp('github_' + 'pat_' + '[A-Za-z0-9_]{22,}') },
  { label: 'OpenAI-style secret', regex: new RegExp('sk-' + '(?:proj-)?' + '[A-Za-z0-9_-]{24,}') },
  { label: 'AWS access key', regex: new RegExp('AK' + 'IA' + '[A-Z0-9]{16}') },
  { label: 'Private key block', regex: new RegExp('-----BEGIN ' + '(?:RSA |EC |OPENSSH )?' + 'PRIVATE KEY-----') },
  { label: 'Hard-coded privileged site secret', regex: new RegExp('(?:GITHUB_TOKEN|ADMIN_KEY|GITHUB_OAUTH_CLIENT_SECRET)\\s*[:=]\\s*["\\x27`][^"\\x27`\\r\\n]{16,}["\\x27`]') }
];

function trackedFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error('Cannot list tracked Git files for security scan.');
  return result.stdout.split('\0').filter(Boolean);
}

function addFinding(list, file, label, line) {
  list.push({ file, label, ...(line ? { line } : {}) });
}

function location(text, index) {
  return text.slice(0, index).split('\n').length;
}

function selfTest() {
  const cases = [
    ['GitHub token', 'gh' + 'p_' + 'A'.repeat(36)],
    ['GitHub fine-grained token', 'github_' + 'pat_' + 'x'.repeat(30)],
    ['OpenAI-style secret', 'sk-' + 'proj-' + 'X'.repeat(40)],
    ['AWS access key', 'AK' + 'IA' + 'A'.repeat(16)],
    ['Private key block', '-----BEGIN ' + 'PRIVATE KEY-----'],
    ['Hard-coded privileged site secret', 'ADMIN_KEY' + ' = ' + '"' + 'x'.repeat(24) + '"']
  ];
  for (const [name, value] of cases) {
    if (!SECRET_RULES.find(rule => rule.label === name)?.regex.test(value)) {
      throw new Error('Security scanner self-test failed: ' + name);
    }
  }
}

selfTest();
const findings = [];
let filesInspected = 0;
let filesSkipped = 0;

for (const file of trackedFiles()) {
  const relative = file.replaceAll('\\', '/');
  for (const rule of SENSITIVE_PATHS) {
    if (rule.regex.test(relative)) addFinding(findings, relative, rule.label);
  }
  // Only scan text contents; extensions and size limits keep large media out of the CI job.
  if (!TEXT_EXT.test(relative) || relative === 'tests/site-security.mjs') continue;
  const full = path.resolve(ROOT, relative);
  const metadata = await stat(full);
  if (metadata.size > SCAN_LIMIT) {
    filesSkipped++;
    continue;
  }
  const content = await readFile(full, 'utf8');
  if (content.includes('\0')) continue;
  filesInspected++;
  for (const rule of SECRET_RULES) {
    const match = rule.regex.exec(content);
    if (match) addFinding(findings, relative, rule.label, location(content, match.index));
  }
}

const report = [
  '# XM5O Guard: committed-file security',
  '',
  '- Tracked text files scanned: ' + filesInspected,
  '- Large text files skipped: ' + filesSkipped,
  '- Findings: ' + findings.length,
  '',
  ...(findings.length
    ? ['## Review required', '', ...findings.map(f => '- ' + f.file + (f.line ? ':' + f.line : '') + ': ' + f.label), '']
    : ['Security guard result: PASS', '']),
  'This scan checks the current commit only, not historical Git commits. It is not a replacement for GitHub Secret Scanning or credential rotation.',
  'Matched secret values are intentionally never printed.'
].join('\n');

await mkdir('artifacts/xm5o-guard', { recursive: true });
await writeFile('artifacts/xm5o-guard/security.md', report + '\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
}
if (findings.length || filesSkipped) process.exitCode = 1;
