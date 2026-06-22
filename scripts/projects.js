class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.isMobileDevice = true;
    this.countdownIntervals = new Map();
    this.db = null;
    this.isFirebaseInitialized = false;

    // Anti-spam tracking
    this.likeCooldown = new Map();
    this.cooldownTime = 5000; // 5 seconds cooldown between likes (per project)
    this.maxLikesPerMinute = 10; // Maximum likes per minute
    this.likeHistory = [];

    this.init();
  }

  async init() {
    await this.initFirebase();
    this.loadProjects();
    await this.loadProjectLikes();
    this.setupEventListeners();
    this.handleMobileView();

    setInterval(() => this.cleanupLikeHistory(), 60000);
  }

  async initFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyDSwnuab0yqf6UPcePQSNPXXndwHz-DAjw",
      authDomain: "xd-database.firebaseapp.com",
      projectId: "xd-database",
      storageBucket: "xd-database.firebasestorage.app",
      messagingSenderId: "204951222864",
      appId: "1:204951222864:web:f8c2fb4e00f39896636f55"
    };

    try {
      if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase SDK not loaded');
        this.isFirebaseInitialized = false;
        return;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      this.db = firebase.firestore();
      this.isFirebaseInitialized = true;
      // console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed:', error);
      this.isFirebaseInitialized = false;
    }
  }

  canUserLike(projectId) {
    const now = Date.now();

    const lastLikeTime = this.likeCooldown.get(projectId);
    if (lastLikeTime && (now - lastLikeTime < this.cooldownTime)) {
      const timeLeft = Math.ceil((this.cooldownTime - (now - lastLikeTime)) / 1000);
      console.warn(`⏰ Please wait ${timeLeft}s before liking this project again`);
      return { allowed: false, reason: `Please wait ${timeLeft} seconds before liking again` };
    }

    const oneMinuteAgo = now - 60000;
    const recentLikes = this.likeHistory.filter(time => time > oneMinuteAgo);

    if (recentLikes.length >= this.maxLikesPerMinute) {
      console.warn(`🚫 Rate limit exceeded: ${recentLikes.length} likes in the last minute`);
      return { allowed: false, reason: 'Rate limit exceeded. Please wait a minute.' };
    }

    return { allowed: true };
  }

  trackLike(projectId) {
    const now = Date.now();

    this.likeCooldown.set(projectId, now);

    this.likeHistory.push(now);

    setTimeout(() => {
      this.likeCooldown.delete(projectId);
    }, this.cooldownTime);
  }

  cleanupLikeHistory() {
    const oneMinuteAgo = Date.now() - 60000;
    this.likeHistory = this.likeHistory.filter(time => time > oneMinuteAgo);
  }

  loadProjects() {
    this.projects = [
      {
        id: 'immortality-collection',
        title: "FNF': Immortality Collection",
        description: 'Sooner than you think, you will be able to play this game soon.',
        category: 'game',
        status: 'coming-soon',
        status: 'active',
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
        // badge: 'Avaliable now',
        // badgeType: 'success',
        // releaseDate: new Date('2026-07-27')
        releaseDate: null
      },
      // {
      //   id: 'fnf-commission',
      //   title: 'Friday Night Funkin\' Commission',
      //   description: 'If you need a charter, modcharter, or even a coder... Check my commission page for more details.',
      //   category: 'web',
      //   status: 'active',
      //   image: './assets/fnf_commission.png',
      //   features: ['Chart', 'Modchart', 'Code', 'Free', 'Paid'],
      //   links: {
      //     website: 'commission/index.html',
      //     demo: null,
      //     github: null
      //   },
      //   badge: null,
      //   // badgeType: 'success'
      //   badgeType: null
      // },
      {
        id: 'discord-quest',
        title: 'Discord Quest Finisher',
        description: 'Finish your quest without doing or even download any game!',
        category: 'script',
        // status: 'coming-soon',
        status: 'active',
        image: './assets/quest.png',
        features: ['Open-source', 'JavaScript', 'Node.js'],
        links: {
          // website: 'https://github.com/xm5o/discord-quest-finisher',
          // demo: null,
          github: "https://github.com/xm5o/discord-quest-finisher"
        },
        badge: 'NEW',
        badgeType: 'success',
        // releaseDate: new Date('2026-01-09')
        releaseDate: null
      },
      {
        id: 'fnf-chart-creator',
        title: "Friday Night Funkin': Chart Creator",
        description: 'Create an empty chart file without notes and events. Easy to use!',
        category: 'script',
        // status: 'coming-soon',
        status: 'active',
        image: './assets/fnf_chart_creator.png',
        features: ['Open-source', 'Execute', 'FNF', 'Psych Engine'],
        links: {
          // website: 'https://github.com/xm5o/discord-quest-finisher',
          // demo: null,
          github: "https://github.com/xm5o/FNF-Chart-Creator"
        },
        badge: 'NEW',
        badgeType: 'success',
        // releaseDate: new Date('2026-01-09')
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
      //     { icon: 'fas fa-chart-line', text: 'Levels' }
      //   ],
      //   links: {
      //     website: 'https://xm5o.github.io/selina/',
      //     demo: null,
      //     github: null
      //   },
      //   badge: 'Coming Soon',
      //   badgeType: 'coming-soon',
      //   releaseDate: null
      // }
    ];
  }

  async loadProjectLikes() {
    this.projects.forEach(project => {
      if (typeof project.likes === 'undefined') {
        project.likes = 0;
      }
    });

    const userLikes = this.getUserLikes();
    this.projects.forEach(project => {
      project.isLikedByUser = userLikes.includes(project.id);
    });

    if (this.isFirebaseInitialized && this.db) {
      try {
        // console.log('🔄 Loading like counts from Firebase...');

        const projectsRef = this.db.collection('projects');
        const snapshot = await projectsRef.get();

        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const data = doc.data();
            const project = this.getProject(doc.id);

            if (project && data.likes !== undefined) {
              project.likes = data.likes;
              // console.log(`📊 ${project.title}: ${project.likes} likes`);
            }
          });
        } else {
          // console.log('📝 Initializing projects in Firebase...');
          await this.initializeFirebaseProjects();
        }

        // console.log('✅ Like counts loaded from Firebase');
      } catch (error) {
        console.warn('⚠️ Could not load likes from Firebase:', error);
      }
    }
  }

  async initializeFirebaseProjects() {
    if (!this.isFirebaseInitialized || !this.db) return;

    const batch = this.db.batch();

    this.projects.forEach(project => {
      const projectRef = this.db.collection('projects').doc(project.id);
      batch.set(projectRef, {
        title: project.title,
        likes: 0,
        category: project.category,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    });

    try {
      await batch.commit();
      // console.log('✅ All projects initialized in Firebase');
    } catch (error) {
      console.error('❌ Error initializing Firebase projects:', error);
    }
  }

  getUserLikes() {
    let userLikes = [];
    try {
      const storedLikes = localStorage.getItem('project_likes');
      userLikes = storedLikes ? JSON.parse(storedLikes) : [];

      if (!Array.isArray(userLikes)) {
        console.warn('⚠️ Invalid likes format, resetting');
        userLikes = [];
        localStorage.setItem('project_likes', JSON.stringify(userLikes));
      }
    } catch (error) {
      console.warn('Could not get user likes:', error);
      userLikes = [];
    }

    return userLikes;
  }

  saveUserLikes(likes) {
    try {
      localStorage.setItem('project_likes', JSON.stringify(likes));
    } catch (error) {
      console.warn('Could not save user likes:', error);
    }
  }

  async handleLikeClick(projectId) {
    const spamCheck = this.canUserLike(projectId);
    if (!spamCheck.allowed) {
      this.showErrorMessage(spamCheck.reason);
      return;
    }

    const project = this.getProject(projectId);
    if (!project) return;

    let userLikes = this.getUserLikes();
    const isLiked = userLikes.includes(projectId);

    if (isLiked) {
      userLikes = userLikes.filter(id => id !== projectId);
      project.isLikedByUser = false;
      // console.log(`👎 User unliked: ${projectId}`);
    } else {
      userLikes.push(projectId);
      project.isLikedByUser = true;
      // console.log(`👍 User liked: ${projectId}`);
      this.trackLike(projectId); // Track for anti-spam
    }

    this.saveUserLikes(userLikes);

    this.updateLikeUI(projectId, project.likes, !isLiked);

    await this.updateFirebaseLikeCount(projectId, isLiked ? -1 : 1);
  }

  async updateFirebaseLikeCount(projectId, change) {
    if (!this.isFirebaseInitialized || !this.db) {
      // console.log('📱 Firebase not available');
      return;
    }

    const projectRef = this.db.collection('projects').doc(projectId);
    const project = this.getProject(projectId);

    try {
      await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(projectRef);

        let currentLikes = 0;
        if (doc.exists) {
          currentLikes = doc.data().likes || 0;
        }

        const newLikes = Math.max(0, currentLikes + change);

        transaction.set(projectRef, {
          likes: newLikes,
          lastLike: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          title: project.title,
          category: project.category
        }, { merge: true });

        return newLikes;
      }).then(async (newLikes) => {
        project.likes = newLikes;

        this.updateLikeCountUI(projectId, newLikes);

        // console.log(`✅ Firebase updated: ${projectId} = ${newLikes} likes`);

        await this.logLikeActivity(projectId, change > 0);
      });
    } catch (error) {
      console.error('❌ Error updating Firebase:', error);

      project.likes = Math.max(0, project.likes + change);
      this.updateLikeCountUI(projectId, project.likes);
    }
  }

  async logLikeActivity(projectId, liked) {
    if (!this.isFirebaseInitialized || !this.db) return;

    try {
      const activityId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const activityRef = this.db.collection('like_activity').doc(activityId);

      const fingerprint = await this.getUserFingerprint();

      await activityRef.set({
        projectId: projectId,
        action: liked ? 'like' : 'unlike',
        timestamp: new Date().toISOString(),
        userFingerprint: fingerprint,
        userAgent: navigator.userAgent,
        ipHash: await this.hashString(window.location.hostname) // Simple IP approximation
      }, { merge: true });

    } catch (error) {
      console.warn('Could not log like activity:', error);
    }
  }

  async getUserFingerprint() {
    try {
      const factors = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        screen.width,
        screen.height,
        screen.colorDepth,
        localStorage.getItem('user_session_id') || 'anonymous'
      ].join('|');

      return await this.hashString(factors);
    } catch (error) {
      return 'anonymous_' + Math.random().toString(36).substr(2, 9);
    }
  }

  async hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  showErrorMessage(message) {
    let errorContainer = document.getElementById('like-error-container');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = 'like-error-container';
      errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
      `;
      document.body.appendChild(errorContainer);
    }

    const errorMsg = document.createElement('div');
    errorMsg.className = 'like-error-message';
    errorMsg.style.cssText = `
      background: #ff4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;
    errorMsg.textContent = message;

    errorContainer.appendChild(errorMsg);

    setTimeout(() => {
      errorMsg.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (errorContainer.contains(errorMsg)) {
          errorContainer.removeChild(errorMsg);
        }
      }, 300);
    }, 3000);
  }

  updateLikeUI(projectId, likeCount, wasLiked) {
    const likeBtn = document.querySelector(`.like-btn[data-project-id="${projectId}"]`);
    const likeIcon = likeBtn?.querySelector('i');
    const likePopup = document.getElementById(`like-popup-${projectId}`);

    if (likeBtn) {
      if (wasLiked) {
        likeBtn.classList.add('liked');
        likeBtn.setAttribute('aria-label', 'Unlike this project');
        if (likeIcon) likeIcon.className = 'fas fa-heart';
      } else {
        likeBtn.classList.remove('liked');
        likeBtn.setAttribute('aria-label', 'Like this project');
        if (likeIcon) likeIcon.className = 'far fa-heart';
      }

      likeBtn.disabled = true;
      setTimeout(() => {
        likeBtn.disabled = false;
      }, 1000);
    }

    if (likePopup) {
      likePopup.textContent = wasLiked ? 'Liked!' : 'Like removed';
      likePopup.classList.add('show');
      setTimeout(() => likePopup.classList.remove('show'), 1500);
    }
  }

  updateLikeCountUI(projectId, likeCount) {
    const likeCountEl = document.getElementById(`like-count-${projectId}`);
    if (likeCountEl) {
      likeCountEl.textContent = likeCount;
      likeCountEl.style.transform = 'scale(1.2)';
      likeCountEl.style.color = '#ff4757';
      setTimeout(() => {
        likeCountEl.style.transform = 'scale(1)';
        likeCountEl.style.color = '';
      }, 300);
    }
  }

  generateLikeButton(project) {
    const isLiked = project.isLikedByUser || false;

    return `
        <div class="project-like-container">
            <button class="like-btn ${isLiked ? 'liked' : ''}" 
                    data-project-id="${project.id}"
                    aria-label="${isLiked ? 'Unlike this project' : 'Like this project'}"
                    title="Click to ${isLiked ? 'unlike' : 'like'}">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                <div class="like-sparkle"></div>
            </button>
            <span class="like-count" id="like-count-${project.id}">${project.likes || 0}</span>
            <div class="like-popup" id="like-popup-${project.id}">
                ${isLiked ? 'Liked!' : 'Click to like'}
            </div>
        </div>
    `;
  }

  addLikeStyles() {
    if (document.getElementById('like-styles')) return;

    const styles = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .like-btn {
          transition: all 0.3s ease;
        }
        
        .like-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .like-btn.liked {
          color: #ff4757;
        }
        
        .like-count {
          transition: all 0.3s ease;
        }
        
        .like-popup {
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          white-space: nowrap;
          z-index: 10;
        }
        
        .like-popup.show {
          opacity: 1;
        }
        
        .like-popup:after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'like-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
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

    this.addLikeStyles();
  }

  handleMobileView() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    this.isMobileDevice = this.detectMobile();

    if (this.isMobileDevice) {
      // this.showMobileMessage();
      this.showProjectsGrid();
    } else {
      this.showProjectsGrid();
    }
  }

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
    const likeButton = this.generateLikeButton(project);

    card.innerHTML = `
        <div class="project-img-container">
            ${likeButton}
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

    const likeBtn = card.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await this.handleLikeClick(project.id);
      });
    }

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

    if (filter === 'most-liked') {
      this.renderMostLikedProjects();
    } else {
      this.renderProjects();
    }

    this.startCountdowns();
  }

  renderMostLikedProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const mostLikedProjects = [...this.projects]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 6);

    mostLikedProjects.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      grid.appendChild(projectCard);
    });
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

  getTotalLikes() {
    return this.projects.reduce((total, project) => total + (project.likes || 0), 0);
  }

  getMostLikedProjects(limit = 3) {
    return [...this.projects]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, limit);
  }

  destroy() {
    this.countdownIntervals.forEach(interval => clearInterval(interval));
    this.countdownIntervals.clear();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // console.log('🚀 Initializing Projects Manager with Anti-Spam...');

  if (typeof firebase === 'undefined') {
    console.warn('⚠️ Firebase SDK not loaded. Loading dynamically...');

    try {
      await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
      // console.log('✅ Firebase App SDK loaded');

      await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js');
      // console.log('✅ Firebase Firestore SDK loaded');

    } catch (error) {
      console.error('❌ Failed to load Firebase SDK:', error);
    }
  }

  window.projectsManager = new ProjectsManager();

  if (!document.querySelector('link[href*="fontawesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
    // console.log('✅ FontAwesome loaded dynamically');
  }
});

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.projectsManagerAdmin = {
  viewLikeActivity: async (limit = 50) => {
    if (!window.projectsManager.isFirebaseInitialized) {
      // console.log('❌ Firebase not initialized');
      return;
    }

    try {
      const snapshot = await window.projectsManager.db.collection('like_activity')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      // console.log('📊 Recent Like Activity:');
      snapshot.forEach(doc => {
        const data = doc.data();
        // console.log(`• ${data.timestamp} - ${data.action} on ${data.projectId} by ${data.userFingerprint}`);
      });
    } catch (error) {
      console.error('❌ Error fetching like activity:', error);
    }
  },

  resetSpamProtection: () => {
    window.projectsManager.likeCooldown.clear();
    window.projectsManager.likeHistory = [];
    // console.log('✅ Spam protection reset');
  },

  setSpamSettings: (cooldownTime = 5000, maxLikesPerMinute = 10) => {
    window.projectsManager.cooldownTime = cooldownTime;
    window.projectsManager.maxLikesPerMinute = maxLikesPerMinute;
    // console.log(`✅ Spam settings updated: ${cooldownTime}ms cooldown, ${maxLikesPerMinute} likes/minute`);
  },

  updateProjectLikes: async (projectId, newCount) => {
    if (!window.projectsManager.isFirebaseInitialized) {
      // console.log('❌ Firebase not initialized');
      return;
    }

    try {
      await window.projectsManager.db.collection('projects').doc(projectId).set({
        likes: newCount,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      const project = window.projectsManager.getProject(projectId);
      if (project) {
        project.likes = newCount;
        window.projectsManager.updateLikeCountUI(projectId, newCount);
      }

      // console.log(`✅ Project ${projectId} likes updated to ${newCount}`);
    } catch (error) {
      console.error('❌ Error updating project likes:', error);
    }
  }
};