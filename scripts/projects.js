class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.countdownIntervals = new Map();
    this.init();
  }

  init() {
    this.loadProjects();
    this.setupEventListeners();
    this.renderProjects();
    this.startCountdowns();
  }

  loadProjects() {
    this.projects = [
      {
        id: 'immortality-collection',
        title: "FNF': Immortality Collection",
        description: "A Friday Night Funkin' mod I'm working on. Not out yet.",
        category: 'game',
        status: 'coming-soon',
        image: './assets/immortality_icon.webp',
        features: [{ icon: 'bx bx-question-mark', text: 'Coming Soon...' }],
        links: { website: null, demo: null, github: null },
        badge: 'Coming Soon',
        badgeType: 'coming-soon',
        releaseDate: null
      },
      {
        id: 'fnf-commission',
        title: 'FNF Commissions',
        description: "I make custom charts, modcharts, and code for Friday Night Funkin'. Some for free, some paid.",
        category: 'web',
        status: 'active',
        image: './assets/fnf_commission.png',
        features: ['Chart', 'Modchart', 'Code'],
        links: { website: 'commission/index.html', demo: null, github: null },
        badge: null,
        badgeType: null,
        releaseDate: null
      },
      {
        id: 'discord-quest',
        title: 'Discord Quest Finisher',
        description: 'A script that finishes Discord quests for you, without downloading any game.',
        category: 'script',
        status: 'active',
        image: './assets/quest.png',
        features: ['Open-source', 'JavaScript', 'Node.js'],
        links: { github: 'https://github.com/xm5o/discord-quest-finisher' },
        badge: 'Open-source',
        badgeType: 'success',
        releaseDate: null
      },
      {
        id: 'fnf-chart-creator',
        title: 'FNF Chart Creator',
        description: 'A tool that makes an empty chart file for you. No notes or events, just a clean start. Easy to use.',
        category: 'script',
        status: 'active',
        image: './assets/fnf_chart_creator.png',
        features: ['Open-source', 'FNF', 'Psych Engine'],
        links: { github: 'https://github.com/xm5o/FNF-Chart-Creator' },
        badge: 'Open-source',
        badgeType: 'success',
        releaseDate: null
      },
      {
        id: 'selina-discord-bot',
        title: 'Selina',
        description: 'A Discord bot for communities. Moderation, leveling, and AI chat. Public beta in development.',
        category: 'app',
        status: 'active',
        image: './assets/selina.jpg',
        features: [
          { icon: 'bx bx-shield-quarter', text: 'Moderation' },
          { icon: 'bx bx-joystick', text: 'Fun Commands' },
          { icon: 'bx bx-message-rounded-dots', text: 'AI Chat' }
        ],
        links: { website: 'selina/index.html', demo: null, github: null },
        badge: 'Public Beta',
        badgeType: 'beta',
        releaseDate: null
      }
    ];
  }

  setupEventListeners() {
    document.querySelectorAll('.filter-btn').forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        this.filterProjects(filter);
        this.updateActiveFilter(button);
      });
    });
  }

  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.category = project.category;
    card.dataset.projectId = project.id;
    card.style.animationDelay = `${index * 0.12}s`;

    const quickActions = this.generateQuickActions(project);
    const features = this.generateFeatures(project.features);
    const actionButton = this.generateActionButton(project);
    const badge = this.generateBadge(project);
    const comingSoonOverlay = this.generateComingSoonOverlay(project);

    card.innerHTML = `
      <div class="project-img-container">
        <img class="project-img" src="${project.image}" alt="${project.title}" loading="lazy" decoding="async" style="object-fit:cover;display:block;" />
        ${badge}
        ${project.status === 'coming-soon' ? comingSoonOverlay : `
          <div class="project-overlay">
            <div class="project-quick-actions">${quickActions}</div>
          </div>
        `}
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        ${features}
        <div class="project-actions">${actionButton}</div>
      </div>
    `;

    return card;
  }

  renderProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    const filteredProjects = this.currentFilter === 'all'
      ? this.projects
      : this.projects.filter(project => project.category === this.currentFilter);

    const fragment = document.createDocumentFragment();
    filteredProjects.forEach((project, index) => fragment.appendChild(this.createProjectCard(project, index)));
    grid.replaceChildren(fragment);
  }

  generateComingSoonOverlay(project) {
    if (project.status !== 'coming-soon') return '';

    return `
      <div class="coming-soon-overlay">
        <div class="coming-soon-content">
          <div class="coming-soon-icon">
            <i class="bx bx-time-five"></i>
            <div class="clock-glow"></div>
          </div>
          ${project.releaseDate ? `
            <div class="countdown-container">
              <h4>Launching In</h4>
              <div class="countdown" data-target="${project.releaseDate}" data-project="${project.id}">
                <div class="countdown-loading"><i class="bx bx-loader-alt bx-spin"></i><span>Loading...</span></div>
              </div>
            </div>
          ` : `
            <div class="coming-soon-text">
              <h4>Coming Soon</h4>
              <p>Something amazing is being crafted</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  generateQuickActions(project) {
    const actions = [];

    if (project.links.website) {
      actions.push(`<a href="${project.links.website}" class="quick-action-btn" target="_blank" rel="noopener noreferrer" aria-label="Visit Website"><i class="bx bx-globe"></i></a>`);
    }
    if (project.links.demo && project.links.demo !== project.links.website) {
      actions.push(`<a href="${project.links.demo}" class="quick-action-btn" target="_blank" rel="noopener noreferrer" aria-label="Play Demo"><i class="bx bx-joystick"></i></a>`);
    }
    if (project.links.github) {
      actions.push(`<a href="${project.links.github}" class="quick-action-btn" target="_blank" rel="noopener noreferrer" aria-label="View Code"><i class="bx bxl-github"></i></a>`);
    }

    return actions.join('');
  }

  generateFeatures(features) {
    if (!features?.length) return '';

    const featureItems = features.map(feature => {
      if (typeof feature === 'string') return `<div class="feature">${feature}</div>`;
      return `<div class="feature"><i class="${feature.icon}"></i><span>${feature.text}</span></div>`;
    }).join('');

    return `<div class="project-features">${featureItems}</div>`;
  }

  generateActionButton(project) {
    if (project.status !== 'active') {
      return `<a class="add-button disabled" aria-disabled="true"><i class="bx bx-hourglass"></i><span>Coming Soon</span></a>`;
    }

    let primaryLink = null;
    let buttonText = '';
    let icon = '';

    if (project.links.website) {
      primaryLink = project.links.website;
      buttonText = 'Visit Website';
      icon = 'bx bx-link-external';
    } else if (project.links.github) {
      primaryLink = project.links.github;
      buttonText = 'View Source';
      icon = 'bx bxl-github';
    } else if (project.links.demo) {
      primaryLink = project.links.demo;
      buttonText = 'Play Now';
      icon = 'bx bx-joystick';
    }

    if (!primaryLink) return '';
    return `<a href="${primaryLink}" class="add-button primary" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i><span>${buttonText}</span></a>`;
  }

  generateBadge(project) {
    if (!project.badge) return '';

    let badgeClass = 'status-badge';
    if (project.badgeType === 'success') badgeClass += ' badge-success';
    else if (project.badgeType === 'demo') badgeClass += ' demo';
    else if (project.badgeType === 'beta') badgeClass += ' beta';
    else if (project.badgeType === 'coming-soon') badgeClass += ' coming-soon';

    return `<div class="${badgeClass}">${project.badge}</div>`;
  }

  filterProjects(filter) {
    this.currentFilter = filter;
    this.renderProjects();
    this.startCountdowns();
  }

  updateActiveFilter(activeButton) {
    document.querySelectorAll('.filter-btn').forEach(button => button.classList.remove('active'));
    activeButton.classList.add('active');
  }

  startCountdowns() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();

    document.querySelectorAll('.countdown').forEach(element => {
      const targetDate = element.dataset.target;
      const projectId = element.dataset.project;
      if (!targetDate || !projectId) return;

      const parsedDate = new Date(targetDate);
      if (Number.isNaN(parsedDate.getTime())) return;

      this.updateCountdown(element, parsedDate, projectId);
      const interval = setInterval(() => this.updateCountdown(element, parsedDate, projectId), 1000);
      this.countdownIntervals.set(projectId, interval);
    });
  }

  updateCountdown(element, targetDate, projectId) {
    if (!element || !targetDate) return;

    const distance = targetDate.getTime() - Date.now();
    if (distance < 0) {
      const interval = this.countdownIntervals.get(projectId);
      if (interval) clearInterval(interval);
      this.countdownIntervals.delete(projectId);
      element.innerHTML = `<div class="countdown-finished"><i class="bx bx-rocket"></i><span class="released-text">Released!</span></div>`;
      return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    element.innerHTML = `
      <div class="countdown-timer">
        <div class="time-unit ${days === 0 ? 'expired' : ''}"><span class="time-value">${String(days).padStart(2, '0')}</span><span class="time-label">Days</span></div>
        <div class="time-separator">:</div>
        <div class="time-unit ${days === 0 && hours === 0 ? 'expired' : ''}"><span class="time-value">${String(hours).padStart(2, '0')}</span><span class="time-label">Hours</span></div>
        <div class="time-separator">:</div>
        <div class="time-unit ${days === 0 && hours === 0 && minutes === 0 ? 'urgent' : ''}"><span class="time-value">${String(minutes).padStart(2, '0')}</span><span class="time-label">Min</span></div>
        <div class="time-separator">:</div>
        <div class="time-unit urgent"><span class="time-value">${String(seconds).padStart(2, '0')}</span><span class="time-label">Sec</span></div>
      </div>
    `;
  }

  destroy() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();
  }
}

function initProjects() {
  if (window.projectsManager || !document.querySelector('#projects')) return;
  window.projectsManager = new ProjectsManager();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjects, { once: true });
} else {
  initProjects();
}
