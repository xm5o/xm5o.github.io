class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.isMobileDevice = false;
    this.countdownIntervals = new Map();

    this.init();
  }

  init() {
    // this.isMobileDevice = this.detectMobile();
    this.loadProjects();
    this.setupEventListeners();
    this.handleMobileView();
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return mobileRegex.test(userAgent) || (isSmallScreen && isTouchDevice);
  }

  loadProjects() {
    const now = new Date();
    const future1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const future2 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    
    this.projects = [
      {
        id: 'fnf-commission',
        title: 'Friday Night Funkin\' Commission',
        description: 'If you need a charter, modcharter, or even a coder... Check my commission page for more details.',
        category: 'web',
        status: 'active',
        image: './assets/fnf_commission.png',
        features: ['Chart', 'Modchart', 'Code', 'Free', 'Paid'],
        links: {
          website: 'commission/index.html',
          demo: null,
          github: null
        },
        badge: 'NEW',
        badgeType: 'success'
      },
      // {
      //   id: 'immortal-collection',
      //   title: 'Immortal and DarkM7 Collection',
      //   description: 'A mysterious project shrouded in secrecy. Something incredible is brewing behind the scenes...',
      //   category: 'game',
      //   status: 'coming-soon',
      //   image: './assets/immortal_collection.png',
      //   features: [
      //     { icon: 'fas fa-question', text: 'Coming Soon...' }
      //   ],
      //   links: {
      //     website: null,
      //     demo: null,
      //     github: null
      //   },
      //   badge: 'Coming Soon',
      //   badgeType: 'coming-soon',
      //   releaseDate: null
      // },
      {
        id: 'psycho-funkin',
        title: 'Psycho Funkin',
        description: 'An exciting Friday Night Funkin\' mod featuring unique characters, challenging gameplay and original music tracks.',
        category: 'game',
        status: 'demo',
        image: './assets/psycho.jpg',
        features: [
          { icon: 'fas fa-music', text: 'Psycho Songs' },
          { icon: 'fas fa-users', text: 'Psycho Characters' },
          { icon: 'fas fa-star', text: 'Psycho Gameplay' }
        ],
        links: {
          website: null,
          demo: 'https://gamejolt.com/games/psycho-bros/960818',
          github: null
        },
        badge: 'DEMO Version',
        badgeType: 'demo'
      },
      {
        id: 'nates-secrets',
        title: 'Nate\'s Secrets',
        description: 'A mysterious project shrouded in secrecy. Something incredible is brewing behind the scenes...',
        category: 'game',
        status: 'coming-soon',
        image: './assets/Nate.png',
        features: [
          { icon: 'fas fa-question', text: 'Mystery' }
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
      // {
      //   id: 'selina-discord-bot',
      //   title: 'Selina Discord Bot',
      //   description: 'Your perfect server companion with powerful moderation tools, fun commands, and 24/7 reliability. Make your Discord server amazing!',
      //   category: 'app',
      //   status: 'coming-soon',
      //   image: './assets/selina.jpg',
      //   features: [
      //     { icon: 'fas fa-shield-alt', text: 'Moderation' },
      //     { icon: 'fas fa-gamepad', text: 'Fun Games' },
      //     { icon: 'fas fa-user-plus', text: 'Welcome' },
      //     { icon: 'fas fa-chart-line', text: 'Levels' },
      //     { icon: 'fas fa-map', text: 'Fortnite' }
      //   ],
      //   links: {
      //     website: 'https://xm5o.github.io/selina/',
      //     demo: null,
      //     github: null
      //   },
      //   badge: 'Coming Soon',
      //   badgeType: 'coming-soon',
      //   releaseDate: null
      // },
      // {
      //   id: 'fortnite-hub',
      //   title: 'Fortnite Hub',
      //   description: 'Your one-stop destination for everything Fortnite, including guides, news, stats tracking and item shop updates.',
      //   category: 'web',
      //   status: 'active',
      //   image: './assets/fnhub.png',
      //   features: [
      //     { icon: 'fas fa-tshirt', text: 'Skins & Cosmetics' },
      //     { icon: 'fas fa-map', text: 'Map Updates' },
      //     { icon: 'fas fa-calendar-alt', text: 'Tournaments' }
      //   ],
      //   links: {
      //     website: 'https://xm5o.github.io/fortnite/',
      //     demo: null,
      //     github: null
      //   },
      //   badge: null, // Updated Daily
      //   badgeType: null // success
      // }
    ];
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

    if (this.isMobileDevice) {
      this.showMobileMessage();
    } else {
      this.showProjectsGrid();
    }
  }

  // Show mobile message with enhanced design
  showMobileMessage() {
    const container = document.querySelector('.projects .container');
    if (!container) return;

    if (!container.hasAttribute('data-original-content')) {
      container.setAttribute('data-original-content', container.innerHTML);
    }

    container.innerHTML = `
            <div class="mobile-projects-message">
                <div class="message-content">
                    <div class="message-icon">
                        <i class="fas fa-mobile-alt"></i>
                        <div class="icon-glow"></div>
                        <div class="icon-pulse"></div>
                    </div>
                    <h3 class="message-title">Mobile Experience Coming Soon</h3>
                    <p class="message-description">
                        The projects section is being optimized for mobile devices. We're crafting an 
                        <span class="highlight">amazing mobile portfolio experience</span> just for you!
                    </p>
                    <div class="progress-indicator">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                            <div class="progress-shine"></div>
                        </div>
                        <span class="progress-text">Development in Progress</span>
                        <div class="progress-percentage">75%</div>
                    </div>
                    <div class="feature-preview">
                        <div class="preview-item">
                            <i class="fas fa-mobile-screen-button"></i>
                            <span>Mobile Optimized</span>
                        </div>
                        <div class="preview-item">
                            <i class="fas fa-touch"></i>
                            <span>Touch Friendly</span>
                        </div>
                        <div class="preview-item">
                            <i class="fas fa-rocket"></i>
                            <span>Fast Loading</span>
                        </div>
                    </div>
                    <div class="message-footer">
                        <i class="fas fa-laptop"></i>
                        <span>Best viewed on desktop for now</span>
                    </div>
                </div>
                <div class="floating-elements">
                    <div class="float-element"></div>
                    <div class="float-element"></div>
                    <div class="float-element"></div>
                    <div class="float-element"></div>
                </div>
            </div>
        `;

    this.addMobileStyles();
  }

  showProjectsGrid() {
    const container = document.querySelector('.projects .container');
    if (!container) return;

    const originalContent = container.getAttribute('data-original-content');
    if (originalContent) {
      container.innerHTML = originalContent;
      container.removeAttribute('data-original-content');
      this.setupEventListeners(); // Re-setup event listeners
    }

    this.renderProjects();
    this.startCountdowns();
  }

  // Render all projects
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

  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-category', project.category);
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

    if (project.links.discord &&
      project.links.discord !== project.links.website &&
      project.links.discord !== project.links.demo) {
      actions.push(`
                <a href="${project.links.discord}" class="quick-action-btn" target="_blank" aria-label="Add to Discord">
                    <i class="fab fa-discord"></i>
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
    switch (project.status) {
      case 'active':
        const primaryLink = project.links.website || project.links.demo;
        const buttonText = project.links.website ? 'Visit Website' : 'Play Now';
        const icon = project.links.website ? 'fas fa-external-link-alt' : 'fas fa-gamepad';

        return `
                    <a href="${primaryLink}" class="add-button primary" target="_blank">
                        <i class="${icon}"></i>
                        <span>${buttonText}</span>
                    </a>
                `;

      case 'demo':
        return `
                    <a href="${project.links.demo}" class="add-button primary" target="_blank">
                        <i class="fas fa-gamepad"></i>
                        <span>Play Demo</span>
                    </a>
                `;

      case 'coming-soon':
      default:
        return `
                    <a class="add-button disabled">
                        <i class="fas fa-hourglass-half"></i>
                        <span>Coming Soon</span>
                    </a>
                `;
    }
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
        } else {
          console.warn(`⚠️ Missing data for countdown element:`, {
            projectId,
            targetDate,
            element
          });
        }
      });
    }, 300);
  }

  updateCountdown(element, targetDate, projectId) {
    if (!element || !targetDate) {
      console.error('❌ updateCountdown called with invalid parameters:', { element, targetDate });
      return;
    }

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

    // Debug: Log first update only
    if (!element.hasAttribute('data-first-update')) {
      element.setAttribute('data-first-update', 'true');
    }
  }

  addProject(projectData) {
    projectData.id = projectData.id || `project-${Date.now()}`;
    this.projects.push(projectData);
    this.renderProjects();
    this.startCountdowns();
  }

  removeProject(projectId) {
    if (this.countdownIntervals.has(projectId)) {
      clearInterval(this.countdownIntervals.get(projectId));
      this.countdownIntervals.delete(projectId);
    }
    
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(project => project.id !== projectId);

    if (this.projects.length < initialLength) {
      this.renderProjects();
    } else {
      console.warn(`Project "${projectId}" not found`);
    }
  }

  updateProject(projectId, updates) {
    const projectIndex = this.projects.findIndex(project => project.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex] = { ...this.projects[projectIndex], ...updates };
      this.renderProjects();
      this.startCountdowns();
    } else {
      console.warn(`Project "${projectId}" not found`);
    }
  }

  getProject(projectId) {
    return this.projects.find(project => project.id === projectId);
  }

  getProjectsByCategory(category) {
    return this.projects.filter(project => project.category === category);
  }

  addMobileStyles() {
    if (document.getElementById('mobile-projects-styles')) return;

    const styles = `
            .mobile-projects-message {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 5rem 3rem;
                text-align: center;
                position: relative;
                overflow: hidden;
                margin: 4rem 0;
                backdrop-filter: blur(15px);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                animation: slideUpFade 1s ease forwards;
            }
        `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'mobile-projects-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  setProjectStatus(projectId, status) {
    this.updateProject(projectId, { status });
  }

  setProjectReleaseDate(projectId, releaseDate) {
    this.updateProject(projectId, { releaseDate });
  }

  destroy() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.projectsManager = new ProjectsManager();

  if (!document.querySelector('link[href*="fontawesome"]') && !document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.js';
    document.head.appendChild(fontAwesome);
  }
});

window.projectsManagerExamples = {
  testShortCountdown: () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    window.projectsManager.addProject({
      id: 'test-short-countdown',
      title: 'Short Test Countdown',
      description: 'This project will launch in 2 minutes for testing.',
      category: 'web',
      status: 'coming-soon',
      image: './assets/avatar1.jpg',
      features: [{ icon: 'fas fa-clock', text: 'Test Timer' }],
      links: { website: null, demo: null, github: null },
      badge: 'Testing',
      badgeType: 'coming-soon',
      releaseDate: futureDate.toISOString()
    });
    console.log('✅ Test project with 2-minute countdown added');
  },

  // 30 second countdown
  testVeryShortCountdown: () => {
    const futureDate = new Date(Date.now() + 30 * 1000); // 30 seconds from now
    window.projectsManager.addProject({
      id: 'test-very-short-countdown',
      title: 'Very Short Test',
      description: 'This project will launch in 30 seconds.',
      category: 'app',
      status: 'coming-soon',
      image: './assets/avatar1.jpg',
      features: [{ icon: 'fas fa-rocket', text: 'Quick Launch' }],
      links: { website: null, demo: null, github: null },
      badge: 'Quick Test',
      badgeType: 'coming-soon',
      releaseDate: futureDate.toISOString()
    });
    console.log('✅ Test project with 30-second countdown added');
  },

  getStats: () => {
    console.log(window.projectsManager.getProjectsStats());
  },

  debugIntervals: () => {
    console.log('🔍 Active countdown intervals:', window.projectsManager.countdownIntervals);
    console.log('📊 Total intervals:', window.projectsManager.countdownIntervals.size);
  }
};

// Add 2-minute test countdown:
// projectsManagerExamples.testShortCountdown()

// Add 30-second test countdown:
// projectsManagerExamples.testVeryShortCountdown()

// Debug intervals:
// projectsManagerExamples.debugIntervals()

// Get stats:
// projectsManagerExamples.getStats()