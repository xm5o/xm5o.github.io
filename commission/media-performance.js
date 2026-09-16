const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const mobileLayout = window.matchMedia('(max-width: 800px)').matches || coarsePointer;

const STEM_CASE = Object.freeze({
  'astral calamity': 'Astral Calamity',
  'anti-dote': 'Anti-Dote',
  bloodline: 'Bloodline',
  ignition: 'Ignition',
  reactor: 'reactor',
  rejected: 'rejected'
});

const availabilityCache = new Map();

function cleanPath(value) {
  return String(value || '').trim().replace(/^\.\//, '');
}

function sourceParts(value) {
  const clean = cleanPath(value);
  const slash = clean.lastIndexOf('/');
  const filename = slash >= 0 ? clean.slice(slash + 1) : clean;
  const decoded = decodeURIComponent(filename);
  const rawStem = decoded.replace(/\.[^.]+$/, '');
  const stem = STEM_CASE[rawStem.toLowerCase()] || rawStem;
  return {
    original: `assets/${stem}${/anti-dote/i.test(stem) ? '.mov' : '.mp4'}`,
    full: `assets/optimized/${stem}.mp4`,
    preview: `assets/optimized/${stem}-preview.mp4`,
    poster: `assets/optimized/posters/${stem}.jpg`
  };
}

async function exists(url) {
  if (!url) return false;
  if (!availabilityCache.has(url)) {
    availabilityCache.set(url, fetch(url, { method: 'HEAD', cache: 'force-cache' })
      .then(response => response.ok)
      .catch(() => false));
  }
  return availabilityCache.get(url);
}

function stopAndDetach(video) {
  if (!video) return;
  try { video.pause(); } catch {}
  video.removeAttribute('src');
  video.preload = 'none';
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  try { video.load(); } catch {}
}

async function resolveMedia(original) {
  const parts = sourceParts(original);
  const optimized = await exists(parts.full);
  return optimized ? parts : { ...parts, full: parts.original, preview: parts.original, poster: '' };
}

function ensurePreview(video) {
  if (!video || video.src || !video.dataset.previewSrc) return;
  video.preload = 'metadata';
  video.src = video.dataset.previewSrc;
  try { video.load(); } catch {}
}

function tuneModalVideo(video) {
  if (!video) return;
  video.controls = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'metadata';

  if (mobileLayout) {
    video.autoplay = false;
    video.removeAttribute('autoplay');
    try { video.pause(); } catch {}
  }
}

function installPerformanceStyles() {
  if (document.getElementById('commissionMediaPerformanceStyles')) return;
  const style = document.createElement('style');
  style.id = 'commissionMediaPerformanceStyles';
  style.textContent = `
    .work-card video,.hero-work video{background:#0b0b0c}
    .modal-media video{width:100%;height:auto;background:#000}
    @media (max-width:800px),(pointer:coarse){
      .work-card video{filter:none!important;transform:none!important}
      .hero-work video{filter:none!important;transform:none!important}
      .modal-card{width:calc(100% - 16px);max-height:90dvh;border-radius:16px}
      .modal-media{max-height:calc(90dvh - 60px)}
      .modal-media video,.modal-media img{max-height:calc(90dvh - 60px)}
    }
  `;
  document.head.append(style);
}

function setupWorkCards() {
  document.querySelectorAll('.work-card[data-media="video"]').forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    const declared = card.dataset.src || video.getAttribute('src') || '';
    const canonical = sourceParts(declared).original;
    card.dataset.src = canonical;
    stopAndDetach(video);

    resolveMedia(declared).then(media => {
      card.dataset.src = media.full;
      video.dataset.previewSrc = media.preview;
      if (media.poster) video.poster = media.poster;
    });

    if (!mobileLayout && !reduceMotion) {
      card.addEventListener('mouseenter', async () => {
        if (!video.dataset.previewSrc) {
          const media = await resolveMedia(declared);
          card.dataset.src = media.full;
          video.dataset.previewSrc = media.preview;
          if (media.poster) video.poster = media.poster;
        }
        ensurePreview(video);
        video.play().catch(() => {});
      }, { capture: true });

      card.addEventListener('mouseleave', () => {
        video.pause();
        try { video.currentTime = 0; } catch {}
      });
    }

    card.addEventListener('click', () => {
      queueMicrotask(() => tuneModalVideo(document.querySelector('#modalMedia video')));
    });
  });
}

function openHeroModal(src, poster) {
  const modal = document.getElementById('mediaModal');
  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('mediaTitle');
  if (!modal || !modalMedia || !modalTitle) return;

  modalTitle.textContent = 'Reactor';
  modalMedia.replaceChildren();

  const video = document.createElement('video');
  video.src = src;
  if (poster) video.poster = poster;
  video.setAttribute('aria-label', 'Reactor project preview');
  tuneModalVideo(video);
  modalMedia.append(video);

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-topbar button')?.focus();

  if (!mobileLayout && !reduceMotion) video.play().catch(() => {});
}

function setupHero() {
  const originalButton = document.querySelector('[data-hero-preview]');
  if (!originalButton) return;

  // commission.js attached the old featured-video behavior before this module loads.
  // Replacing only this button cleanly removes that old handler without disturbing filters/cards.
  const button = originalButton.cloneNode(true);
  originalButton.replaceWith(button);
  const video = button.querySelector('video');
  if (!video) return;

  const declared = video.getAttribute('src') || 'assets/reactor.mp4';
  stopAndDetach(video);

  let resolved = sourceParts(declared);
  resolveMedia(declared).then(media => {
    resolved = media;
    video.dataset.previewSrc = media.preview;
    if (media.poster) video.poster = media.poster;

    // The featured clip is the only preview that may autoplay, and it uses the tiny preview encode.
    ensurePreview(video);
    if (!reduceMotion) video.play().catch(() => {});
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!reduceMotion) {
          ensurePreview(video);
          video.play().catch(() => {});
        }
      });
    }, { threshold: 0.2 });
    observer.observe(video);
  }

  button.addEventListener('click', async () => {
    const media = await resolveMedia(declared);
    openHeroModal(media.full, media.poster);
  });
}

function setupModalSafety() {
  const modal = document.getElementById('mediaModal');
  if (!modal) return;

  const observer = new MutationObserver(() => {
    tuneModalVideo(document.querySelector('#modalMedia video'));
  });
  observer.observe(document.getElementById('modalMedia'), { childList: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    document.querySelectorAll('video').forEach(video => {
      if (!video.closest('.hero-work')) video.pause();
    });
  });
}

function init() {
  installPerformanceStyles();
  setupWorkCards();
  setupHero();
  setupModalSafety();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
