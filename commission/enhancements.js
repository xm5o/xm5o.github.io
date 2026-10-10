import { getAnalyticsDb, ANALYTICS_DOCS } from '../scripts/analytics-config.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const USD_RATE = 4;
const FREE_CHART_SECONDS = 3 * 60;
const GEO_CACHE_KEY = 'immortal-commission-geo-v2';
const CURRENCY_OVERRIDE_KEY = 'immortal-commission-currency-v1';
const RATES_CACHE_KEY = 'immortal-commission-usd-rates-v1';
const RATES_CACHE_TTL = 12 * 60 * 60 * 1000;

const COMMON_CURRENCIES = [
  'USD', 'SAR', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
  'CAD', 'AUD', 'NZD', 'JPY', 'CNY', 'KRW', 'INR', 'TRY', 'EGP', 'CHF',
  'SEK', 'NOK', 'DKK', 'PLN', 'BRL', 'MXN', 'SGD', 'MYR', 'IDR', 'PHP', 'THB'
];

const REGION_CURRENCY = Object.freeze({
  US: 'USD', SA: 'SAR', GB: 'GBP', AE: 'AED', KW: 'KWD', QA: 'QAR', BH: 'BHD', OM: 'OMR', JO: 'JOD',
  CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', TR: 'TRY', EG: 'EGP', CH: 'CHF',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', BR: 'BRL', MX: 'MXN', SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', TH: 'THB',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', IE: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
  LU: 'EUR', CY: 'EUR', MT: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR'
});

const FALLBACK_RATES = Object.freeze({
  USD: 1,
  SAR: 3.75,
  AED: 3.6725,
  QAR: 3.64,
  BHD: 0.376,
  OMR: 0.3845,
  JOD: 0.709
});

let localeInfo = {
  country: 'International',
  countryCode: 'XX',
  flag: '🌐',
  currency: 'USD',
  autoCurrency: 'USD',
  rate: 1,
  manualCurrency: false,
  rateFallback: false
};

