document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterProjects('all');

  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      filterProjects(this.getAttribute('data-filter'));
    });
  });

  function filterProjects(category) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    projectCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');

      if (!prefersReducedMotion) {
        card.style.animation = 'none';
        card.offsetHeight;
      }

      if (category === 'all' || cardCategory === category) {
        card.style.display = 'flex';
        if (!prefersReducedMotion) card.style.animation = 'fadeInUp 0.6s ease forwards';
        else card.style.opacity = 1;
      } else {
        card.style.display = 'none';
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  projectCards.forEach(card => observer.observe(card));

  function isTouchDevice() {
    return ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0);
  }

  if (isTouchDevice()) {
    document.documentElement.classList.add('touch-device');
    projectCards.forEach(card => {
      card.addEventListener('touchstart', function () {
        projectCards.forEach(c => c.classList.remove('touch-active'));
        this.classList.add('touch-active');
      });
    });
  }

  function adjustLayout() {
    const actions = document.querySelectorAll('.project-actions');
    actions.forEach(action => {
      action.style.flexDirection = window.innerWidth <= 576 ? 'column' : 'row';
    });
  }

  adjustLayout();
  window.addEventListener('resize', adjustLayout);
});