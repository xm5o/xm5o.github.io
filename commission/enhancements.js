import { getAnalyticsDb, ANALYTICS_DOCS } from '../scripts/analytics-config.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const USD_RATE = 4;
const LOCALE_CACHE_KEY = 'immortal-commission-locale-v1';
let localeInfo = { country: 'International', countryCode: 'XX', flag: '🌐', currency: 'USD', symbol: '$', rate: 1 };

function ensureStyles() {
  if (document.querySelector('link[data-commission-enhancements]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'enhancements.css';
  link.dataset.commissionEnhancements = 'true';
  document.head.append(link);
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function dimensionId(value) {
  const text = String(value || 'Unknown').trim() || 'Unknown';
  const slug = text.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44) || 'unknown';
  return `${slug}-${hashString(text)}`;
}

function dateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function injectTrafficPanel() {
  if (document.querySelector('.commission-traffic')) return;
  const anchor = document.querySelector('.training-notice');
  if (!anchor) return;

  const panel = document.createElement('section');
  panel.className = 'commission-traffic shell';
  panel.setAttribute('aria-label', 'Commission traffic summary');
  panel.innerHTML = `
    <div class="traffic-intro"><i class="bx bx-show"></i><div><small>Live traffic</small><strong>Commission activity</strong></div></div>
    <div class="traffic-stat"><small>Site visitors</small><strong id="commissionSiteVisitors">—</strong></div>
    <div class="traffic-stat"><small>Commission views</small><strong id="commissionPageViews">—</strong></div>
    <div class="traffic-stat"><small>Today</small><strong id="commissionTodayVisitors">—</strong></div>`;
  anchor.insertAdjacentElement('afterend', panel);

  try {
    const db = getAnalyticsDb();
    const summaryRef = doc(db, ANALYTICS_DOCS.summary.collection, ANALYTICS_DOCS.summary.document);
    onSnapshot(summaryRef, snapshot => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const path = location.pathname || '/commission/';
      const pageId = dimensionId(path);
      const pageViews = Number(data?.analyticsV2?.dimensions?.pages?.[pageId]?.views || 0);
      const siteVisitors = Number(data?.totalViews || 0);
      const todayVisitors = Number(data?.analyticsV2?.daily?.[dateKey()]?.visitors || 0);
      document.getElementById('commissionSiteVisitors').textContent = siteVisitors.toLocaleString();
      document.getElementById('commissionPageViews').textContent = pageViews.toLocaleString();
      document.getElementById('commissionTodayVisitors').textContent = todayVisitors.toLocaleString();
    }, () => {
      ['commissionSiteVisitors', 'commissionPageViews', 'commissionTodayVisitors'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
    });
  } catch (error) {
    console.warn('[Commission] Traffic counters unavailable:', error?.message || error);
  }
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch {}
}

async function detectLocale() {
  const cached = safeSessionGet(LOCALE_CACHE_KEY);
  if (cached) {
    try { return { ...localeInfo, ...JSON.parse(cached) }; } catch {}
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch('https://ipwho.is/', { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) return localeInfo;
    const data = await response.json();
    if (data?.success === false) return localeInfo;

    const rate = Number(data?.currency?.exchange_rate);
    const detected = {
      country: data?.country || 'International',
      countryCode: data?.country_code || 'XX',
      flag: data?.flag?.emoji || '🌐',
      currency: data?.currency?.code || 'USD',
      symbol: data?.currency?.symbol || '$',
      rate: Number.isFinite(rate) && rate > 0 ? rate : 1
    };
    safeSessionSet(LOCALE_CACHE_KEY, JSON.stringify(detected));
    return detected;
  } catch {
    return localeInfo;
  } finally {
    clearTimeout(timeout);
  }
}

function formatMoney(usd, info = localeInfo) {
  const converted = usd * info.rate;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: info.currency,
      maximumFractionDigits: converted >= 100 ? 0 : 2
    }).format(converted);
  } catch {
    return `${info.symbol || info.currency} ${converted.toFixed(converted >= 100 ? 0 : 2)}`;
  }
}

function setPriceText(element, suffix = '') {
  if (!element) return;
  const local = formatMoney(USD_RATE);
  element.classList.add('localized-price-pulse');
  if (localeInfo.currency === 'USD') {
    element.textContent = `${local}${suffix}`;
  } else {
    element.innerHTML = `<span class="local-price">${local}${suffix}</span><span class="usd-base">$4 USD${suffix}</span>`;
  }
}

