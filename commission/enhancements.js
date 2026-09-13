import { getAnalyticsDb, ANALYTICS_DOCS } from '../scripts/analytics-config.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const USD_RATE = 4;
const FREE_CHART_SECONDS = 3 * 60;
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
  const slug = text
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44) || 'unknown';
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
  panel.setAttribute('aria-label', 'Commission page views');
  panel.innerHTML = `
    <div class="traffic-intro"><i class="bx bx-show"></i><div><small>Views</small><strong>Commission page</strong></div></div>
    <div class="traffic-stat"><small>Site visitors</small><strong id="commissionSiteVisitors">—</strong></div>
    <div class="traffic-stat"><small>This page</small><strong id="commissionPageViews">—</strong></div>
    <div class="traffic-stat"><small>Today</small><strong id="commissionTodayVisitors">—</strong></div>`;
  anchor.insertAdjacentElement('afterend', panel);

  try {
    const db = getAnalyticsDb();
    const summaryRef = doc(db, ANALYTICS_DOCS.summary.collection, ANALYTICS_DOCS.summary.document);
    onSnapshot(summaryRef, snapshot => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const pages = data?.analyticsV2?.dimensions?.pages || {};
      const paths = [...new Set([location.pathname || '/commission/', '/commission/', '/commission/index.html'])];
      const pageViews = paths.reduce((total, path) => total + Number(pages?.[dimensionId(path)]?.views || 0), 0);
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
    console.warn('[Commission] View counters unavailable:', error?.message || error);
  }
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch {}
}

