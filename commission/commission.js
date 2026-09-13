(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const workCards = [...document.querySelectorAll('.work-card')];
  const filterLinks = [...document.querySelectorAll('[data-filter-link]')];
  const faqItems = [...document.querySelectorAll('.faq-item')];
  const modal = document.getElementById('mediaModal');
  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('mediaTitle');
  const modalClosers = [...document.querySelectorAll('[data-close-modal]')];
  const heroPreview = document.querySelector('[data-hero-preview]');
  const heroVideo = heroPreview?.querySelector('video');
  const copyButton = document.getElementById('copyDiscord');
  const copyStatus = document.getElementById('copyStatus');
  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  const siteHeader = document.querySelector('.site-header');
  const builder = document.getElementById('commissionBuilder');
  const requestPreview = document.getElementById('requestPreview');
  const copyRequest = document.getElementById('copyRequest');
  const builderStatus = document.getElementById('builderStatus');
  let lastFocusedElement = null;

  function setFilter(filter) {
    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    workCards.forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => setFilter(button.dataset.filter || 'all'));
  });

  filterLinks.forEach(link => {
    link.addEventListener('click', () => {
      const filter = link.dataset.filterLink;
      if (filter) setFilter(filter);
    });
  });

  function stopPreviewVideos() {
    workCards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    });
  }

  if (!reduceMotion) {
    workCards.forEach(card => {
      const video = card.querySelector('video');
      if (!video) return;

      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    });

    if (heroVideo) {
      const heroObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.25 });

      heroObserver.observe(heroVideo);
    }
  }

  function closeModal() {
    if (!modal || !modalMedia) return;
    const activeVideo = modalMedia.querySelector('video');
    if (activeVideo) activeVideo.pause();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalMedia.replaceChildren();

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  function openMedia(src, type, title) {
    if (!modal || !modalMedia || !modalTitle || !src) return;

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = title || 'Project preview';
    modalMedia.replaceChildren();

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = !reduceMotion;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', title || 'Project preview');
      modalMedia.append(video);

      if (!reduceMotion) {
        video.play().catch(() => {});
      }
    } else {
      const image = document.createElement('img');
      image.src = src;
      image.alt = title || 'Project preview';
      modalMedia.append(image);
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-topbar button')?.focus();
  }

  workCards.forEach(card => {
    card.addEventListener('click', () => {
      stopPreviewVideos();
      openMedia(card.dataset.src, card.dataset.media, card.dataset.title);
    });
  });

  heroPreview?.addEventListener('click', () => {
    heroVideo?.pause();
    openMedia('assets/Astral Calamity.mp4', 'video', 'Astral Calamity');
  });

  modalClosers.forEach(button => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) {
      closeModal();
      return;
    }

    if (event.key === 'Escape' && siteNav?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  faqItems.forEach(item => {
    const button = item.querySelector('button');
    if (!button) return;

    button.addEventListener('click', () => {
      const opening = !item.classList.contains('open');

      faqItems.forEach(other => {
        other.classList.remove('open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      if (opening) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  function closeMobileMenu() {
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');

    const icon = menuToggle?.querySelector('i');
    icon?.classList.remove('bx-x');
    icon?.classList.add('bx-menu');
  }

  menuToggle?.addEventListener('click', () => {
    const open = !siteNav?.classList.contains('open');
    siteNav?.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));

    const icon = menuToggle.querySelector('i');
    icon?.classList.toggle('bx-menu', !open);
    icon?.classList.toggle('bx-x', open);
  });

  siteNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', event => {
    if (!siteNav?.classList.contains('open')) return;
    if (siteHeader?.contains(event.target)) return;
    closeMobileMenu();
  });

  function updateHeaderState() {
    siteHeader?.classList.toggle('scrolled', window.scrollY > 22);
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {}
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }

  copyButton?.addEventListener('click', async () => {
    const username = copyButton.dataset.username || 'trr0';
    const copied = await copyText(username);

    if (copyStatus) {
      copyStatus.textContent = copied
        ? `Copied @${username} to your clipboard.`
        : `Discord: @${username}`;
    }
  });

  function valueOrFallback(formData, key, fallback = 'Not provided') {
    const value = String(formData.get(key) || '').trim();
    return value || fallback;
  }

  function buildRequest() {
    if (!builder || !requestPreview) return '';

    const data = new FormData(builder);
    const service = valueOrFallback(data, 'service', 'Charting');
    const project = valueOrFallback(data, 'project');
    const engine = valueOrFallback(data, 'engine');
    const length = valueOrFallback(data, 'length');
    const difficulty = valueOrFallback(data, 'difficulty');
    const deadline = valueOrFallback(data, 'deadline', 'Flexible / not provided');
    const details = valueOrFallback(data, 'details', 'No extra details yet');

    const request = [
      "Hey, I'd like to ask about an FNF commission.",
      '',
      `Service: ${service}`,
      `Song / project: ${project}`,
      `Engine version: ${engine}`,
      `Song length: ${length}`,
      `Difficulty / style: ${difficulty}`,
      `Deadline: ${deadline}`,
      '',
      'Extra details:',
      details
    ].join('\n');

    requestPreview.textContent = request;
    return request;
  }

  builder?.addEventListener('input', () => {
    buildRequest();
    if (builderStatus) builderStatus.textContent = 'Nothing is sent automatically.';
  });

  builder?.addEventListener('change', () => {
    buildRequest();
    if (builderStatus) builderStatus.textContent = 'Nothing is sent automatically.';
  });

  copyRequest?.addEventListener('click', async () => {
    const request = buildRequest();
    const copied = await copyText(request);

    if (builderStatus) {
      builderStatus.textContent = copied
        ? 'Request copied. Paste it into your Discord message.'
        : 'Copy failed. Select the generated request and copy it manually.';
    }
  });

  buildRequest();
})();