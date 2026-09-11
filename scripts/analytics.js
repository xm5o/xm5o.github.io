import { getAnalyticsDb, ANALYTICS_DOCS } from './analytics-config.js';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getAnalyticsDb();
const SUMMARY_REF = doc(db, ANALYTICS_DOCS.summary.collection, ANALYTICS_DOCS.summary.document);

const STORAGE_KEYS = Object.freeze({
  seen: 'xm5o_analytics_seen_v2',
  daily: 'xm5o_analytics_daily_v2',
  optOut: 'xm5o_analytics_opt_out',
  geo: 'xm5o_analytics_geo_v2'
});

const UNKNOWN_LOCATION = Object.freeze({
  country: 'Unknown',
  countryCode: 'XX',
  region: 'Unknown',
  city: 'Unknown'
});

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage may be disabled */ }
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* storage may be disabled */ }
}

function isTrackingDisabled() {
  const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const gpc = navigator.globalPrivacyControl === true;
  return safeStorageGet(STORAGE_KEYS.optOut) === '1' || dnt || gpc;
}

function dateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/ipad|tablet|playbook|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'Tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

function getBrowser() {
  const ua = navigator.userAgent || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/CriOS\//.test(ua)) return 'Chrome iOS';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/FxiOS\//.test(ua)) return 'Firefox iOS';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'Safari';
  return 'Other';
}

function getOperatingSystem() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS / iPadOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows NT/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Other';
}

function getReferrer() {
  if (!document.referrer) return { label: 'Direct', domain: 'Direct' };

  try {
    const url = new URL(document.referrer);
    if (url.hostname === location.hostname) return { label: 'Internal', domain: location.hostname };

    const host = url.hostname.replace(/^www\./, '');
    const lower = host.toLowerCase();
    let label = host;

    if (lower.includes('google.')) label = 'Google';
    else if (lower.includes('discord.')) label = 'Discord';
    else if (lower.includes('instagram.')) label = 'Instagram';
    else if (lower.includes('github.')) label = 'GitHub';
    else if (lower.includes('tiktok.')) label = 'TikTok';
    else if (lower.includes('youtube.')) label = 'YouTube';
    else if (lower.includes('x.com') || lower.includes('twitter.')) label = 'X / Twitter';

    return { label, domain: host };
  } catch {
    return { label: 'Other', domain: 'Unknown' };
  }
}

async function getCoarseLocation() {
  const cached = safeSessionGet(STORAGE_KEYS.geo);
  if (cached) {
    try { return { ...UNKNOWN_LOCATION, ...JSON.parse(cached) }; } catch { /* ignore invalid cache */ }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://ipwho.is/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) return { ...UNKNOWN_LOCATION };
    const data = await response.json();
    if (data?.success === false) return { ...UNKNOWN_LOCATION };

    const coarseLocation = {
      country: data.country || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown'
    };
    safeSessionSet(STORAGE_KEYS.geo, JSON.stringify(coarseLocation));
    return coarseLocation;
  } catch {
    return { ...UNKNOWN_LOCATION };
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureLegacySummaryExists() {
  const snapshot = await getDoc(SUMMARY_REF);
  if (snapshot.exists()) return;

  await setDoc(SUMMARY_REF, {
    totalViews: 0,
    createdAt: new Date().toISOString(),
    daily: {},
    lastUpdate: new Date().toISOString(),
    analyticsV2: {
      schemaVersion: 2,
      uniqueVisitors: 0,
      daily: {},
      dimensions: {}
    }
  }, { merge: true });
}

async function trackPageView() {
  if (isTrackingDisabled()) return;
  if (!/^https?:$/.test(location.protocol)) return;

  await ensureLegacySummaryExists();

  const today = dateKey();
  const isNewVisitor = safeStorageGet(STORAGE_KEYS.seen) !== '1';
  const isNewDailyVisitor = safeStorageGet(STORAGE_KEYS.daily) !== today;
  const locationData = await getCoarseLocation();
  const referrer = getReferrer();
  const device = getDeviceType();
  const browser = getBrowser();
  const operatingSystem = getOperatingSystem();
  const page = location.pathname || '/';
  const visitorIncrement = isNewVisitor ? 1 : 0;
  const dailyVisitorIncrement = isNewDailyVisitor ? 1 : 0;
  const cityLabel = `${locationData.city}, ${locationData.region}, ${locationData.country}`;

  const updates = {
    totalViews: increment(1),
    lastUpdate: new Date().toISOString(),
    'analyticsV2.schemaVersion': 2,
    'analyticsV2.uniqueVisitors': increment(visitorIncrement),
    'analyticsV2.lastUpdated': serverTimestamp(),
    [`analyticsV2.daily.${today}.date`]: today,
    [`analyticsV2.daily.${today}.views`]: increment(1),
    [`analyticsV2.daily.${today}.visitors`]: increment(dailyVisitorIncrement),
    [`analyticsV2.daily.${today}.lastUpdated`]: serverTimestamp()
  };

  const addMetric = (group, label, extra = {}) => {
    const id = dimensionId(label);
    const prefix = `analyticsV2.dimensions.${group}.${id}`;
    updates[`${prefix}.label`] = label;
    updates[`${prefix}.views`] = increment(1);
    updates[`${prefix}.visitors`] = increment(visitorIncrement);
    updates[`${prefix}.lastUpdated`] = serverTimestamp();
    Object.entries(extra).forEach(([key, value]) => {
      updates[`${prefix}.${key}`] = value;
    });
  };

  addMetric('countries', locationData.countryCode, {
    name: locationData.country,
    code: locationData.countryCode
  });
  addMetric('cities', cityLabel, {
    city: locationData.city,
    region: locationData.region,
    country: locationData.country
  });
  addMetric('referrers', referrer.label, { domain: referrer.domain });
  addMetric('devices', device);
  addMetric('browsers', browser);
  addMetric('operatingSystems', operatingSystem);
  addMetric('pages', page, { path: page });

  await updateDoc(SUMMARY_REF, updates);

  safeStorageSet(STORAGE_KEYS.seen, '1');
  safeStorageSet(STORAGE_KEYS.daily, today);
}

function bindPublicCounter() {
  const counter = document.getElementById('visitorCount');
  const todayCounter = document.getElementById('todayVisits');

  if (!counter && !todayCounter) return;

  onSnapshot(SUMMARY_REF, snapshot => {
    if (!snapshot.exists()) {
      if (counter) counter.textContent = '0';
      if (todayCounter) todayCounter.textContent = '0';
      return;
    }

    const data = snapshot.data();
    const totalViews = Number(data?.totalViews || 0);
    const todayViews = Number(data?.analyticsV2?.daily?.[dateKey()]?.views || 0);

    if (counter) {
      counter.textContent = totalViews.toLocaleString();
      counter.dataset.value = String(totalViews);
    }
    if (todayCounter) todayCounter.textContent = todayViews.toLocaleString();
  }, error => {
    console.warn('[Analytics] Counter unavailable:', error?.message || error);
    if (counter) counter.textContent = '—';
    if (todayCounter) todayCounter.textContent = '—';
  });
}

async function initAnalytics() {
  bindPublicCounter();
  try {
    await trackPageView();
  } catch (error) {
    console.warn('[Analytics] Tracking unavailable:', error?.message || error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics, { once: true });
} else {
  initAnalytics();
}
