import settings from './settings.js?v=20260914-1';

const PORTFOLIO_DETAILS = Object.freeze({
  'Astral Calamity': {
    service: 'Charting',
    engine: 'Not listed',
    level: 'Advanced',
    focus: 'Chart flow, note placement, timing, and difficulty.'
  },
  'Custom gameplay mechanic': {
    service: 'Custom coding',
    engine: 'Psych Engine',
    level: 'Gameplay mechanic',
    focus: 'Lua logic and a custom gameplay mechanic.'
  },
  'Lua scripting': {
    service: 'Custom coding',
    engine: 'Psych Engine',
    level: 'Lua scripting',
    focus: 'Lua scripting, events, and gameplay logic.'
  },
  'Tutorial chart': {
    service: 'Charting',
    engine: 'Not listed',
    level: 'Clean flow',
    focus: 'Timing, readability, and smooth chart flow.'
  },
  'Bloodline modchart practice': {
    service: 'Modchart practice',
    engine: 'Codename Engine',
    level: 'Learning',
    focus: 'Note movement, beat sync, camera timing, and visual effects.'
  },
  'Ignition modchart practice': {
    service: 'Modchart practice',
    engine: 'Codename Engine',
    level: 'Learning',
    focus: 'Note movement, beat sync, camera timing, and visual effects.'
  }
});

function ensureStyles() {
  if (document.querySelector('link[data-commission-features]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'features.css?v=20260914-1';
  link.dataset.commissionFeatures = 'true';
  document.head.append(link);
}

function injectSlots() {
  if (!settings.slots?.enabled || document.querySelector('.commission-slots')) return;
  const anchor = document.querySelector('.availability-strip');
  if (!anchor) return;

  const total = Math.max(1, Number(settings.slots.total) || 4);
  const used = Math.min(total, Math.max(0, Number(settings.slots.used) || 0));
  const available = Math.max(0, total - used);

  const box = document.createElement('div');
  box.className = `commission-slots${available === 0 ? ' full' : ''}`;
  box.innerHTML = `
    <div class="slots-copy">
      <small>Commission slots</small>
      <strong>${available === 0 ? 'Full right now' : `Open · ${available}/${total} available`}</strong>
    </div>
    <div class="slots-dots" aria-label="${used} of ${total} commission slots used">
      ${Array.from({ length: total }, (_, index) => `<span class="${index < used ? 'used' : 'open'}"></span>`).join('')}
    </div>`;

  anchor.insertAdjacentElement('afterend', box);
}

function renderPortfolioDetails(title) {
  const modalCard = document.querySelector('#mediaModal .modal-card');
  const modalMedia = document.getElementById('modalMedia');
  if (!modalCard || !modalMedia) return;

  modalCard.querySelector('.portfolio-details')?.remove();
  const details = PORTFOLIO_DETAILS[title];
  if (!details) return;

  const panel = document.createElement('div');
  panel.className = 'portfolio-details';
  panel.innerHTML = `
    <div class="portfolio-detail"><small>Service</small><strong>${details.service}</strong></div>
    <div class="portfolio-detail"><small>Engine</small><strong>${details.engine}</strong></div>
    <div class="portfolio-detail"><small>Type / level</small><strong>${details.level}</strong></div>
    <div class="portfolio-detail portfolio-focus"><small>What I worked on</small><p>${details.focus}</p></div>`;
  modalMedia.insertAdjacentElement('afterend', panel);
}

function setupPortfolioDetails() {
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => {
      queueMicrotask(() => renderPortfolioDetails(card.dataset.title || ''));
    });
  });

  document.querySelector('[data-hero-preview]')?.addEventListener('click', () => {
    queueMicrotask(() => renderPortfolioDetails('Astral Calamity'));
  });
}

function getSubmissionEndpoint() {
  let override = '';
  try {
    override = String(localStorage.getItem('immortal-commission-api-url') || '').trim();
  } catch {}
  return (override || settings.submission?.endpoint || '').trim().replace(/\/+$/, '');
}

function collectRequest(builder) {
  const data = new FormData(builder);
  const get = (key, fallback = '') => String(data.get(key) || fallback).trim();
  return {
    service: get('service', 'Charting'),
    project: get('project'),
    engine: get('engine'),
    length: get('length'),
    difficulty: get('difficulty'),
    deadline: get('deadline', 'Flexible / not provided'),
    details: get('details', 'No extra details yet'),
    estimate: String(builder.dataset.chartEstimate || '').trim(),
    currency: String(builder.dataset.chartCurrency || '').trim(),
    honeypot: get('_contact'),
    page: location.href.split('#')[0]
  };
}

function ensureHoneypot(builder) {
  if (builder.elements.namedItem('_contact')) return;
  const wrap = document.createElement('label');
  wrap.className = 'commission-honeypot';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<span>Leave this empty</span><input type="text" name="_contact" tabindex="-1" autocomplete="off">';
  builder.append(wrap);
}

function validateSubmission(payload, builder, status) {
  const required = [
    ['project', 'Add the song or project name first.'],
    ['engine', 'Add the engine and version first.'],
    ['length', 'Add the song length first.'],
    ['difficulty', 'Add the difficulty or style first.']
  ];

  for (const [name, message] of required) {
    if (payload[name]) continue;
    if (status) status.textContent = message;
    builder.elements.namedItem(name)?.focus?.();
    return false;
  }
  return true;
}

async function submitCommission(endpoint, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${endpoint}/api/commission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

function setupDirectSubmission() {
  if (!settings.submission?.enabled) return;
  const endpoint = getSubmissionEndpoint();
  const builder = document.getElementById('commissionBuilder');
  const button = document.getElementById('sendDiscordRequest');
  const status = document.getElementById('builderStatus');
  if (!builder || !button) return;

  ensureHoneypot(builder);

  if (!endpoint || !/^https:\/\//i.test(endpoint)) {
    button.dataset.submitMode = 'discord-fallback';
    return;
  }

  button.dataset.submitMode = 'direct';
  button.innerHTML = '<i class="bx bx-send"></i> Submit request';

  button.addEventListener('click', async event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const payload = collectRequest(builder);
    if (!validateSubmission(payload, builder, status)) return;

    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';
    if (status) status.textContent = 'Sending your request to Discord...';

    try {
      const result = await submitCommission(endpoint, payload);
      button.innerHTML = '<i class="bx bx-check"></i> Sent';
      if (status) status.textContent = result.id
        ? `Request sent successfully. Reference: ${result.id}`
        : 'Request sent successfully.';
      try { localStorage.removeItem('immortal-commission-draft-v2'); } catch {}
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = original;
      }, 3500);
    } catch (error) {
      button.disabled = false;
      button.innerHTML = original;
      if (status) status.textContent = `Could not send the request. Use Copy only or Discord instead. (${error.message || 'network error'})`;
    }
  }, true);
}

function init() {
  ensureStyles();
  injectSlots();
  setupPortfolioDetails();
  setupDirectSubmission();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
