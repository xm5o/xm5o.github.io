import { chromium } from 'playwright';
import axe from 'axe-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const base = process.env.SITE_TEST_URL || 'http://127.0.0.1:4173';
const baseSha = (process.env.XM5O_GUARD_BASE || '').trim();

const allPages = [
  { name: 'home', url: '/' },
  { name: '404', url: '/404.html' },
  { name: 'privacy', url: '/privacy.html' },
  { name: 'analytics', url: '/analytics.html' },
  { name: 'commission', url: '/commission/' },
  { name: 'selina', url: '/selina/' },
  { name: 'selina-case-study', url: '/projects/selina/' }
];

function changedFiles() {
  if (!baseSha || /^0+$/.test(baseSha)) return [];
  const run = spawnSync('git', ['diff', '--name-only', baseSha, 'HEAD'], { encoding: 'utf8' });
  if (run.status !== 0) return [];
  return run.stdout.split('\n').map(v => v.trim()).filter(Boolean);
}

function choosePages(files) {
  if (!files.length) return allPages;
  const shared = files.some(file =>
    /^(?:css|scripts|assets|data)\//.test(file) ||
    /^(?:index\.html|tests\/site-guard-browser\.mjs|\.github\/workflows\/xm5o-guard\.yml)$/.test(file)
  );
  if (shared) return allPages;

  const names = new Set();
  for (const file of files) {
    if (file === '404.html') names.add('404');
    if (file === 'privacy.html') names.add('privacy');
    if (file === 'analytics.html') names.add('analytics');
    if (file.startsWith('commission/')) names.add('commission');
    if (file.startsWith('selina/')) names.add('selina');
    if (file.startsWith('projects/selina/')) names.add('selina-case-study');
    if (file.startsWith('projects/') && !file.startsWith('projects/selina/')) names.add('home');
  }
  return allPages.filter(page => names.has(page.name));
}

const files = changedFiles();
const pages = choosePages(files);
const errors = [];
const warnings = [];
const results = [];

const browser = await chromium.launch({ headless: true });
const viewports = [
  ['desktop', { width: 1365, height: 900 }],
  ['mobile', { width: 390, height: 844 }]
];

for (const [viewportName, viewport] of viewports) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem('immortal-site-language-v1', 'en'));

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const pageErrors = [];
    const localRequestFailures = [];

    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => {
      try {
        const url = new URL(request.url());
        const origin = new URL(base).origin;
        const reason = request.failure()?.errorText || 'failed';
        const mediaPath = /\.(?:mp4|webm|mov|mp3|ogg|wav)$/i.test(url.pathname);
        const intentionallyAbortedMedia = reason.includes('ERR_ABORTED') && (request.resourceType() === 'media' || mediaPath);
        if (url.origin === origin && !intentionallyAbortedMedia) localRequestFailures.push(url.pathname + ': ' + reason);
      } catch {}
    });

    let response;
    try {
      response = await page.goto(base + pageInfo.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(700);
    } catch (error) {
      errors.push(`${pageInfo.name}-${viewportName}: navigation failed: ${error.message}`);
      await page.close();
      continue;
    }

    if (!response || response.status() >= 400) {
      errors.push(`${pageInfo.name}-${viewportName}: HTTP ${response?.status() ?? 'no response'}`);
    }

    if (pageErrors.length) {
      errors.push(`${pageInfo.name}-${viewportName}: page error: ${pageErrors.join(' | ')}`);
    }

    if (localRequestFailures.length) {
      errors.push(`${pageInfo.name}-${viewportName}: failed local request(s): ${[...new Set(localRequestFailures)].join(' | ')}`);
    }

    const structure = await page.evaluate(() => {
      const visible = el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
      };
      const missingNames = [...document.querySelectorAll('button, a[href], input, select, textarea')]
        .filter(visible)
        .filter(el => {
          const text = (el.textContent || '').trim();
          const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
          const alt = el.querySelector?.('img[alt]')?.getAttribute('alt');
          return !text && !aria && !alt;
        })
        .slice(0, 12)
        .map(el => el.outerHTML.slice(0, 180));

      const badHashes = [...document.querySelectorAll('a[href^="#"]')]
        .filter(a => a.id !== 'commandPaletteTrigger')
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.length > 1)
        .filter(href => {
          try { return !document.querySelector(href); } catch { return false; }
        });

      return {
        title: document.title,
        hasMain: Boolean(document.querySelector('main')),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 6,
        missingNames,
        badHashes: [...new Set(badHashes)]
      };
    });

    if (!structure.title.trim()) errors.push(`${pageInfo.name}-${viewportName}: empty document title`);
    if (!structure.hasMain) warnings.push(`${pageInfo.name}-${viewportName}: no <main> landmark`);
    if (structure.overflow) warnings.push(`${pageInfo.name}-${viewportName}: horizontal overflow detected`);
    if (structure.missingNames.length) warnings.push(`${pageInfo.name}-${viewportName}: ${structure.missingNames.length} visible interactive element(s) lack an accessible name`);
    if (structure.badHashes.length) errors.push(`${pageInfo.name}-${viewportName}: broken hash target(s): ${structure.badHashes.join(', ')}`);

    await page.addScriptTag({ content: axe.source });
    const axeResult = await page.evaluate(async () => {
      return window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
      });
    });

    const severe = axeResult.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    const moderate = axeResult.violations.filter(v => v.impact === 'moderate');
    if (severe.length) {
      warnings.push(`${pageInfo.name}-${viewportName}: ${severe.length} serious/critical accessibility rule(s): ${severe.map(v => v.id).join(', ')}`);
    }
    if (moderate.length) {
      warnings.push(`${pageInfo.name}-${viewportName}: ${moderate.length} moderate accessibility rule(s): ${moderate.map(v => v.id).join(', ')}`);
    }

    if (pageInfo.name === 'home') {
      const menu = page.locator('#menu-icon');
      if (await menu.count() && await menu.isVisible()) {
        const before = await menu.getAttribute('aria-expanded');
        await menu.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(150);
        const after = await menu.getAttribute('aria-expanded');
        if (before === after) warnings.push(`home-${viewportName}: mobile/menu toggle did not change aria-expanded`);
      }
    }

    results.push({
      page: pageInfo.name,
      viewport: viewportName,
      seriousAccessibilityRules: severe.length,
      moderateAccessibilityRules: moderate.length
    });
    await page.close();
  }

  await context.close();
}

await browser.close();
await mkdir('artifacts/xm5o-guard', { recursive: true });

const report = [
  '# XM5O Guard browser and accessibility',
  '',
  `Changed files considered: **${files.length || 'all'}**`,
  `Pages tested: **${pages.length}** across desktop and mobile`,
  `Hard failures: **${errors.length}**`,
  `Warnings: **${warnings.length}**`,
  '',
  ...(errors.length ? ['## Failures', '', ...errors.map(v => '- ' + v), ''] : []),
  ...(warnings.length ? ['## Warnings', '', ...warnings.map(v => '- ' + v), ''] : []),
  '## Coverage',
  '',
  ...results.map(r => `- ${r.page} (${r.viewport}): ${r.seriousAccessibilityRules} serious/critical a11y rules, ${r.moderateAccessibilityRules} moderate rules`),
  '',
  errors.length ? 'Browser guard result: FAIL' : 'Browser guard result: PASS'
].join('\n');

await writeFile('artifacts/xm5o-guard/browser.md', report);
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFile } = await import('node:fs/promises');
  await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
}
if (errors.length) process.exit(1);
