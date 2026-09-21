import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const htmlFiles = [
  'index.html',
  'privacy.html',
  '404.html',
  'analytics.html',
  'selina/index.html',
  'commission/index.html'
];
const jsFiles = [
  'scripts/home.js',
  'scripts/projects.js',
  'scripts/discord-activity.js',
  'scripts/site-settings.js',
  'scripts/analytics-dashboard.js',
  'commission/app.js',
  'commission/commission.js',
  'commission/enhancements.js',
  'commission/features.js',
  'commission/ad.js'
];

const dictionary = JSON.parse(await readFile(path.join(root, 'data/i18n-ar.json'), 'utf8'));
const normalize = value => String(value ?? '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const normalizedDictionary = new Set(Object.keys(dictionary).map(normalize));

const allowedExact = new Set([
  'Immortal','Selina','Discord','GitHub','Spotify','PayPal','Psych Engine','Codename Engine',
  'Lua','Haxe','JavaScript','CSS3','HTML5','HTML5/CSS3','Git','Fortnite','Groq','Instagram',
  'YouTube','TikTok','Twitch','Twitter','Twitter/X','X','I','@user','@trr0','xm5o.github.io',
  'ipwho.is','Lua / Source','Rejected Chart','Reactor','Astral Calamity','Anti Dote','Bloodline',
  'Ignition','IGNITION','Cigarettes After Sex','Hideaway','Opera House','Heavenly','Hentai',
  'Dreams From Bunker Hill','Keep on Loving You','Apocalypse','Flash','Sweet','Neon Moon',
  'Affection',"X's","You're The Only Good Thing In My Life",'creativity','console.log',
  '"hello world"','&times;','Discord Quest Finisher','FNF Chart Creator',"FNF': Immortality Collection"
]);
const allowedLower = new Set([...allowedExact].map(value => value.toLowerCase()));

const allowedPatterns = [
  /^\/[a-z0-9_-]+$/i,
  /^https?:\/\//i,
  /^mailto:/i,
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/,
  /^\d+(?:[:/., -]\d+)*$/,
  /^[$€£¥]\s*\d/i,
  /^\d+%$/,
  /^[©|·—–\-]+$/,
  /^assets\//i,
  /^\.\.\//,
  /^#[a-z0-9_-]+$/i,
  /^\.[a-z0-9_-]+$/i,
  /^rgba?\(/i,
  /^hsla?\(/i,
  /^(?:linear|radial)-gradient\(/i,
  /^(?:translate|scale|rotate)[XYZ3d]*\(/i,
  /^(?:image\/|application\/|text\/)/i
];

function allowed(text) {
  if (!text || !/[A-Za-z]/.test(text)) return true;
  if (normalizedDictionary.has(text) || allowedExact.has(text) || allowedLower.has(text.toLowerCase())) return true;
  return allowedPatterns.some(pattern => pattern.test(text));
}

const failures = [];
function requireTranslation(file, value, kind='text') {
  const text = normalize(value);
  if (!text || !/[A-Za-z]/.test(text) || allowed(text)) return;
  failures.push({ file, kind, text });
}

for (const file of htmlFiles) {
  const source = await readFile(path.join(root, file), 'utf8');
  const visible = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');

  for (const match of visible.matchAll(/>([^<>]+)</g)) requireTranslation(file, match[1], 'visible text');

  for (const attr of ['placeholder','aria-label','title','alt']) {
    const re = new RegExp(attr + '=["\\\']([^"\\\']+)["\\\']', 'gi');
    for (const match of source.matchAll(re)) requireTranslation(file, match[1], attr);
  }
}

const dynamicPatterns = [
  { kind:'textContent', re:/(?:textContent|innerText)\s*=\s*'((?:\\.|[^'\\])*)'/g },
  { kind:'textContent', re:/(?:textContent|innerText)\s*=\s*"((?:\\.|[^"\\])*)"/g },
  { kind:'message', re:/(?:showToast|setStatus|setSeoStatus|friendlyError)\(\s*'((?:\\.|[^'\\])*)'/g },
  { kind:'message', re:/(?:showToast|setStatus|setSeoStatus|friendlyError)\(\s*"((?:\\.|[^"\\])*)"/g },
  { kind:'UI object text', re:/\b(?:title|subtitle|description|message)\s*:\s*'((?:\\.|[^'\\])*)'/g },
  { kind:'UI object text', re:/\b(?:title|subtitle|description|message)\s*:\s*"((?:\\.|[^"\\])*)"/g }
];

for (const file of jsFiles) {
  const source = await readFile(path.join(root, file), 'utf8');
  for (const {kind,re} of dynamicPatterns) {
    for (const match of source.matchAll(re)) {
      const value = normalize(match[1].replace(/\\'/g,"'").replace(/\\"/g,'"'));
      if (!value || /[{}<>;$]/.test(value) || /^\w+[.#:[\]]/.test(value)) continue;
      requireTranslation(file, value, kind);
    }
  }
}

const settings = JSON.parse(await readFile(path.join(root,'data/site-settings.json'),'utf8'));
for (const [en,ar] of [
  ['bio','bioAr'],
  ['statusText','statusTextAr'],
  ['maintenanceTitle','maintenanceTitleAr'],
  ['maintenanceMessage','maintenanceMessageAr']
]) {
  if (!String(settings[en]||'').trim()) failures.push({file:'data/site-settings.json',kind:'managed English field',text:en+' is empty'});
  if (!String(settings[ar]||'').trim() || !/[\u0600-\u06FF]/.test(String(settings[ar]))) failures.push({file:'data/site-settings.json',kind:'managed Arabic field',text:ar+' is missing Arabic content'});
}

const seo = JSON.parse(await readFile(path.join(root,'data/site-seo.json'),'utf8'));
for (const [en,ar] of [['title','titleAr'],['description','descriptionAr']]) {
  if (!String(seo[en]||'').trim()) failures.push({file:'data/site-seo.json',kind:'managed English SEO',text:en+' is empty'});
  if (!String(seo[ar]||'').trim() || !/[\u0600-\u06FF]/.test(String(seo[ar]))) failures.push({file:'data/site-seo.json',kind:'managed Arabic SEO',text:ar+' is missing Arabic content'});
}

if (failures.length) {
  console.error('\nTranslation coverage failed. Add Arabic text to data/i18n-ar.json or, for intentional names/technical terms, add a narrow allowlist entry in tests/translation-coverage.mjs.\n');
  for (const item of failures.slice(0,80)) console.error('- '+item.file+' ['+item.kind+']: '+item.text);
  if (failures.length > 80) console.error('- ...and '+(failures.length-80)+' more');
  process.exit(1);
}

console.log('Translation coverage passed for '+htmlFiles.length+' public pages, dynamic UI checks, and bilingual managed content.');
