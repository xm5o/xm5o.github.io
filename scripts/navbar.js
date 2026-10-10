(() => {
  'use strict';

  const menuIcon = document.getElementById('menu-icon');
  const closeButton = document.getElementById('close-menu');
  const navbar = document.querySelector('.navbar');
  const backdrop = document.getElementById('menuBackdrop');
  if (!menuIcon || !closeButton || !navbar || !backdrop) return;

  let previousFocus = null;

  const focusable = () => [...navbar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.hidden && el.getClientRects().length);

  function openMenu() {
    previousFocus = document.activeElement;
    navbar.classList.add('active');
    backdrop.classList.add('active');
    menuIcon.classList.add('active');
    closeButton.classList.add('active');
    document.documentElement.classList.add('mobile-menu-open');
    document.body.style.overflow = 'hidden';
    menuIcon.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      const current = navbar.querySelector('a[aria-current="page"]');
      (current || navbar.querySelector('a[href]') || closeButton).focus({ preventScroll: true });
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    navbar.classList.remove('active');
    backdrop.classList.remove('active');
    menuIcon.classList.remove('active');
    closeButton.classList.remove('active');
    document.documentElement.classList.remove('mobile-menu-open');
    document.body.style.overflow = '';
    menuIcon.setAttribute('aria-expanded', 'false');

    if (restoreFocus && previousFocus instanceof HTMLElement) {
      previousFocus.focus({ preventScroll: true });
    }
  }

  menuIcon.addEventListener('click', event => {
    event.preventDefault();
    openMenu();
  });

  closeButton.addEventListener('click', event => {
    event.preventDefault();
    closeMenu();
  });

  backdrop.addEventListener('click', () => closeMenu());

  navbar.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) setTimeout(() => closeMenu({ restoreFocus: false }), 60);
    });
  });

  document.addEventListener('keydown', event => {
    if (!navbar.classList.contains('active')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navbar.classList.contains('active')) {
      closeMenu({ restoreFocus: false });
    }
  }, { passive: true });

  const sectionLinks = [...navbar.querySelectorAll('a[href^="#"]')]
    .filter(link => link.getAttribute('href').length > 1 && link.id !== 'commandPaletteTrigger');
  const sections = sectionLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const ratios = new Map();
    const updateCurrent = () => {
      let current = null;
      let best = 0;
      sections.forEach(section => {
        const ratio = ratios.get(section.id) || 0;
        if (ratio > best) {
          best = ratio;
          current = section.id;
        }
      });

      if (!current) return;
      sectionLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + current;
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => ratios.set(entry.target.id, entry.intersectionRatio));
      updateCurrent();
    }, {
      rootMargin: '-18% 0px -58% 0px',
      threshold: [0, .1, .25, .5, .75]
    });

    sections.forEach(section => observer.observe(section));
  }
})();