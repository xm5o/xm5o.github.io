// XM5O D1 event stream. Independent of the legacy Firestore visitor counter.
// Sends only event type, pathname, random per-event ID and UTC timestamp.
const ENDPOINT = 'https://xm5o-analytics.eminem13981398.workers.dev/v1/events';
const ALLOWED_TYPES = new Set(['page_view', 'project_open', 'outbound_click']);

function trackingDisabled() {
  try {
    if (localStorage.getItem('xm5o_analytics_opt_out') === '1') return true;
  } catch { /* storage unavailable */ }
  return navigator.doNotTrack === '1'
    || window.doNotTrack === '1'
    || navigator.globalPrivacyControl === true;
}

function sendEvent(type) {
  if (!ALLOWED_TYPES.has(type) || trackingDisabled()) return;
  if (location.origin !== 'https://xm5o.github.io') return;
  const path = location.pathname || '/';
  if (path.length > 160 || !/^\/(?!\/)[a-zA-Z0-9/_\-.]*$/.test(path) || path.includes('..')) return;
  if (typeof crypto.randomUUID !== 'function') return;
  const body = JSON.stringify({
    type, path, eventId: crypto.randomUUID(), occurredAt: new Date().toISOString()
  });
  // Fail silently: analytics must never block navigation or the original counter.
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {});
  } catch { /* best effort only */ }
}

sendEvent('page_view');

document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  let target;
  try { target = new URL(link.href, location.href); } catch { return; }
  if (!['http:', 'https:'].includes(target.protocol)) return;
  if (link.closest('#projects, .projects, [data-project-id]')) {
    sendEvent('project_open');
  } else if (target.origin !== location.origin) {
    sendEvent('outbound_click');
  }
}, { capture: true, passive: true });
