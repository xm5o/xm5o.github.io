document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const navLinks = [...document.querySelectorAll('.navbar > a[href^="#"]')];
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const setCurrentSection = id => {
    navLinks.forEach(link => {
      const isCurrent = link.getAttribute('href') === `#${id}`;
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setCurrentSection(visible.target.id);
    }, {
      rootMargin: '-24% 0px -58% 0px',
      threshold: [0.08, 0.2, 0.45]
    });

    sections.forEach(section => sectionObserver.observe(section));
  }

  document.querySelectorAll('.faq-question').forEach((question, index) => {
    const answer = question.nextElementSibling;
    const answerId = `faq-answer-${index + 1}`;

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);
    if (answer) answer.id = answerId;

    const syncState = () => {
      question.setAttribute(
        'aria-expanded',
        question.closest('.faq-item')?.classList.contains('active') ? 'true' : 'false'
      );
    };

    question.addEventListener('click', () => requestAnimationFrame(syncState));
    question.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      question.click();
    });
  });

  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const syncFilters = activeButton => {
    filterButtons.forEach(button => {
      button.setAttribute('aria-pressed', button === activeButton ? 'true' : 'false');
    });
  };

  filterButtons.forEach(button => {
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => syncFilters(button));
  });
  syncFilters(document.querySelector('.filter-btn.active'));

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel', [...rel].join(' '));
  });
});