function injectCurrencyUI() {
  const pricingLayout = document.querySelector('#pricing .pricing-layout');
  if (!pricingLayout || document.querySelector('.currency-localizer')) return;

  const bar = document.createElement('div');
  bar.className = 'currency-localizer';
  bar.innerHTML = `
    <div class="currency-location"><span class="currency-flag">${localeInfo.flag}</span><div><small>Localized pricing</small><strong>${localeInfo.country} · ${localeInfo.currency}</strong></div></div>
    <div class="currency-rate">Prices are converted from the USD base rate for easier reading.</div>`;
  pricingLayout.before(bar);

  setPriceText(document.querySelector('#services .service-card.featured .service-footer strong'), '/min');
  const priceSpan = document.querySelector('#pricing .pricing-featured .pricing-value span');
  if (priceSpan) priceSpan.textContent = `up to ${formatMoney(USD_RATE)}/min`;

  const priceRows = [...document.querySelectorAll('#pricing .pricing-featured .pricing-lines > div')];
  setPriceText(priceRows[1]?.querySelector('strong'), ' / minute');
  setPriceText(priceRows[2]?.querySelector('strong'), ' / song');

  const note = document.createElement('p');
  note.className = 'currency-note';
  note.textContent = `Approximate local display for ${localeInfo.country}. The agreed commission price is still based on the USD pricing rules shown on this page.`;
  pricingLayout.after(note);
}

function parseMinutes(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return null;
  const colon = text.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (colon) return Number(colon[1]) + Number(colon[2]) / 60;
  const decimal = text.match(/(\d+(?:\.\d+)?)/);
  return decimal ? Number(decimal[1]) : null;
}

function injectBuilderExtras() {
  const builder = document.getElementById('commissionBuilder');
  const preview = document.querySelector('.request-preview');
  const top = preview?.querySelector('.preview-topline');
  if (!builder || !preview || !top || document.querySelector('.builder-health')) return;

  const health = document.createElement('div');
  health.className = 'builder-health';
  health.innerHTML = `
    <div class="builder-health-copy"><small>Request readiness</small><strong id="requestReadinessLabel">Getting started</strong></div>
    <span class="builder-health-score" id="requestReadinessScore">0 / 5</span>
    <div class="builder-health-track"><div class="builder-health-fill" id="requestReadinessFill"></div></div>`;

  const estimate = document.createElement('div');
  estimate.className = 'estimate-card';
  estimate.innerHTML = `
    <div class="estimate-top"><div class="estimate-copy"><small>Instant chart estimate</small><strong id="chartEstimate">Add a song length</strong></div><span class="estimate-badge">Rough estimate</span></div>
    <p id="chartEstimateNote">For charting only. Final price is confirmed after I review the request.</p>`;

  top.insertAdjacentElement('afterend', health);
  health.insertAdjacentElement('afterend', estimate);

  const fields = ['project', 'engine', 'length', 'difficulty', 'details'];
  const readinessLabel = document.getElementById('requestReadinessLabel');
  const readinessScore = document.getElementById('requestReadinessScore');
  const readinessFill = document.getElementById('requestReadinessFill');
  const chartEstimate = document.getElementById('chartEstimate');
  const chartEstimateNote = document.getElementById('chartEstimateNote');

  function updateExtras() {
    const data = new FormData(builder);
    const complete = fields.filter(name => String(data.get(name) || '').trim()).length;
    const percent = Math.round((complete / fields.length) * 100);
    readinessScore.textContent = `${complete} / ${fields.length}`;
    readinessFill.style.width = `${percent}%`;
    readinessLabel.textContent = complete === fields.length ? 'Ready to send' : complete >= 3 ? 'Almost ready' : complete >= 1 ? 'Keep adding details' : 'Getting started';

    const service = String(data.get('service') || 'Charting');
    if (service !== 'Charting') {
      chartEstimate.textContent = service.includes('Modchart') ? 'Training inquiry' : 'Custom quote';
      chartEstimateNote.textContent = service.includes('Modchart') ? 'Modcharting is still in Codename Engine training.' : 'Coding prices depend on scope, logic, compatibility, and testing.';
      return;
    }

    const minutes = parseMinutes(data.get('length'));
    if (!minutes || minutes <= 0) {
      chartEstimate.textContent = 'Add a song length';
      chartEstimateNote.textContent = 'Use a format like 3:24 or 3.5 minutes.';
      return;
    }

    if (minutes <= 3) {
      chartEstimate.textContent = 'Free';
      chartEstimateNote.textContent = 'Charts from 1 to 3 minutes are currently listed as free.';
      return;
    }

    const usdEstimate = minutes * USD_RATE;
    const local = formatMoney(usdEstimate);
    chartEstimate.textContent = localeInfo.currency === 'USD' ? local : `${local} · about $${usdEstimate.toFixed(2)} USD`;
    chartEstimateNote.textContent = 'Duration-only estimate using the current $4 USD per minute rule. Final price is confirmed manually.';
  }

  builder.addEventListener('input', updateExtras);
  builder.addEventListener('change', updateExtras);
  window.addEventListener('commission-currency-ready', updateExtras);
  updateExtras();
}

async function init() {
  ensureStyles();
  injectTrafficPanel();
  injectBuilderExtras();
  localeInfo = await detectLocale();
  injectCurrencyUI();
  window.dispatchEvent(new CustomEvent('commission-currency-ready'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
