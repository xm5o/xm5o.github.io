(() => {
  const steps = Array.from(document.querySelectorAll('.selina-story-step'));
  const shots = Array.from(document.querySelectorAll('.selina-shot-frame'));
  const progress = document.querySelector('.selina-story-progress > span');

  if (!steps.length || !shots.length) return;

  const setActive = (index) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    shots.forEach((shot, i) => shot.classList.toggle('is-active', i === index));
    if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (!visible.length) return;

    visible.sort((a, b) => {
      const target = window.innerHeight * 0.46;
      return Math.abs(a.boundingClientRect.top - target) - Math.abs(b.boundingClientRect.top - target);
    });

    const index = steps.indexOf(visible[0].target);
    if (index >= 0) setActive(index);
  }, {
    rootMargin: '-32% 0px -46% 0px',
    threshold: [0, 0.2, 0.55]
  });

  steps.forEach((step) => observer.observe(step));
  setActive(0);
})();