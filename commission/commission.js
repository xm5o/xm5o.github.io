(() => {
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const workCards = [...document.querySelectorAll('.work-card')];
  const filterLinks = [...document.querySelectorAll('[data-filter-link]')];
  const faqItems = [...document.querySelectorAll('.faq-item')];
  const modal = document.getElementById('mediaModal');
  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('mediaTitle');
  const modalClosers = [...document.querySelectorAll('[data-close-modal]')];
  const copyButton = document.getElementById('copyDiscord');
  const copyStatus = document.getElementById('copyStatus');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  }

  function closeModal() {
    if (!modal || !modalMedia) return;
    const activeVideo = modalMedia.querySelector('video');
    if (activeVideo) activeVideo.pause();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalMedia.replaceChildren();
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function openModal(card) {
    if (!modal || !modalMedia || !modalTitle) return;
    const src = card.dataset.src;
    const type = card.dataset.media;
    const title = card.dataset.title || 'Project preview';
    if (!src) return;

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = title;
    modalMedia.replaceChildren();

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = !reduceMotion;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', title);
      modalMedia.append(video);
      if (!reduceMotion) video.play().catch(() => {});
    } else {
      const image = document.createElement('img');
      image.src = src;
      image.alt = title;
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
      openModal(card);
    });
  });

  modalClosers.forEach(button => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal?.classList.contains('open')) closeModal();
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

  copyButton?.addEventListener('click', async () => {
    const username = copyButton.dataset.username || 'trr0';
    try {
      await navigator.clipboard.writeText(username);
      copyStatus.textContent = `Copied @${username} to your clipboard.`;
    } catch {
      copyStatus.textContent = `Discord: @${username}`;
    }
  });
})();