async function fetchUsdRate(currency) {
  if (!currency || currency === 'USD') return 1;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const data = await response.json();
    const rate = Number(data?.rates?.[currency]);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function detectLocale() {
  const cached = safeSessionGet(LOCALE_CACHE_KEY);
  if (cached) {
    try { return { ...localeInfo, ...JSON.parse(cached) }; } catch {}
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return localeInfo;

    const data = await response.json();
    if (data?.success === false) return localeInfo;

    const currency = data?.currency?.code || 'USD';
    let rate = Number(data?.currency?.exchange_rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      rate = await fetchUsdRate(currency) || 1;
    }

    const detected = {
      country: data?.country || 'International',
      countryCode: data?.country_code || 'XX',
      flag: data?.flag?.emoji || '🌐',
      currency,
      symbol: data?.currency?.symbol || currency,
      rate
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

  if (localeInfo.currency === 'USD') {
    element.textContent = `${local}${suffix}`;
  } else {
    element.innerHTML = `<span class="local-price">${local}${suffix}</span><span class="usd-base">$4 USD${suffix}</span>`;
  }
}

function applyPricingRulesText() {
  const pricingCard = document.querySelector('#pricing .pricing-featured');
  if (!pricingCard) return;

  const priceRows = [...pricingCard.querySelectorAll('.pricing-lines > div')];
  if (priceRows[0]) {
    const label = priceRows[0].querySelector('span');
    const price = priceRows[0].querySelector('strong');
    if (label) label.textContent = 'First 3:00 of the song';
    if (price) price.textContent = 'Free';
  }

  if (priceRows[1]) {
    const label = priceRows[1].querySelector('span');
    if (label) label.textContent = 'Each started minute after 3:00';
  }

  if (priceRows[2]) {
    const label = priceRows[2].querySelector('span');
    if (label) label.textContent = 'Extra song';
  }

  if (!pricingCard.querySelector('.pricing-examples')) {
    const examples = document.createElement('div');
    examples.className = 'pricing-examples';
    examples.setAttribute('aria-label', 'Chart pricing examples');
    examples.innerHTML = `
      <small>Examples</small>
      <div><span><b>3:00</b> Free</span><span><b>3:01</b> $4</span><span><b>4:00</b> $4</span><span><b>4:01</b> $8</span><span><b>5:20</b> $12</span></div>`;
    pricingCard.querySelector('.pricing-lines')?.insertAdjacentElement('afterend', examples);
  }
}

function injectCurrencyUI() {
  const pricingLayout = document.querySelector('#pricing .pricing-layout');
  if (!pricingLayout || document.querySelector('.currency-localizer')) return;

  const bar = document.createElement('div');
  bar.className = 'currency-localizer';
  bar.innerHTML = `
    <div class="currency-location"><span class="currency-flag">${localeInfo.flag}</span><div><small>Your currency</small><strong>${localeInfo.country} · ${localeInfo.currency}</strong></div></div>
    <div class="currency-rate">Prices are converted from USD.</div>`;
  pricingLayout.before(bar);

  const servicePrice = document.querySelector('#services .service-card.featured .service-footer strong');
  if (servicePrice) {
    const local = formatMoney(USD_RATE);
    servicePrice.innerHTML = localeInfo.currency === 'USD'
      ? `First 3 min free · then ${local}/extra min`
      : `First 3 min free · then <span class="local-price">${local}/extra min</span><span class="usd-base">$4 USD / started extra minute</span>`;
  }

  const priceSpan = document.querySelector('#pricing .pricing-featured .pricing-value span');
  if (priceSpan) {
    const local = formatMoney(USD_RATE);
    priceSpan.innerHTML = localeInfo.currency === 'USD'
      ? `then ${local} / started extra minute`
      : `then <span class="local-price">${local} / started extra minute</span><span class="usd-base">$4 USD / started extra minute</span>`;
  }

  const priceRows = [...document.querySelectorAll('#pricing .pricing-featured .pricing-lines > div')];
  setPriceText(priceRows[1]?.querySelector('strong'));
  setPriceText(priceRows[2]?.querySelector('strong'), ' / song');

  const note = document.createElement('p');
  note.className = 'currency-note';
  note.textContent = `Only the time after the first 3:00 is charged. Local prices are estimates for ${localeInfo.country}; the final quote still uses the USD base price.`;
  pricingLayout.after(note);
}

function parseSongLengthSeconds(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return null;

  const colon = text.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (colon) {
    return (Number(colon[1]) * 60) + Number(colon[2]);
  }

  const decimal = text.match(/(\d+(?:\.\d+)?)/);
  if (!decimal) return null;

  const minutes = Number(decimal[1]);
  return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : null;
}

function getChartPriceUsd(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return null;
  if (totalSeconds <= FREE_CHART_SECONDS) return 0;

  const extraSeconds = totalSeconds - FREE_CHART_SECONDS;
  const startedExtraMinutes = Math.ceil(extraSeconds / 60);
  return startedExtraMinutes * USD_RATE;
}

function injectBuilderExtras() {
  const builder = document.getElementById('commissionBuilder');
  const preview = document.querySelector('.request-preview');
  const top = preview?.querySelector('.preview-topline');
  if (!builder || !preview || !top || document.querySelector('.builder-health')) return;

  const health = document.createElement('div');
  health.className = 'builder-health';
  health.innerHTML = `
    <div class="builder-health-copy"><small>Request details</small><strong id="requestReadinessLabel">Add the main details</strong></div>
    <span class="builder-health-score" id="requestReadinessScore">0 / 5</span>
    <div class="builder-health-track"><div class="builder-health-fill" id="requestReadinessFill"></div></div>`;

  const estimate = document.createElement('div');
  estimate.className = 'estimate-card';
  estimate.innerHTML = `
    <div class="estimate-top"><div class="estimate-copy"><small>Chart price estimate</small><strong id="chartEstimate">Add a song length</strong></div><span class="estimate-badge">Estimate</span></div>
    <p id="chartEstimateNote">The first 3:00 is free. Each started extra minute adds $4.</p>`;

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
    readinessLabel.textContent = complete === fields.length
      ? 'Ready to send'
      : complete >= 3
        ? 'Almost ready'
        : complete >= 1
          ? 'Add a few more details'
          : 'Add the main details';

    const service = String(data.get('service') || 'Charting');
    if (service !== 'Charting') {
      chartEstimate.textContent = service.includes('Modchart') ? 'Practice inquiry' : 'Custom quote';
      chartEstimateNote.textContent = service.includes('Modchart')
        ? 'Modcharting is still in Codename Engine practice.'
        : 'Coding prices depend on the amount of work and testing needed.';
      return;
    }

    const totalSeconds = parseSongLengthSeconds(data.get('length'));
    if (!totalSeconds) {
      chartEstimate.textContent = 'Add a song length';
      chartEstimateNote.textContent = 'Use a format like 3:24 or 3.5 minutes.';
      return;
    }

    const usdEstimate = getChartPriceUsd(totalSeconds);
    if (usdEstimate === 0) {
      chartEstimate.textContent = 'Free';
      chartEstimateNote.textContent = 'The first 3:00 of the song is free.';
      return;
    }

    const extraMinutes = Math.ceil((totalSeconds - FREE_CHART_SECONDS) / 60);
    const local = formatMoney(usdEstimate);
    chartEstimate.textContent = localeInfo.currency === 'USD'
      ? local
      : `${local} · about $${usdEstimate.toFixed(2)} USD`;
    chartEstimateNote.textContent = `${extraMinutes} started extra ${extraMinutes === 1 ? 'minute' : 'minutes'} after 3:00 × $4. Final price is confirmed before work starts.`;
  }

  builder.addEventListener('input', updateExtras);
  builder.addEventListener('change', updateExtras);
  window.addEventListener('commission-currency-ready', updateExtras);
  updateExtras();
}

async function init() {
  ensureStyles();
  applyPricingRulesText();
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
