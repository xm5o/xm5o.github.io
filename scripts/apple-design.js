/* Navigation follows document order; native details elements handle FAQ interaction. */
document.addEventListener('DOMContentLoaded', () => {
  const links = [...document.querySelectorAll('.navbar a')];
  const targets = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let queued = false;
  function updateCurrent() {
    queued = false;
    const marker = window.innerHeight * 0.3;
    let current = targets[0];
    // Read document order, not navbar order: Work comes before About.
    [...targets].sort((a, b) => a.offsetTop - b.offsetTop).forEach(section => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24) {
      current = document.getElementById('contact');
    }
    links.forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateCurrent); }
  }, { passive: true });
  window.addEventListener('resize', updateCurrent);
  updateCurrent();
  const filters = [...document.querySelectorAll('.filter-btn')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  const grid = document.querySelector('.projects-grid');
  const secureLinks = () => grid?.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.rel = 'noopener noreferrer';
  });
  if (grid) new MutationObserver(secureLinks).observe(grid, { childList: true, subtree: true });
  secureLinks();
  const indicator = document.getElementById('statusIndicator');
  if (indicator) {
    const label = document.createElement('p');
    label.className = 'presence-label';
    indicator.setAttribute('aria-hidden', 'true');
    document.querySelector('.profile-info').appendChild(label);
    const syncPresence = () => {
      const states = { 'status-online': 'Online', 'status-idle': 'Idle', 'status-dnd': 'Do not disturb', 'status-offline': 'Offline' };
      label.textContent = Object.entries(states).find(([name]) => indicator.classList.contains(name))?.[1] || 'Connecting to Discord';
    };
    new MutationObserver(syncPresence).observe(indicator, { attributes: true, attributeFilter: ['class'] });
    syncPresence();
  }
});
