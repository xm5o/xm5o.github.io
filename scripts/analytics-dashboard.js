import { getAnalyticsDb, ANALYTICS_COLLECTIONS } from './analytics-config.js';
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getAnalyticsDb();

const formatNumber = value => Number(value || 0).toLocaleString();

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchTop(collectionName, count = 10) {
  const q = query(collection(db, collectionName), orderBy('views', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

async function fetchDaily(count = 30) {
  const q = query(collection(db, ANALYTICS_COLLECTIONS.daily), orderBy(documentId(), 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() })).reverse();
}

function renderRankedList(id, rows, labelSelector = row => row.label || row.name || row.id) {
  const container = document.getElementById(id);
  if (!container) return;

  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty">No data yet.</div>';
    return;
  }

  const max = Math.max(...rows.map(row => Number(row.views || 0)), 1);
  container.innerHTML = rows.map((row, index) => {
    const label = labelSelector(row);
    const percent = Math.max(4, Math.round((Number(row.views || 0) / max) * 100));
    return `
      <div class="analytics-row">
        <span class="analytics-rank">${index + 1}</span>
        <div class="analytics-row-main">
          <div class="analytics-row-copy">
            <strong>${escapeHtml(label)}</strong>
            <span>${formatNumber(row.views)} views${row.visitors !== undefined ? ` · ${formatNumber(row.visitors)} visitors` : ''}</span>
          </div>
          <div class="analytics-bar"><span style="width:${percent}%"></span></div>
        </div>
      </div>`;
  }).join('');
}

function renderDailyChart(rows) {
  const canvas = document.getElementById('viewsChart');
  if (!canvas) return;

  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(220, Math.floor(rect.height));
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const styles = getComputedStyle(document.documentElement);
  const lineColor = styles.getPropertyValue('--analytics-accent').trim() || '#d4a574';
  const gridColor = 'rgba(255,255,255,.08)';
  const textColor = 'rgba(255,255,255,.58)';
  const padding = { top: 18, right: 16, bottom: 34, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!rows.length) {
    ctx.fillStyle = textColor;
    ctx.font = '14px system-ui';
    ctx.fillText('No daily analytics yet.', padding.left, height / 2);
    return;
  }

  const maxValue = Math.max(...rows.map(row => Number(row.views || 0)), 1);

  ctx.font = '12px system-ui';
  ctx.fillStyle = textColor;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartHeight / 4) * i;
    const value = Math.round(maxValue - (maxValue / 4) * i);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(value), 6, y + 4);
  }

  const points = rows.map((row, index) => {
    const x = padding.left + (rows.length === 1 ? chartWidth / 2 : (chartWidth / (rows.length - 1)) * index);
    const y = padding.top + chartHeight - (Number(row.views || 0) / maxValue) * chartHeight;
    return { x, y, row };
  });

  const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  gradient.addColorStop(0, 'rgba(212,165,116,.28)');
  gradient.addColorStop(1, 'rgba(212,165,116,0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, height - padding.bottom);
  points.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
  });

  const labelIndexes = new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1]);
  ctx.fillStyle = textColor;
  labelIndexes.forEach(index => {
    const row = rows[index];
    if (!row) return;
    const point = points[index];
    const label = String(row.date || row.id).slice(5);
    const measured = ctx.measureText(label).width;
    const x = Math.min(Math.max(point.x - measured / 2, padding.left), width - padding.right - measured);
    ctx.fillText(label, x, height - 10);
  });
}

function getDateTotals(rows) {
  return rows.reduce((acc, row) => {
    acc.views += Number(row.views || 0);
    acc.visitors += Number(row.visitors || 0);
    return acc;
  }, { views: 0, visitors: 0 });
}

async function loadDashboard() {
  const status = document.getElementById('dashboardStatus');

  try {
    const [summarySnap, daily, countries, cities, referrers, devices, browsers, operatingSystems, pages] = await Promise.all([
      getDoc(doc(db, ANALYTICS_COLLECTIONS.summary, 'summary')),
      fetchDaily(30),
      fetchTop(ANALYTICS_COLLECTIONS.countries, 10),
      fetchTop(ANALYTICS_COLLECTIONS.cities, 10),
      fetchTop(ANALYTICS_COLLECTIONS.referrers, 10),
      fetchTop(ANALYTICS_COLLECTIONS.devices, 5),
      fetchTop(ANALYTICS_COLLECTIONS.browsers, 8),
      fetchTop(ANALYTICS_COLLECTIONS.operatingSystems, 8),
      fetchTop(ANALYTICS_COLLECTIONS.pages, 10)
    ]);

    const summary = summarySnap.exists() ? summarySnap.data() : {};
    const today = daily[daily.length - 1] || {};
    const last7 = daily.slice(-7);
    const week = getDateTotals(last7);

    setText('totalViews', formatNumber(summary.totalViews));
    setText('uniqueVisitors', formatNumber(summary.uniqueVisitors));
    setText('todayViews', formatNumber(today.views));
    setText('weekViews', formatNumber(week.views));
    setText('todayVisitors', `${formatNumber(today.visitors)} visitors today`);
    setText('weekVisitors', `${formatNumber(week.visitors)} daily uniques in 7 days`);

    renderDailyChart(daily);
    renderRankedList('countryList', countries, row => row.name || row.label || row.code);
    renderRankedList('cityList', cities, row => [row.city, row.region, row.country].filter(Boolean).join(', '));
    renderRankedList('referrerList', referrers, row => row.label || row.domain);
    renderRankedList('pageList', pages, row => row.path || row.label);
    renderRankedList('deviceList', devices);
    renderRankedList('browserList', browsers);
    renderRankedList('osList', operatingSystems);

    if (status) {
      status.textContent = 'Aggregate analytics only · no raw IP addresses or device fingerprints stored';
      status.classList.add('ready');
    }
  } catch (error) {
    console.error('[Analytics dashboard]', error);
    if (status) status.textContent = 'Analytics data could not be loaded. Check Firestore rules and console errors.';
  }
}

window.addEventListener('resize', () => {
  clearTimeout(window.__analyticsChartResize);
  window.__analyticsChartResize = setTimeout(loadDashboard, 180);
});

loadDashboard();
