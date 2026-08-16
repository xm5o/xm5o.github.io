class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.isMobileDevice = true;
    this.countdownIntervals = new Map();

    this.init();
  }

  init() {
    this.loadProjects();
    this.setupEventListeners();
    this.handleMobileView();
  }

  loadProjects() {
    this.projects = [
      {
        id: 'immortality-collection',
        title: "FNF': Immortality Collection",
        description: "A Friday Night Funkin' mod I'm working on. Not out yet.",
        category: 'game',
        status: 'coming-soon',
        image: './assets/immortality_icon.png',
        features: [
          { icon: 'fas fa-question', text: 'Coming Soon...' }
        ],
        links: {
          website: null,
          demo: null,
          github: null
        },
        badge: 'Coming Soon',
        badgeType: 'coming-soon',
        releaseDate: null
      },
      {
        id: 'fnf-commission',
        title: 'FNF Commissions',
        description: 'I make custom charts, modcharts, and code for Friday Night Funkin\'. Some for free, some paid.',
        category: 'web',
        status: 'active',
        image: './assets/fnf_commission.png',
        features: ['Chart', 'Modchart', 'Code'],
        links: {
          website: 'commission/index.html',
          demo: null,
          github: null
        },
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
        links: {
          github: "https://github.com/xm5o/discord-quest-finisher"
        },
        badge: 'NEW',
        badgeType: 'success',
        releaseDate: null
      },
      {
        id: 'fnf-chart-creator',
        title: "FNF Chart Creator",
        description: 'A tool that makes an empty chart file for you. No notes or events, just a clean start. Easy to use.',
        category: 'script',
        status: 'active',
        image: './assets/fnf_chart_creator.png',
        features: ['Open-source', 'FNF', 'Psych Engine'],
        links: {
          github: "https://github.com/xm5o/FNF-Chart-Creator"
        },
        badge: 'NEW',
        badgeType: 'success',
        releaseDate: null
      },
      {
        id: 'selina-discord-bot',
        title: 'Selina',
        description: 'A Discord bot I\'m building for communities. It has moderation, fun commands, and AI chat. Still in progress.',
        category: 'app',
        status: 'coming-soon',
        image: './assets/selina.jpg',
        features: [
          { icon: 'fas fa-shield-alt', text: 'Moderation' },
          { icon: 'fas fa-gamepad', text: 'Fun Commands' },
          { icon: 'fas fa-comment-dots', text: 'AI Chat' }
        ],
        links: {
          website: 'selina/invite/index.html',
          demo: null,
          github: null
        },
        badge: 'In Progress',
        badgeType: 'coming-soon',
        releaseDate: null
      }
    ];
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return mobileRegex.test(userAgent) || (isSmallScreen && isTouchDevice);
  }

  setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        this.filterProjects(filter);
        this.updateActiveFilter(e.target);
      });
    });
  }

  handleMobileView() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    this.isMobileDevice = this.detectMobile();
    this.showProjectsGrid();
  }

  showProjectsGrid() {
    const container = document.querySelector('.projects .container');
    if (!container) return;

    const originalContent = container.getAttribute('data-original-content');
    if (originalContent) {
      container.innerHTML = originalContent;
      container.removeAttribute('data-original-content');
      this.setupEventListeners();
    }

    this.renderProjects();
    this.startCountdowns();
  }

  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);
    card.setAttribute('data-project-id', project.id);
    card.style.animationDelay = `${index * 0.2}s`;

    const quickActions = this.generateQuickActions(project);
    const features = this.generateFeatures(project.features);
    const actionButton = this.generateActionButton(project);
    const badge = this.generateBadge(project);
    const comingSoonOverlay = this.generateComingSoonOverlay(project);

    card.innerHTML = `
        <div class="project-img-container">
            <div class="project-img" style="background-image: url('${project.image}')"></div>
            ${badge}
            ${project.status === 'coming-soon' ? comingSoonOverlay : `
                <div class="project-overlay">
                    <div class="project-quick-actions">
                        ${quickActions}
                    </div>
                </div>
            `}
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            ${features}
            <div class="project-actions">
                ${actionButton}
            </div>
        </div>
    `;

    return card;
  }

  renderProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filteredProjects = this.currentFilter === 'all'
      ? this.projects
      : this.projects.filter(project => project.category === this.currentFilter);

    filteredProjects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      grid.appendChild(projectCard);
    });
  }

  generateComingSoonOverlay(project) {
    if (project.status !== 'coming-soon') return '';

    return `
            <div class="coming-soon-overlay">
                <div class="coming-soon-content">
                    <div class="coming-soon-icon">
                        <i class="fas fa-clock"></i>
                        <div class="clock-glow"></div>
                    </div>
                    ${project.releaseDate ? `
                        <div class="countdown-container">
                            <h4>Launching In</h4>
                            <div class="countdown" data-target="${project.releaseDate}" data-project="${project.id}">
                                <div class="countdown-loading">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>Loading...</span>
                                </div>
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
      actions.push(`
                <a href="${project.links.website}" class="quick-action-btn" target="_blank" aria-label="Visit Website">
                    <i class="fas fa-globe"></i>
                </a>
            `);
    }

    if (project.links.demo && project.links.demo !== project.links.website) {
      actions.push(`
                <a href="${project.links.demo}" class="quick-action-btn" target="_blank" aria-label="Play Demo">
                    <i class="fas fa-gamepad"></i>
                </a>
            `);
    }

    if (project.links.github) {
      actions.push(`
                <a href="${project.links.github}" class="quick-action-btn" target="_blank" aria-label="View Code">
                    <i class="fab fa-github"></i>
                </a>
            `);
    }

    return actions.join('');
  }

  generateFeatures(features) {
    if (!features || features.length === 0) return '';

    const featureItems = features.map(feature => {
      if (typeof feature === 'string') {
        return `<div class="feature">${feature}</div>`;
      } else {
        return `
                    <div class="feature">
                        <i class="${feature.icon}"></i>
                        <span>${feature.text}</span>
                    </div>
                `;
      }
    }).join('');

    return `
            <div class="project-features">
                ${featureItems}
            </div>
        `;
  }

  generateActionButton(project) {
    if (project.status !== 'active') {
      return `
      <a class="add-button disabled">
        <i class="fas fa-hourglass-half"></i>
        <span>Coming Soon</span>
      </a>
    `;
    }

    let primaryLink = null;
    let buttonText = '';
    let icon = '';

    if (project.links.website) {
      primaryLink = project.links.website;
      buttonText = 'Visit Website';
      icon = 'fas fa-external-link-alt';
    } else if (project.links.github) {
      primaryLink = project.links.github;
      buttonText = 'View Source';
      icon = 'fab fa-github';
    } else if (project.links.demo) {
      primaryLink = project.links.demo;
      buttonText = 'Play Now';
      icon = 'fas fa-gamepad';
    }

    if (!primaryLink) return '';

    return `
    <a href="${primaryLink}" class="add-button primary" target="_blank">
      <i class="${icon}"></i>
      <span>${buttonText}</span>
    </a>
  `;
  }

  generateBadge(project) {
    if (!project.badge) return '';

    let badgeClass = 'status-badge';

    switch (project.badgeType) {
      case 'success':
        badgeClass += ' badge-success';
        break;
      case 'demo':
        badgeClass += ' demo';
        break;
      case 'beta':
        badgeClass += ' beta';
        break;
      case 'coming-soon':
        badgeClass += ' coming-soon';
        break;
    }

    return `<div class="${badgeClass}">${project.badge}</div>`;
  }

  filterProjects(filter) {
    this.currentFilter = filter;
    this.renderProjects();
    this.startCountdowns();
  }

  updateActiveFilter(activeBtn) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
  }

  startCountdowns() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();

    setTimeout(() => {
      const countdownElements = document.querySelectorAll('.countdown');

      countdownElements.forEach((element, index) => {
        const targetDate = element.getAttribute('data-target');
        const projectId = element.getAttribute('data-project');

        if (targetDate && projectId) {
          const parsedDate = new Date(targetDate);

          if (isNaN(parsedDate.getTime())) {
            console.error(`❌ Invalid date for project ${projectId}:`, targetDate);
            return;
          }

          this.updateCountdown(element, parsedDate, projectId);

          const interval = setInterval(() => {
            this.updateCountdown(element, parsedDate, projectId);
          }, 1000);

          this.countdownIntervals.set(projectId, interval);
        }
      });
    }, 300);
  }

  updateCountdown(element, targetDate, projectId) {
    if (!element || !targetDate) return;

    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      if (this.countdownIntervals.has(projectId)) {
        clearInterval(this.countdownIntervals.get(projectId));
        this.countdownIntervals.delete(projectId);
      }

      element.innerHTML = `
                <div class="countdown-finished">
                    <i class="fas fa-rocket"></i>
                    <span class="released-text">Released!</span>
                </div>
            `;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const countdownHTML = `
            <div class="countdown-timer">
                <div class="time-unit ${days === 0 ? 'expired' : ''}">
                    <span class="time-value">${String(days).padStart(2, '0')}</span>
                    <span class="time-label">Days</span>
                </div>
                <div class="time-separator">:</div>
                <div class="time-unit ${days === 0 && hours === 0 ? 'expired' : ''}">
                    <span class="time-value">${String(hours).padStart(2, '0')}</span>
                    <span class="time-label">Hours</span>
                </div>
                <div class="time-separator">:</div>
                <div class="time-unit ${days === 0 && hours === 0 && minutes === 0 ? 'urgent' : ''}">
                    <span class="time-value">${String(minutes).padStart(2, '0')}</span>
                    <span class="time-label">Min</span>
                </div>
                <div class="time-separator">:</div>
                <div class="time-unit urgent">
                    <span class="time-value">${String(seconds).padStart(2, '0')}</span>
                    <span class="time-label">Sec</span>
                </div>
            </div>
        `;

    element.innerHTML = countdownHTML;
  }

  getProject(projectId) {
    return this.projects.find(project => project.id === projectId);
  }

  getProjectsByCategory(category) {
    return this.projects.filter(project => project.category === category);
  }

  destroy() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.projectsManager = new ProjectsManager();

  if (!document.querySelector('link[href*="fontawesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
  }
});