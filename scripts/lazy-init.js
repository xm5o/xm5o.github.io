(() => {
  const currentScript = document.currentScript;
  const scriptBase = new URL('.', currentScript?.src || new URL('scripts/', location.href));
  const loadedScripts = new Map();
  const loadedStyles = new Map();

  const loadScript = (name) => {
    if (loadedScripts.has(name)) return loadedScripts.get(name);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(name, scriptBase).href;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${name}`));
      document.head.appendChild(script);
    });

    loadedScripts.set(name, promise);
    return promise;
  };

  const loadStyle = (href) => {
    if (loadedStyles.has(href)) return loadedStyles.get(href);
    const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
    if (existing) return Promise.resolve();

    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load ${href}`));
      document.head.appendChild(link);
    });

    loadedStyles.set(href, promise);
    return promise;
  };

  const loaders = {
    projects: () => loadScript('projects.js'),
    discord: () => loadScript('discord-activity.js'),
    contact: () => loadStyle('css/contact.css')
  };

  const targets = [
    { selector: '#projects', load: loaders.projects, margin: '900px' },
    { selector: '#discord-activity', load: loaders.discord, margin: '900px' },
    { selector: '#contact', load: loaders.contact, margin: '1100px' }
  ];

  targets.forEach(({ selector, load, margin }) => {
    const element = document.querySelector(selector);
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      load().catch(console.warn);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      load().catch(error => console.warn('[Lazy load]', error));
    }, { rootMargin: `${margin} 0px` });

    observer.observe(element);
  });

  // Preload a section's resources immediately when the visitor intentionally
  // navigates to it, avoiding a flash of unstyled or empty content.
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = anchor.getAttribute('href');
    if (target === '#projects') loaders.projects().catch(console.warn);
    if (target === '#discord-activity') loaders.discord().catch(console.warn);
    if (target === '#contact') loaders.contact().catch(console.warn);
  }, { capture: true });

  // Firebase/Firestore is useful but not part of first paint. Start analytics
  // when the browser is idle, with a timeout so visits are still recorded.
  const startAnalytics = () => import(new URL('analytics.js', scriptBase).href)
    .catch(error => console.warn('[Analytics] Lazy import failed:', error));

  if ('requestIdleCallback' in window) {
    requestIdleCallback(startAnalytics, { timeout: 1800 });
  } else {
    setTimeout(startAnalytics, 700);
  }

  // Pause CSS animation work while the tab is not visible.
  const syncVisibility = () => {
    document.documentElement.classList.toggle('page-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  // Use a lighter effects profile on touch-first/mobile devices and devices
  // that explicitly request data saving. The design remains the same, but
  // expensive blur/filter animations become static or simpler.
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const coarsePointer = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const smallViewport = matchMedia('(max-width: 768px)').matches;
  if (connection?.saveData || (coarsePointer && smallViewport)) {
    document.documentElement.classList.add('perf-lite');
  }
})();
