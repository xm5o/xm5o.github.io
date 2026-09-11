function initSkillEffects() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('.skill-card').forEach(card => {
    let frame = null;
    let clientX = 0;
    let clientY = 0;

    card.addEventListener('pointermove', event => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--x', `${x}%`);
        card.style.setProperty('--y', `${y}%`);
        frame = null;
      });
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
    }, { passive: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkillEffects, { once: true });
} else {
  initSkillEffects();
}
