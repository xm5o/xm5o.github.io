const SETTINGS_URL = '/data/site-settings.json';

function assetUrl(path, stamp) {
  return `${path}?v=${encodeURIComponent(stamp || Date.now())}`;
}

function applyFavicon(settings) {
  if (!settings.faviconEnabled) return;
  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.append(icon);
  }
  icon.type = 'image/jpeg';
  icon.href = assetUrl('/assets/site-favicon.jpg', settings.updatedAt);
}

function applyHomepage(settings) {
  const home = document.querySelector('.home');
  if (!home) return;

  const bio = document.querySelector('.tagline.enhanced-tagline');
  if (bio && settings.bio) bio.textContent = settings.bio;

  const status = document.querySelector('.status-card .label');
  if (status && settings.statusText) status.textContent = settings.statusText;

  const commissionLabel = document.querySelector('.commission-cta .btn-text');
  if (commissionLabel) commissionLabel.textContent = settings.commissionOpen ? 'Commission' : 'Commissions Closed';

  if (settings.backgroundEnabled) {
    home.style.backgroundImage = `linear-gradient(rgba(5,5,5,.62), rgba(5,5,5,.82)), url("${assetUrl('/assets/site-background.jpg', settings.updatedAt)}")`;
    home.style.backgroundSize = 'cover';
    home.style.backgroundPosition = 'center';
    home.style.backgroundAttachment = 'scroll';
  } else {
    home.style.removeProperty('background-image');
    home.style.removeProperty('background-size');
    home.style.removeProperty('background-position');
  }

  let banner = home.querySelector(':scope > .managed-site-banner');
  if (settings.bannerEnabled) {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'managed-site-banner';
      banner.setAttribute('aria-hidden', 'true');
      home.prepend(banner);
    }
    Object.assign(banner.style, {
      position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '0', opacity: '.16',
      backgroundImage: `url("${assetUrl('/assets/site-banner.jpg', settings.updatedAt)}")`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      maskImage: 'linear-gradient(to bottom, black, transparent 72%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 72%)'
    });
  } else if (banner) {
    banner.remove();
  }
}

function applyCommission(settings) {
  const slots = document.querySelector('.commission-slots');
  if (!slots) return;

  const total = Math.max(1, Number(settings.commissionTotal) || 4);
  const configuredUsed = Math.max(0, Math.min(total, Number(settings.commissionUsed) || 0));
  const used = settings.commissionOpen ? configuredUsed : total;
  const available = Math.max(0, total - used);
  const strong = slots.querySelector('.slots-copy strong');
  const dots = slots.querySelector('.slots-dots');

  slots.classList.toggle('full', available === 0);
  if (strong) strong.textContent = settings.commissionOpen
    ? (available === 0 ? 'Full right now' : `Open · ${available}/${total} available`)
    : 'Commissions closed';

  if (dots) {
    dots.setAttribute('aria-label', `${used} of ${total} commission slots used`);
    dots.innerHTML = Array.from({ length: total }, (_, index) => `<span class="${index < used ? 'used' : 'open'}"></span>`).join('');
  }

  const creatorStatus = document.querySelector('.creator-status');
  if (creatorStatus) creatorStatus.title = settings.commissionOpen ? 'Available' : 'Commissions closed';
}

export async function loadManagedSiteSettings() {
  try {
    const response = await fetch(`${SETTINGS_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const settings = await response.json();
    applyFavicon(settings);
    applyHomepage(settings);
    applyCommission(settings);
    window.dispatchEvent(new CustomEvent('immortal:site-settings', { detail: settings }));
    return settings;
  } catch (error) {
    console.warn('[Site Settings] Could not load managed settings:', error?.message || error);
    return null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => loadManagedSiteSettings(), { once: true });
} else {
  loadManagedSiteSettings();
}
