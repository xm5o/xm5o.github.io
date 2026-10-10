document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const tabContents = Array.from(document.querySelectorAll('.tab-content'));
  const aboutSection = document.getElementById('about');

  if (!tabButtons.length || !tabContents.length) return;

  const animateSkillBars = () => {
    const profileTab = document.getElementById('profile-tab');
    if (!profileTab?.classList.contains('active')) return;

    document.querySelectorAll('.skill-progress').forEach(bar => {
      const progress = Number(bar.getAttribute('data-progress')) || 0;
      bar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    });
  };

  const activateTab = tabName => {
    tabButtons.forEach(button => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    tabContents.forEach(content => {
      const isActive = content.id === `${tabName}-tab`;
      content.classList.toggle('active', isActive);
      content.hidden = !isActive;
    });

    if (tabName === 'profile') requestAnimationFrame(animateSkillBars);
  };

  tabButtons.forEach((button, index) => {
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => activateTab(button.dataset.tab));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;

      const nextButton = tabButtons[nextIndex];
      activateTab(nextButton.dataset.tab);
      nextButton.focus();
    });
  });

  const initialTab = tabButtons.find(button => button.classList.contains('active'))?.dataset.tab
    || tabButtons[0].dataset.tab;
  activateTab(initialTab);

  if ('IntersectionObserver' in window && aboutSection) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) animateSkillBars();
    }, { threshold: 0.1 });
    observer.observe(aboutSection);
  } else {
    animateSkillBars();
  }
});
