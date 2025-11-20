class TranslationSystem {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {
      en: {
        nav: {
          home: 'Home',
          about: 'About',
          skills: 'Skills',
          projects: 'Projects',
          music: 'Music',
          blog: 'Blog',
          contact: 'Contact'
        },
        home: {
          greeting: "It's",
          name: 'Immortal',
          subtitle: 'Where Code Meets Creativity',
          role: 'Web Developer',
          tagline: 'Creative developer building digital experiences that inspire and transform ideas into reality',
          yearsExperience: 'Years Experience',
          projectsCompleted: 'Projects Completed',
          exploreWork: 'Explore My Work',
          hireMe: 'Hire Me',
          siteViews: 'Site Views',
          scrollDown: 'Scroll Down',
          welcome: 'Welcome',
          initializing: 'Initializing...',
          tip: '💡 Tip: Use keyboard shortcuts for faster navigation'
        },
        discord: {
          activity: 'Discord Activity',
          status: 'Check out what I\'m currently up to on Discord - music, games, and status',
          listeningSpotify: 'Listening to Spotify',
          notPlaying: 'Not Playing',
          spotify: 'Spotify',
          loading: 'Loading...',
          online: 'Online',
          idle: 'Idle',
          dnd: 'Do Not Disturb',
          offline: 'Offline',
          customStatus: 'Custom Status',
          connected: 'Connected to Discord'
        },
        highlighted: {
          title: 'Featured Content',
          watchNow: 'Watch Now'
        },
        about: {
          title: 'About',
          titleSpan: 'Me',
          profile: 'Profile',
          experience: 'Experience',
          education: 'Education',
          yearsCoding: 'Years Coding',
          description: "I am a Creative Web Developer with over 4+ years of experience, specializing in transforming unique ideas into engaging and high-performance digital experiences. My passion lies at the intersection of code and creativity, where I craft dynamic websites and applications that are both aesthetically pleasing and functionally robust. I thrive on building projects from the ground up, focusing on clean architecture, modern web standards, and delivering exceptional user engagement. I am currently Available for Freelance and open to collaborating on innovative projects. Let's build something amazing together.",
          name: 'Name:',
          age: 'Age:',
          pronouns: 'Pronouns:',
          location: 'Location:',
          freelance: 'Freelance:',
          available: 'Available',
          coreCompetencies: 'Core Competencies',
          frontendDev: 'Frontend Development',
          backendDev: 'Backend Development (Node.js/Firebase)',
          creativeDesign: 'Creative Design & UI/UX',
          technologies: 'Technologies I Work With',
          getInTouch: 'Get In Touch',
          // Experience Tab
          freelanceExp: 'Creative Web Developer (Freelance)',
          freelancePeriod: '2022 - Present',
          freelanceDesc: 'Designing, developing, and deploying custom, high-performance websites and web applications for a diverse range of clients. Focusing on modern frontend frameworks, responsive design, and clean code architecture.',
          botDev: 'Discord Bot Developer',
          botPeriod: 'Present',
          botDesc: 'Created and maintained "Selina" Discord bot with moderation tools, fun commands, and server management features.',
          fnfModder: 'Friday Night Funkin\' Modder',
          fnfPeriod: '2023 - Present',
          fnfDesc: 'Designed and developed custom charts and game mechanics for Friday Night Funkin\' mods including "Psycho Funkin"'
        },
        services: {
          title: 'My',
          titleSpan: 'Skills',
          subtitle: 'Discover my technical expertise and creative abilities that drive innovative solutions',
          coding: {
            title: 'Coding & Modcharting',
            desc: 'Experienced coder for websites and skilled modcharter for Friday Night Funkin\' (FNF). Available to collaborate on your mod projects - contact me via Discord or through the form below.'
          },
          gaming: {
            title: 'Gaming',
            desc: 'Passionate gamer who enjoys competitive play, achieving high rankings, and having fun with friends. Always looking for new challenges and gaming experiences.'
          },
          communication: {
            title: 'Communication',
            desc: 'Enjoy connecting with others in communities and public servers. Open to making new friends and building relationships - feel free to reach out anytime!'
          }
        },
        projects: {
          title: 'My',
          titleSpan: 'Projects',
          subtitle: 'Discover the innovative solutions and creative projects I\'ve been working on recently',
          allProjects: 'All Projects',
          apps: 'Apps',
          games: 'Games',
          web: 'Web',
          viewProject: 'View Project',
          sourceCode: 'Source Code',
          liveDemo: 'Live Demo',
        },
        blog: {
          title: 'Blog &',
          titleSpan: 'Updates',
          subtitle: 'Stay updated with my latest projects, development insights, and community updates',
          allPosts: 'All Posts',
          development: 'Development',
          fnf: 'FNF Modding',
          community: 'Community',
          tutorials: 'Tutorials',
          other: 'Other',
          loadMore: 'Load More Posts',
          readMore: 'Read More',
          published: 'Published',
        },
        contact: {
          title: 'Contact',
          titleSpan: 'Me',
          subtitle: 'Ready to collaborate? Let\'s connect and build something amazing together!',
          connectDiscord: 'Let\'s Connect on Discord!',
          discordSubtitle: 'The fastest and most efficient way to reach me',
          username: '@trr0',
          quickResponses: 'Quick responses',
          realTime: 'Real-time communication',
          allDevices: 'Available on all devices',
          directCollaboration: 'Direct collaboration',
          messageDiscord: 'Message Me on Discord',
          whyDiscord: 'Why Discord First?',
          instantNotifications: 'Instant notifications',
          easyFileSharing: 'Easy file sharing',
          voiceVideoCalls: 'Voice & video calls',
          securePlatform: 'Secure platform',
          alternativePlatforms: 'Alternative Platforms',
          formalInquiries: 'For formal business inquiries:',
          responseTime: 'Response Time:',
          usuallyWithin: 'Usually within',
          hours: '1-6 hours',
          fasterThanEmail: 'faster than email!',
          avgResponse: 'Avg Response Time',
          satisfactionRate: 'Satisfaction Rate',
          messageSent: 'Message Sent Successfully!',
          willGetBack: 'I\'ll get back to you as soon as possible.',
          close: 'Close',
          copyEmail: 'Email copied to clipboard!'
        },
        music: {
          bandDescription: 'An American Dream Pop band founded in 2008 in El Paso, Texas by Greg Gonzalez. The band is known for their dreamy, calm style and soft sound that creates romantic and intimate atmospheres.',
        },
        footer: {
          copyright: '© Immortal | All Rights Reserved',
          allRights: 'All Rights Reserved'
        },
        general: {
          loading: 'Please wait...',
          close: 'Close',
          today: 'today',
          justNow: 'Just now',
          online: 'Online',
          active: 'Active'
        }
      },
      ar: {
        nav: {
          home: 'الرئيسية',
          about: 'نبذة عني',
          skills: 'المهارات',
          projects: 'المشاريع',
          music: 'الموسيقى',
          blog: 'التحديثات',
          contact: 'التواصل'
        },
        home: {
          greeting: 'إنه',
          name: 'امورتال',
          subtitle: 'حيث يلتقي الكود بالإبداع',
          role: 'مطور ويب',
          tagline: 'مطور مبدع يبني تجارب رقمية تلهم وتحول الأفكار إلى واقع',
          yearsExperience: 'سنوات خبرة',
          projectsCompleted: 'مشاريع مكتملة',
          exploreWork: 'استكشف أعمالي',
          hireMe: 'وظفني',
          siteViews: 'مشاهدات الموقع',
          scrollDown: 'مرر لأسفل',
          welcome: 'أهلاً بك',
          initializing: 'جاري التهيئة...',
          tip: '💡 نصيحة: استخدم اختصارات لوحة المفاتيح للتنقل السريع'
        },
        discord: {
          activity: 'نشاط الديسكورد',
          status: 'اطلع على ما أفعله حاليًا على الديسكورد - الموسيقى، الألعاب، والحالة',
          listeningSpotify: 'يستمع إلى سبوتيفاي',
          notPlaying: 'لا يشغل أي شيء',
          spotify: 'سبوتيفاي',
          loading: 'جاري التحميل...',
          online: 'متصل',
          idle: 'خامل',
          dnd: 'لا تزعج',
          offline: 'غير متصل',
          customStatus: 'حالة مخصصة',
          connected: 'متصل بالديسكورد'
        },
        highlighted: {
          title: 'المحتوى المميز',
          watchNow: 'شاهد الآن'
        },
        about: {
          title: 'نبذة',
          titleSpan: 'عني',
          profile: 'الملف الشخصي',
          experience: 'الخبرة',
          education: 'التعليم',
          yearsCoding: 'سنوات البرمجة',
          description: 'أنا مطور ويب مبدع مع أكثر من 4 سنوات من الخبرة، متخصص في تحويل الأفكار الفريدة إلى تجارب رقمية جذابة وعالية الأداء. شغفي يكمن عند تقاطع الكود والإبداع، حيث أصمم مواقع وتطبيقات ديناميكية تكون جميلة من الناحية الجمالية وقوية من الناحية الوظيفية. أزدهر في بناء المشاريع من الصفر، مع التركيز على البنية النظيفة، معايير الويب الحديثة، وتقديم مشاركة استثنائية للمستخدم. أنا حاليًا متاح للعمل الحر ومفتوح للتعاون في المشاريع المبتكرة. دعونا نبني شيئًا مذهلاً معًا.',
          name: 'الاسم:',
          age: 'العمر:',
          pronouns: 'الضمائر:',
          location: 'الموقع:',
          freelance: 'العمل الحر:',
          available: 'متاح',
          coreCompetencies: 'الكفاءات الأساسية',
          frontendDev: 'تطوير الواجهة الأمامية',
          backendDev: 'تطوير الواجهة الخلفية (Node.js/Firebase)',
          creativeDesign: 'التصميم الإبداعي وواجهة المستخدم/تجربة المستخدم',
          technologies: 'التقنيات التي أعمل بها',
          getInTouch: 'تواصل معي',
          // Experience Tab
          freelanceExp: 'مطور ويب إبداعي (عمل حر)',
          freelancePeriod: '2022 - الحاضر',
          freelanceDesc: 'تصميم وتطوير ونشر مواقع ويب وتطبيقات ويب مخصصة عالية الأداء لمجموعة متنوعة من العملاء. التركيز على أطر العمل الحديثة للواجهة الأمامية، التصميم المتجاوب، وهندسة الكود النظيفة.',
          botDev: 'مطور بوتات الديسكورد',
          botPeriod: 'الحاضر',
          botDesc: 'إنشاء وصيانة بوت الديسكورد "سيلينا" بأدوات الإشراف، الأوامر المسلية، وميزات إدارة الخوادم.',
          fnfModder: 'مطور تعديلات Friday Night Funkin\'',
          fnfPeriod: '2023 - الحاضر',
          fnfDesc: 'تصميم وتطوير مخططات وميكانيكيات ألعاب مخصصة لتعديلات Friday Night Funkin\' بما في ذلك "Psycho Funkin"'
        },
        services: {
          title: 'مهاراتي',
          titleSpan: '',
          subtitle: 'اكتشف خبرتي التقنية وقدراتي الإبداعية التي تدفع الحلول المبتكرة',
          coding: {
            title: 'البرمجة وإنشاء المخططات',
            desc: 'مبرمج متمرس للمواقع ومبدع مخططات ماهر لتعديلات Friday Night Funkin\' (FNF). متاح للتعاون في مشاريعك - تواصل معي عبر الديسكورد أو من خلال النموذج أدناه.'
          },
          gaming: {
            title: 'الألعاب',
            desc: 'لاعب شغوف يستمتع باللعب التنافسي، تحقيق مراتب عالية، والاستمتاع مع الأصدقاء. دائمًا أبحث عن تحديات جديدة وتجارب ألعاب.'
          },
          communication: {
            title: 'التواصل',
            desc: 'أستمتع بالتواصل مع الآخرين في المجتمعات والخوادم العامة. مفتوح لتكوين صداقات جديدة وبناء علاقات - لا تتردد في التواصل في أي وقت!'
          }
        },
        projects: {
          title: 'مشاريعي',
          titleSpan: '',
          subtitle: 'اكتشف الحلول المبتكرة والمشاريع الإبداعية التي أعمل عليها مؤخرًا',
          allProjects: 'جميع المشاريع',
          apps: 'التطبيقات',
          games: 'الألعاب',
          web: 'الويب',
          viewProject: 'عرض المشروع',
          sourceCode: 'الكود المصدري',
          liveDemo: 'عرض مباشر'
        },
        blog: {
          title: 'المدونة &',
          titleSpan: 'التحديثات',
          subtitle: 'ابق على اطلاع بأحدث مشاريعي، رؤى التطوير، وتحديثات المجتمع',
          allPosts: 'جميع المنشورات',
          development: 'التطوير',
          fnf: 'تعديلات FNF',
          community: 'المجتمع',
          tutorials: 'الدروس',
          other: 'أخرى',
          loadMore: 'تحميل المزيد من المنشورات',
          readMore: 'اقرأ المزيد',
          published: 'نشر في'
        },
        contact: {
          title: 'تواصل',
          titleSpan: 'معي',
          subtitle: 'مستعد للتعاون؟ دعونا نتواصل ونبني شيئًا مذهلاً معًا!',
          connectDiscord: 'لنتواصل على الديسكورد!',
          discordSubtitle: 'أسرع وأكثر طريقة فعالة للوصول إلي',
          username: '@trr0',
          quickResponses: 'ردود سريعة',
          realTime: 'تواصل فوري',
          allDevices: 'متاح على جميع الأجهزة',
          directCollaboration: 'تعاون مباشر',
          messageDiscord: 'راسلني على الديسكورد',
          whyDiscord: 'لماذا الديسكورد أولاً؟',
          instantNotifications: 'إشعارات فورية',
          easyFileSharing: 'مشاركة ملفات سهلة',
          voiceVideoCalls: 'مكالمات صوتية ومرئية',
          securePlatform: 'منصة آمنة',
          alternativePlatforms: 'منصات بديلة',
          formalInquiries: 'للاستفسارات التجارية الرسمية:',
          responseTime: 'وقت الاستجابة:',
          usuallyWithin: 'عادة خلال',
          hours: '1-6 ساعات',
          fasterThanEmail: 'أسرع من البريد الإلكتروني!',
          avgResponse: 'متوسط وقت الاستجابة',
          satisfactionRate: 'معدل الرضا',
          messageSent: 'تم إرسال الرسالة بنجاح!',
          willGetBack: 'سأعود إليك في أقرب وقت ممكن.',
          close: 'إغلاق',
          copyEmail: 'تم نسخ البريد الإلكتروني إلى الحافظة!'
        },
        music: {
          bandDescription: 'فرقة دريم بوب أمريكية تأسست عام 2008 في إل باسو، تكساس على يد جريج جونزاليس. تشتهر الفرقة بأسلوبها الحالم والهادئ وصوتها الناعم الذي يخلق أجواء رومانسية وحميمية.'
        },
        footer: {
          copyright: '© امورتال | جميع الحقوق محفوظة',
          allRights: 'جميع الحقوق محفوظة'
        },
        general: {
          loading: 'يرجى الانتظار...',
          close: 'إغلاق',
          today: 'اليوم',
          justNow: 'الآن',
          online: 'متصل',
          active: 'نشط'
        }
      }
    };
    
    this.init();
  }

  init() {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (this.translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }

    this.setLanguage(this.currentLanguage);
    
    this.addEventListeners();
  }

  addEventListeners() {
    // Desktop language toggle
    const desktopToggle = document.getElementById('desktop-language-toggle');
    if (desktopToggle) {
      desktopToggle.addEventListener('click', () => this.toggleLanguage());
    }

    // Mobile language toggle
    const mobileToggle = document.getElementById('mobile-language-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => this.toggleLanguage());
    }
  }

  toggleLanguage() {
    const newLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.setLanguage(newLanguage);
  }

  setLanguage(language) {
    if (!this.translations[language]) return;

    this.currentLanguage = language;
    
    // Save preference
    localStorage.setItem('preferred-language', language);
    
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    this.updateLanguageButtons();
    
    this.translatePage();
    
    if (language === 'ar') {
      this.loadArabicFonts();
    }
  }

  updateLanguageButtons() {
    const languageText = this.currentLanguage.toUpperCase();
    
    // Update desktop button
    const desktopText = document.getElementById('desktop-language-text');
    if (desktopText) {
      desktopText.textContent = languageText;
    }
    
    // Update mobile button
    const mobileText = document.getElementById('mobile-language-text');
    if (mobileText) {
      mobileText.textContent = languageText;
    }
  }

  translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);
      if (translation) {
        element.textContent = translation;
      }
    });

    this.translateSpecificElements();
  }

  translateSpecificElements() {
    const translations = this.translations[this.currentLanguage];
    
    // Home sectionn
    this.translateHomeSection(translations);
    
    // Discord section
    this.translateDiscordSection(translations);
    
    // Highlighted section
    this.translateHighlightedSection(translations);
    
    // About section
    this.translateAboutSection(translations);
    
    // Services section
    this.translateServicesSection(translations);
    
    // Projects section
    this.translateProjectsSection(translations);
    
    // Blog section
    this.translateBlogSection(translations);
    
    // Contact section
    this.translateContactSection(translations);
    
    // Footer
    this.translateFooter(translations);
    
    // Loading screen
    this.translateLoadingScreen(translations);
  }

  translateHomeSection(translations) {
    const greetingElement = document.querySelector('.gradient-heading .word-animate:first-child');
    if (greetingElement) {
      greetingElement.textContent = translations.home.greeting;
    }
    
    const nameElement = document.querySelector('.immortal-text');
    if (nameElement) {
      nameElement.textContent = translations.home.name;
    }
    
    const subtitleElement = document.querySelector('.subtitle-text');
    if (subtitleElement) {
      subtitleElement.textContent = translations.home.subtitle;
    }
    
    const roleElement = document.querySelector('.animated-role');
    if (roleElement) {
      roleElement.textContent = translations.home.role;
    }
    
    const taglineElement = document.querySelector('.tagline');
    if (taglineElement) {
      const heHimSpan = taglineElement.querySelector('.tagline-highlight:first-child');
      const heHimText = heHimSpan ? heHimSpan.textContent : 'He/Him';
      
      if (this.currentLanguage === 'ar') {
        taglineElement.innerHTML = `<span class="tagline-highlight">${heHimText}</span> | ${translations.home.tagline}`;
      } else {
        taglineElement.innerHTML = `<span class="tagline-highlight">${heHimText}</span> | Creative developer building <span class="tagline-highlight">digital experiences</span> that inspire and <span class="tagline-highlight">transform ideas</span> into reality`;
      }
    }
    
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 2) {
      statLabels[0].textContent = translations.home.yearsExperience;
      statLabels[1].textContent = translations.home.projectsCompleted;
    }

    const exploreBtn = document.querySelector('.projects-cta .btn-text');
    if (exploreBtn) {
      exploreBtn.textContent = translations.home.exploreWork;
    }
    
    const hireMeBtn = document.querySelector('.commission-cta .btn-text');
    if (hireMeBtn) {
      hireMeBtn.textContent = translations.home.hireMe;
    }
    
    const siteViewsElement = document.querySelector('.counter-content h4');
    if (siteViewsElement) {
      siteViewsElement.textContent = translations.home.siteViews;
    }
  }

  translateDiscordSection(translations) {
    const discordTitle = document.querySelector('.discord-gradient-heading');
    if (discordTitle) {
      discordTitle.innerHTML = `${translations.discord.activity} <span></span>`;
    }
    
    const discordSubtitle = document.querySelector('.discord-section-subtitle');
    if (discordSubtitle) {
      discordSubtitle.innerHTML = translations.discord.status;
    }
    
    const spotifyTitle = document.querySelector('.activity-title');
    if (spotifyTitle && spotifyTitle.textContent.includes('Spotify')) {
      spotifyTitle.textContent = translations.discord.listeningSpotify;
    }
    
    const notPlaying = document.getElementById('trackName');
    if (notPlaying && notPlaying.textContent === 'Not Playing') {
      notPlaying.textContent = translations.discord.notPlaying;
    }
  }

  translateHighlightedSection(translations) {
    const highlightedTitle = document.querySelector('.highlighted .heading');
    if (highlightedTitle) {
      highlightedTitle.textContent = translations.highlighted.title;
    }
    
    const watchNowBtn = document.querySelector('.watch-now-btn .btn-text');
    if (watchNowBtn) {
      watchNowBtn.textContent = translations.highlighted.watchNow;
    }
  }

  translateAboutSection(translations) {
    const aboutTitle = document.querySelector('.about h2');
    if (aboutTitle) {
      aboutTitle.innerHTML = `${translations.about.title} <span>${translations.about.titleSpan}</span>`;
    }
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length >= 2) {
      tabButtons[0].textContent = translations.about.profile;
      tabButtons[1].textContent = translations.about.experience;
    }
    
    const experienceBadgeText = document.querySelector('.experience-badge .text');
    if (experienceBadgeText) {
      experienceBadgeText.innerHTML = translations.about.yearsCoding.replace(' ', '<br />');
    }
    
    const aboutDescription = document.querySelector('.about-text p');
    if (aboutDescription) {
      aboutDescription.innerHTML = translations.about.description;
    }
    
    const infoItems = document.querySelectorAll('.info-item .label');
    infoItems.forEach(item => {
      const label = item.textContent.replace(':', '');
      if (translations.about[label.toLowerCase()]) {
        item.textContent = translations.about[label.toLowerCase()] + ':';
      }
    });
    
    const availableSpan = document.querySelector('.available');
    if (availableSpan) {
      availableSpan.textContent = translations.about.available;
    }
    
    const coreCompetencies = document.querySelector('.skill-section h3');
    if (coreCompetencies) {
      coreCompetencies.textContent = translations.about.coreCompetencies;
    }
    
    const technologiesTitle = document.querySelector('.tech-stack h3');
    if (technologiesTitle) {
      technologiesTitle.textContent = translations.about.technologies;
    }
    
    const getInTouchBtn = document.querySelector('.cta-buttons .btn');
    if (getInTouchBtn) {
      getInTouchBtn.textContent = translations.about.getInTouch;
    }
    
    this.translateExperienceTab(translations);
  }

  translateExperienceTab(translations) {
    const experienceItems = document.querySelectorAll('.timeline-content');
    experienceItems.forEach((item, index) => {
      const title = item.querySelector('h4');
      const description = item.querySelector('p');
      
      if (title && description) {
        switch(index) {
          case 0:
            title.textContent = translations.about.freelanceExp;
            description.textContent = translations.about.freelanceDesc;
            break;
          case 1:
            title.textContent = translations.about.botDev;
            description.textContent = translations.about.botDesc;
            break;
          case 2:
            title.textContent = translations.about.fnfModder;
            description.textContent = translations.about.fnfDesc;
            break;
        }
      }
    });
  }

  translateServicesSection(translations) {
    const servicesTitle = document.querySelector('.services .gradient-heading');
    if (servicesTitle) {
      servicesTitle.innerHTML = `${translations.services.title} <span>${translations.services.titleSpan}</span>`;
    }
    
    const servicesSubtitle = document.querySelector('.services .section-subtitle');
    if (servicesSubtitle) {
      servicesSubtitle.innerHTML = translations.services.subtitle;
    }
    
    const serviceBoxes = document.querySelectorAll('.service-box');
    serviceBoxes.forEach((box, index) => {
      const title = box.querySelector('h4');
      const description = box.querySelector('p');
      
      if (title && description) {
        switch(index) {
          case 0:
            title.textContent = translations.services.coding.title;
            description.textContent = translations.services.coding.desc;
            break;
          case 1:
            title.textContent = translations.services.gaming.title;
            description.textContent = translations.services.gaming.desc;
            break;
          case 2:
            title.textContent = translations.services.communication.title;
            description.textContent = translations.services.communication.desc;
            break;
        }
      }
    });
  }

  translateProjectsSection(translations) {
    const projectsTitle = document.querySelector('.projects .gradient-heading');
    if (projectsTitle) {
      projectsTitle.innerHTML = `${translations.projects.title} <span>${translations.projects.titleSpan}</span>`;
    }
    
    const projectsSubtitle = document.querySelector('.projects .section-subtitle');
    if (projectsSubtitle) {
      projectsSubtitle.innerHTML = translations.projects.subtitle;
    }
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((btn, index) => {
      const filter = btn.getAttribute('data-filter');
      switch(filter) {
        case 'all':
          btn.textContent = translations.projects.allProjects;
          break;
        case 'app':
          btn.textContent = translations.projects.apps;
          break;
        case 'game':
          btn.textContent = translations.projects.games;
          break;
        case 'web':
          btn.textContent = translations.projects.web;
          break;
      }
    });
  }

  translateBlogSection(translations) {
    const blogTitle = document.querySelector('.blog-gradient-heading');
    if (blogTitle) {
      blogTitle.innerHTML = `${translations.blog.title} <span>${translations.blog.titleSpan}</span>`;
    }
    
    const blogSubtitle = document.querySelector('.blog-section-subtitle');
    if (blogSubtitle) {
      blogSubtitle.innerHTML = translations.blog.subtitle;
    }
    
    const blogFilterButtons = document.querySelectorAll('.blog-filter-btn');
    blogFilterButtons.forEach(btn => {
      const category = btn.getAttribute('data-category');
      if (translations.blog[category]) {
        btn.textContent = translations.blog[category];
      }
    });
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      const span = loadMoreBtn.querySelector('span');
      if (span) {
        span.textContent = translations.blog.loadMore;
      }
    }
  }

  translateContactSection(translations) {
    const contactTitle = document.querySelector('.contact .enhanced-heading');
    if (contactTitle) {
      contactTitle.innerHTML = `${translations.contact.title} <span class="heading-word highlight-word">${translations.contact.titleSpan}</span>`;
    }
    
    const contactSubtitle = document.querySelector('.contact-subtitle');
    if (contactSubtitle) {
      contactSubtitle.innerHTML = translations.contact.subtitle;
    }
    
    const primaryTitle = document.querySelector('.primary-title');
    if (primaryTitle) {
      primaryTitle.textContent = translations.contact.connectDiscord;
    }
    
    const primarySubtitle = document.querySelector('.primary-subtitle');
    if (primarySubtitle) {
      primarySubtitle.textContent = translations.contact.discordSubtitle;
    }
    
    const discordUsername = document.querySelector('.discord-username');
    if (discordUsername) {
      discordUsername.textContent = translations.contact.username;
    }
    
    const features = document.querySelectorAll('.feature-text');
    if (features.length >= 4) {
      features[0].textContent = translations.contact.quickResponses;
      features[1].textContent = translations.contact.realTime;
      features[2].textContent = translations.contact.allDevices;
      features[3].textContent = translations.contact.directCollaboration;
    }
    
    const discordBtn = document.querySelector('.discord-btn span');
    if (discordBtn) {
      discordBtn.textContent = translations.contact.messageDiscord;
    }
    
    const whyDiscordTitle = document.querySelector('.enhanced-card-title');
    if (whyDiscordTitle) {
      whyDiscordTitle.textContent = translations.contact.whyDiscord;
    }
    
    const cardFeatures = document.querySelectorAll('.card-feature .feature-text');
    if (cardFeatures.length >= 4) {
      cardFeatures[0].textContent = translations.contact.instantNotifications;
      cardFeatures[1].textContent = translations.contact.easyFileSharing;
      cardFeatures[2].textContent = translations.contact.voiceVideoCalls;
      cardFeatures[3].textContent = translations.contact.securePlatform;
    }
    
    const altPlatformsTitle = document.querySelectorAll('.enhanced-card-title')[1];
    if (altPlatformsTitle) {
      altPlatformsTitle.textContent = translations.contact.alternativePlatforms;
    }
  
    const emailText = document.querySelector('.email-text');
    if (emailText) {
      emailText.textContent = translations.contact.formalInquiries;
    }
    
    const noticeText = document.querySelector('.notice-text');
    if (noticeText) {
      noticeText.innerHTML = `<strong>${translations.contact.responseTime}</strong> ${translations.contact.usuallyWithin} <span class="time-highlight">${translations.contact.hours}</span> ${translations.contact.fasterThanEmail}`;
    }
    
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 2) {
      statLabels[0].textContent = translations.contact.avgResponse;
      statLabels[1].textContent = translations.contact.satisfactionRate;
    }

    const successModal = document.getElementById('contactSuccessModal');
    if (successModal) {
      const successTitle = successModal.querySelector('h3');
      const successMessage = successModal.querySelector('p');
      const closeBtn = successModal.querySelector('.close-success-modal');
      
      if (successTitle) successTitle.textContent = translations.contact.messageSent;
      if (successMessage) successMessage.textContent = translations.contact.willGetBack;
      if (closeBtn) closeBtn.textContent = translations.contact.close;
    }
  }

  translateFooter(translations) {
    const copyright = document.querySelector('.copyright');
    if (copyright) {
      copyright.textContent = translations.footer.copyright;
    }
  }

  translateLoadingScreen(translations) {
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
      welcomeText.textContent = translations.home.welcome;
    }
    
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.textContent = translations.home.initializing;
    }
    
    const loadingTip = document.querySelector('.loading-tip');
    if (loadingTip) {
      loadingTip.textContent = translations.home.tip;
    }
  }

  getTranslation(key) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return null;
      }
    }
    
    return translation;
  }

  loadArabicFonts() {
    if (document.getElementById('arabic-fonts')) return;
    
    const link = document.createElement('link');
    link.id = 'arabic-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  isRTL() {
    return this.currentLanguage === 'ar';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.translationSystem = new TranslationSystem();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranslationSystem;
}