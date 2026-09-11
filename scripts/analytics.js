import { getAnalyticsDb, ANALYTICS_COLLECTIONS } from './analytics-config.js';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getAnalyticsDb();
const SUMMARY_REF = doc(db, ANALYTICS_COLLECTIONS.summary, 'summary');
const LEGACY_SUMMARY_REF = doc(db, 'visitor_stats', 'main');

const STORAGE_KEYS = Object.freeze({
  seen: 'xm5o_analytics_seen_v2',
  daily: 'xm5o_analytics_daily_v2',
  optOut: 'xm5o_analytics_opt_out'
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

    // Intentionally ignore data.ip, coordinates, postal code, ISP/ASN and hostname.
    return {
      country: data.country || 'Unknown',
      countryCode: data.country_code || data.country || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown'
    };
  } catch {
    return { ...UNKNOWN_LOCATION };
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureSummaryExists() {
  const current = await getDoc(SUMMARY_REF);
  if (current.exists()) return;

  let legacyCount = 0;
  try {
    const legacy = await getDoc(LEGACY_SUMMARY_REF);
    if (legacy.exists()) {
      const value = Number(legacy.data()?.totalViews);
      legacyCount = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }
  } catch {
    // The new analytics system can start clean if legacy data is not readable.
  }

  await setDoc(SUMMARY_REF, {
    schemaVersion: 2,
    totalViews: legacyCount,
    uniqueVisitors: legacyCount,
    legacyCount,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

function queueDimension(batch, collection, label, extra = {}, visitorIncrement = 0) {
  const ref = doc(db, collection, dimensionId(label));
  batch.set(ref, {
    label,
    ...extra,
    views: increment(1),
    visitors: increment(visitorIncrement),
    lastUpdated: serverTimestamp()
  }, { merge: true });
}

async function trackPageView() {
  if (isTrackingDisabled()) return;
  if (!/^https?:$/.test(location.protocol)) return;

  await ensureSummaryExists();

  const today = dateKey();
  const isNewVisitor = safeStorageGet(STORAGE_KEYS.seen) !== '1';
  const isNewDailyVisitor = safeStorageGet(STORAGE_KEYS.daily) !== today;

  const [locationData] = await Promise.all([getCoarseLocation()]);
  const referrer = getReferrer();
  const device = getDeviceType();
  const browser = getBrowser();
  const operatingSystem = getOperatingSystem();
  const page = location.pathname || '/';
  const visitorIncrement = isNewVisitor ? 1 : 0;

  const batch = writeBatch(db);

  batch.set(SUMMARY_REF, {
    schemaVersion: 2,
    totalViews: increment(1),
    uniqueVisitors: increment(visitorIncrement),
    lastUpdated: serverTimestamp()
  }, { merge: true });

  const dailyRef = doc(db, ANALYTICS_COLLECTIONS.daily, today);
  batch.set(dailyRef, {
    date: today,
    views: increment(1),
    visitors: increment(isNewDailyVisitor ? 1 : 0),
    lastUpdated: serverTimestamp()
  }, { merge: true });

  queueDimension(
    batch,
    ANALYTICS_COLLECTIONS.countries,
    locationData.countryCode,
    { name: locationData.country, code: locationData.countryCode },
    visitorIncrement
  );

  const cityLabel = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
  queueDimension(
    batch,
    ANALYTICS_COLLECTIONS.cities,
    cityLabel,
    { city: locationData.city, region: locationData.region, country: locationData.country },
    visitorIncrement
  );

  queueDimension(batch, ANALYTICS_COLLECTIONS.referrers, referrer.label, { domain: referrer.domain }, visitorIncrement);
  queueDimension(batch, ANALYTICS_COLLECTIONS.devices, device, {}, visitorIncrement);
  queueDimension(batch, ANALYTICS_COLLECTIONS.browsers, browser, {}, visitorIncrement);
  queueDimension(batch, ANALYTICS_COLLECTIONS.operatingSystems, operatingSystem, {}, visitorIncrement);
  queueDimension(batch, ANALYTICS_COLLECTIONS.pages, page, { path: page }, visitorIncrement);

  await batch.commit();

  safeStorageSet(STORAGE_KEYS.seen, '1');
  safeStorageSet(STORAGE_KEYS.daily, today);
}

function bindPublicCounter() {
  const counter = document.getElementById('visitorCount');
  const todayCounter = document.getElementById('todayVisits');

  if (counter) {
    onSnapshot(SUMMARY_REF, snapshot => {
      const value = snapshot.exists() ? Number(snapshot.data()?.totalViews || 0) : 0;
      counter.textContent = value.toLocaleString();
      counter.dataset.value = String(value);
    }, () => {
      counter.textContent = '—';
    });
  }

  if (todayCounter) {
    const todayRef = doc(db, ANALYTICS_COLLECTIONS.daily, dateKey());
    onSnapshot(todayRef, snapshot => {
      const value = snapshot.exists() ? Number(snapshot.data()?.views || 0) : 0;
      todayCounter.textContent = value.toLocaleString();
    }, () => {
      todayCounter.textContent = '—';
    });
  }
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