function ensureStyles() {
  if (document.querySelector('link[data-commission-enhancements]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'enhancements.css?v=20260914-2';
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

      const siteEl = document.getElementById('commissionSiteVisitors');
      const pageEl = document.getElementById('commissionPageViews');
      const todayEl = document.getElementById('commissionTodayVisitors');
      if (siteEl) siteEl.textContent = siteVisitors.toLocaleString();
      if (pageEl) pageEl.textContent = pageViews.toLocaleString();
      if (todayEl) todayEl.textContent = todayVisitors.toLocaleString();
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

function safeLocalGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeLocalSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function safeLocalDelete(key) {
  try { localStorage.removeItem(key); } catch {}
}

function flagFromCountryCode(code) {
  if (!/^[A-Z]{2}$/.test(code || '')) return '🌐';
  return String.fromCodePoint(...[...code].map(letter => 127397 + letter.charCodeAt(0)));
}

function getBrowserRegion() {
  const locale = navigator.languages?.[0] || navigator.language || '';
  try {
    if (typeof Intl.Locale === 'function') {
      return new Intl.Locale(locale).maximize().region || 'XX';
    }
  } catch {}
  const match = locale.match(/[-_]([A-Za-z]{2})\b/);
  return match ? match[1].toUpperCase() : 'XX';
}

function getCountryName(code) {
  if (!code || code === 'XX') return 'International';
  try {
    return new Intl.DisplayNames([navigator.language || 'en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

async function fetchJson(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getUsdRates() {
  const cached = safeLocalGet(RATES_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.rates && Date.now() - Number(parsed.timestamp || 0) < RATES_CACHE_TTL) {
        return parsed.rates;
      }
    } catch {}
  }

  const sources = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
    'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json'
  ];

  for (const source of sources) {
    try {
      const data = await fetchJson(source, 4500);
      const rates = data?.usd;
      if (rates && typeof rates === 'object' && Number(rates.eur) > 0) {
        safeLocalSet(RATES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), rates }));
        return rates;
      }
    } catch {}
  }

  return null;
}

async function fetchUsdRate(currency) {
  const code = String(currency || 'USD').toUpperCase();
  if (code === 'USD') return { rate: 1, fallback: false };

  const rates = await getUsdRates();
  const liveRate = Number(rates?.[code.toLowerCase()]);
  if (Number.isFinite(liveRate) && liveRate > 0) {
    return { rate: liveRate, fallback: false };
  }

  const fallbackRate = Number(FALLBACK_RATES[code]);
  if (Number.isFinite(fallbackRate) && fallbackRate > 0) {
    return { rate: fallbackRate, fallback: true };
  }

  return null;
}

async function detectGeo() {
  const cached = safeSessionGet(GEO_CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }

  const browserRegion = getBrowserRegion();
  const browserFallback = {
    country: getCountryName(browserRegion),
    countryCode: browserRegion,
    flag: flagFromCountryCode(browserRegion),
    currency: REGION_CURRENCY[browserRegion] || 'USD'
  };

  try {
    const data = await fetchJson('https://ipwho.is/', 3500);
    if (data?.success === false) return browserFallback;

    const result = {
      country: data?.country || browserFallback.country,
      countryCode: data?.country_code || browserFallback.countryCode,
      flag: data?.flag?.emoji || flagFromCountryCode(data?.country_code) || browserFallback.flag,
      currency: String(data?.currency?.code || REGION_CURRENCY[data?.country_code] || browserFallback.currency || 'USD').toUpperCase()
    };
    safeSessionSet(GEO_CACHE_KEY, JSON.stringify(result));
    return result;
  } catch {
    return browserFallback;
  }
}

async function detectLocale() {
  const geo = await detectGeo();
  const override = String(safeLocalGet(CURRENCY_OVERRIDE_KEY) || '').toUpperCase();
  const autoCurrency = String(geo.currency || 'USD').toUpperCase();
  let currency = /^[A-Z]{3}$/.test(override) ? override : autoCurrency;
  let rateResult = await fetchUsdRate(currency);

  if (!rateResult) {
    currency = 'USD';
    rateResult = { rate: 1, fallback: true };
  }

  return {
    country: geo.country || 'International',
    countryCode: geo.countryCode || 'XX',
    flag: geo.flag || '🌐',
    currency,
    autoCurrency,
    rate: rateResult.rate,
    manualCurrency: Boolean(override),
    rateFallback: rateResult.fallback
  };
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
    return `${info.currency} ${converted.toFixed(converted >= 100 ? 0 : 2)}`;
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

function getCurrencyOptions() {
  const currencies = new Set(COMMON_CURRENCIES);
  currencies.add(localeInfo.autoCurrency);
  currencies.add(localeInfo.currency);
  return [...currencies].filter(code => /^[A-Z]{3}$/.test(code));
}

function renderCurrencyPrices() {
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

  const countryLabel = document.getElementById('currencyCountryLabel');
  if (countryLabel) countryLabel.textContent = `${localeInfo.country} · ${localeInfo.currency}`;

  const rateLabel = document.getElementById('currencyRateLabel');
  if (rateLabel) {
    if (localeInfo.rateFallback) {
      rateLabel.textContent = 'Using a safe fallback rate. USD is still the base price.';
    } else if (localeInfo.currency === 'USD') {
      rateLabel.textContent = 'Showing the USD base price.';
    } else {
      rateLabel.textContent = `1 USD ≈ ${formatMoney(1)}. Local prices are estimates.`;
    }
  }

  const note = document.querySelector('.currency-note');
  if (note) {
    note.textContent = `Only the time after the first 3:00 is charged. ${localeInfo.manualCurrency ? `Display currency set to ${localeInfo.currency}.` : `Currency detected for ${localeInfo.country}.`} The final quote still uses USD as the base price.`;
  }
}

async function changeCurrency(currency) {
  const selected = String(currency || '').toUpperCase();
  const targetCurrency = selected || localeInfo.autoCurrency || 'USD';
  const rateResult = await fetchUsdRate(targetCurrency);

  if (!rateResult) {
    const rateLabel = document.getElementById('currencyRateLabel');
    if (rateLabel) rateLabel.textContent = `Could not load ${targetCurrency}. Keeping ${localeInfo.currency}.`;
    return;
  }

  if (selected) safeLocalSet(CURRENCY_OVERRIDE_KEY, selected);
  else safeLocalDelete(CURRENCY_OVERRIDE_KEY);

  localeInfo.currency = targetCurrency;
  localeInfo.rate = rateResult.rate;
  localeInfo.rateFallback = rateResult.fallback;
  localeInfo.manualCurrency = Boolean(selected);
  renderCurrencyPrices();
  window.dispatchEvent(new CustomEvent('commission-currency-ready'));
}

function injectCurrencyUI() {
  const pricingLayout = document.querySelector('#pricing .pricing-layout');
  if (!pricingLayout || document.querySelector('.currency-localizer')) return;

  const bar = document.createElement('div');
  bar.className = 'currency-localizer';
  bar.innerHTML = `
    <div class="currency-location">
      <span class="currency-flag">${localeInfo.flag}</span>
      <div><small>Your currency</small><strong id="currencyCountryLabel">${localeInfo.country} · ${localeInfo.currency}</strong></div>
    </div>
    <div class="currency-controls">
      <select id="currencySelect" aria-label="Display currency"></select>
      <small class="currency-rate" id="currencyRateLabel">Loading exchange rate…</small>
    </div>`;
  pricingLayout.before(bar);

  const select = document.getElementById('currencySelect');
  if (select) {
    const autoOption = document.createElement('option');
    autoOption.value = '';
    autoOption.textContent = `Auto (${localeInfo.autoCurrency})`;
    select.append(autoOption);

    getCurrencyOptions().forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code;
      select.append(option);
    });

    select.value = localeInfo.manualCurrency ? localeInfo.currency : '';
    select.addEventListener('change', async () => {
      select.disabled = true;
      await changeCurrency(select.value);
      select.disabled = false;
      select.value = localeInfo.manualCurrency ? localeInfo.currency : '';
    });
  }

  const note = document.createElement('p');
  note.className = 'currency-note';
  pricingLayout.after(note);
  renderCurrencyPrices();
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

function publishEstimate(builder, estimateText = '') {
  if (!builder) return;
  builder.dataset.chartEstimate = estimateText;
  window.dispatchEvent(new CustomEvent('commission-estimate-updated', { detail: { estimate: estimateText } }));
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
      publishEstimate(builder, '');
      return;
    }

    const totalSeconds = parseSongLengthSeconds(data.get('length'));
    if (!totalSeconds) {
      chartEstimate.textContent = 'Add a song length';
      chartEstimateNote.textContent = 'Use a format like 3:24 or 3.5 minutes.';
      publishEstimate(builder, '');
      return;
    }

    const usdEstimate = getChartPriceUsd(totalSeconds);
    if (usdEstimate === 0) {
      chartEstimate.textContent = 'Free';
      chartEstimateNote.textContent = 'The first 3:00 of the song is free.';
      publishEstimate(builder, 'Free');
      return;
    }

    const extraMinutes = Math.ceil((totalSeconds - FREE_CHART_SECONDS) / 60);
    const local = formatMoney(usdEstimate);
    const displayEstimate = localeInfo.currency === 'USD'
      ? `$${usdEstimate.toFixed(2)} USD`
      : `${local} (about $${usdEstimate.toFixed(2)} USD)`;

    chartEstimate.textContent = localeInfo.currency === 'USD'
      ? `$${usdEstimate.toFixed(2)}`
      : `${local} · about $${usdEstimate.toFixed(2)} USD`;
    chartEstimateNote.textContent = `${extraMinutes} started extra ${extraMinutes === 1 ? 'minute' : 'minutes'} after 3:00 × $4. Final price is confirmed before work starts.`;
    publishEstimate(builder, displayEstimate);
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
