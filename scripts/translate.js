// Translation System for Portfolio Website
class TranslationSystem {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {
      en: {
        // Navigation
        nav: {
          home: 'Home',
          about: 'About',
          skills: 'Skills',
          projects: 'Projects',
          blog: 'Blog',
          contact: 'Contact'
        },
        // Home Section
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
          scrollDown: 'Scroll Down'
        },
        // About Section
        about: {
          title: 'About',
          titleSpan: 'Me',
          profile: 'Profile',
          experience: 'Experience',
          education: 'Education',
          yearsCoding: 'Years Coding',
          description: "I'm a normal person who loves to code random things and make websites and love to play games and chill with friends. Always looking to make some new friends and love to chat with everyone (maybe). My Favorite game is Overwatch.",
          downloadCV: 'Download CV',
          contactMe: 'Contact Me'
        },
        // Skills Section
        skills: {
          title: 'My',
          titleSpan: 'Skills',
          subtitle: 'Technologies I work with',
          frontend: 'Frontend',
          backend: 'Backend',
          tools: 'Tools',
          databases: 'Databases'
        },
        // Projects Section
        projects: {
          title: 'Latest',
          titleSpan: 'Projects',
          subtitle: 'Some of my recent work',
          viewProject: 'View Project',
          sourceCode: 'Source Code',
          liveDemo: 'Live Demo'
        },
        // Blog Section
        blog: {
          title: 'Latest',
          titleSpan: 'Posts',
          subtitle: 'Thoughts and insights',
          readMore: 'Read More',
          publishedOn: 'Published on'
        },
        // Contact Section
        contact: {
          title: 'Let\'s',
          titleSpan: 'Talk',
          subtitle: 'Get in touch with me',
          name: 'Your Name',
          email: 'Your Email',
          subject: 'Subject',
          message: 'Your Message',
          sendMessage: 'Send Message',
          phone: 'Phone',
          location: 'Location',
          socialMedia: 'Social Media'
        },
        // Discord Modal
        discord: {
          title: 'Immortal Community',
          description: 'Join our creative developer community where we share knowledge, collaborate on projects, and grow together as developers.',
          members: 'Members',
          online: 'Online',
          joinServer: 'Join Server'
        },
        // General
        general: {
          loading: 'Please wait...',
          close: 'Close'
        }
      },
      ar: {
        // Navigation
        nav: {
          home: 'الرئيسية',
          about: 'نبذة عني',
          skills: 'المهارات',
          projects: 'المشاريع',
          blog: 'التحديثات',
          contact: 'التواصل'
        },
        // Home Section
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
          scrollDown: 'مرر لأسفل'
        },
        // About Section
        about: {
          title: 'نبذة',
          titleSpan: 'عني',
          profile: 'الملف الشخصي',
          experience: 'الخبرة',
          education: 'التعليم',
          yearsCoding: 'سنوات البرمجة',
          description: 'أنا شخص عادي أحب برمجة أشياء عشوائية وصنع مواقع الويب وأحب لعب الألعاب والاسترخاء مع الأصدقاء. أبحث دائماً عن تكوين صداقات جديدة وأحب التحدث مع الجميع (ربما). لعبتي المفضلة هي أوفرواتش.',
          downloadCV: 'تحميل السيرة الذاتية',
          contactMe: 'تواصل معي'
        },
        // Skills Section
        skills: {
          title: 'مهاراتي',
          titleSpan: '',
          subtitle: 'التقنيات التي أعمل بها',
          frontend: 'الواجهة الأمامية',
          backend: 'الواجهة الخلفية',
          tools: 'الأدوات',
          databases: 'قواعد البيانات'
        },
        // Projects Section
        projects: {
          title: 'أحدث',
          titleSpan: 'المشاريع',
          subtitle: 'بعض من أعمالي الحديثة',
          viewProject: 'عرض المشروع',
          sourceCode: 'الكود المصدري',
          liveDemo: 'عرض مباشر'
        },
        // Blog Section
        blog: {
          title: 'أحدث',
          titleSpan: 'المقالات',
          subtitle: 'أفكار ورؤى',
          readMore: 'اقرأ المزيد',
          publishedOn: 'نُشر في'
        },
        // Contact Section
        contact: {
          title: 'دعنا',
          titleSpan: 'نتحدث',
          subtitle: 'تواصل معي',
          name: 'اسمك',
          email: 'بريدك الإلكتروني',
          subject: 'الموضوع',
          message: 'رسالتك',
          sendMessage: 'إرسال الرسالة',
          phone: 'الهاتف',
          location: 'الموقع',
          socialMedia: 'وسائل التواصل الاجتماعي'
        },
        // Discord Modal
        discord: {
          title: 'مجتمع الخالد',
          description: 'انضم إلى مجتمع المطورين المبدعين حيث نتشارك المعرفة ونتعاون في المشاريع وننمو معاً كمطورين.',
          members: 'الأعضاء',
          online: 'متصل',
          joinServer: 'انضم للخادم'
        },
        // General
        general: {
          loading: 'يرجى الانتظار...',
          close: 'إغلاق'
        }
      }
    };
    
    this.init();
  }

  init() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (this.translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }

    // Set initial language
    this.setLanguage(this.currentLanguage);
    
    // Add event listeners
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
    
    // Update HTML direction and lang attributes
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    // Update language toggle buttons
    this.updateLanguageButtons();
    
    // Translate all elements
    this.translatePage();
    
    // Add Arabic fonts if needed
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
    // Translate elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);
      if (translation) {
        element.textContent = translation;
      }
    });

    // Translate specific elements by ID or class
    this.translateSpecificElements();
  }

  translateSpecificElements() {
    const translations = this.translations[this.currentLanguage];
    
    // Home section specific translations
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
      // Keep the He/Him part and translate the rest
      const heHimSpan = taglineElement.querySelector('.tagline-highlight:first-child');
      const heHimText = heHimSpan ? heHimSpan.textContent : 'He/Him';
      
      if (this.currentLanguage === 'ar') {
        taglineElement.innerHTML = `<span class="tagline-highlight">${heHimText}</span> | ${translations.home.tagline}`;
      } else {
        taglineElement.innerHTML = `<span class="tagline-highlight">${heHimText}</span> | Creative developer building <span class="tagline-highlight">digital experiences</span> that inspire and <span class="tagline-highlight">transform ideas</span> into reality`;
      }
    }
    
    // Stats section
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 2) {
      statLabels[0].textContent = translations.home.yearsExperience;
      statLabels[1].textContent = translations.home.projectsCompleted;
    }
    
    // CTA buttons
    const exploreBtn = document.querySelector('.projects-cta .btn-text');
    if (exploreBtn) {
      exploreBtn.textContent = translations.home.exploreWork;
    }
    
    const hireMeBtn = document.querySelector('.commission-cta .btn-text');
    if (hireMeBtn) {
      hireMeBtn.textContent = translations.home.hireMe;
    }
    
    // Visitor counter
    const siteViewsElement = document.querySelector('.counter-content h4');
    if (siteViewsElement) {
      siteViewsElement.textContent = translations.home.siteViews;
    }
    
    // About section
    const aboutTitle = document.querySelector('.about h2');
    if (aboutTitle) {
      aboutTitle.innerHTML = `${translations.about.title} <span>${translations.about.titleSpan}</span>`;
    }
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length >= 2) {
      tabButtons[0].textContent = translations.about.profile;
      tabButtons[1].textContent = translations.about.experience;
    }
    
    // Experience badge
    const experienceBadgeText = document.querySelector('.experience-badge .text');
    if (experienceBadgeText) {
      experienceBadgeText.innerHTML = translations.about.yearsCoding.replace(' ', '<br />');
    }
    
    // About description
    const aboutDescription = document.querySelector('.about-text p');
    if (aboutDescription) {
      aboutDescription.innerHTML = translations.about.description.replace(/\*\*(.*?)\*\*/g, '<span>$1</span>');
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
    // Check if Arabic fonts are already loaded
    if (document.getElementById('arabic-fonts')) return;
    
    // Add Google Fonts for Arabic
    const link = document.createElement('link');
    link.id = 'arabic-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  // Public method to get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // Public method to check if RTL
  isRTL() {
    return this.currentLanguage === 'ar';
  }
}

// Initialize translation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.translationSystem = new TranslationSystem();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranslationSystem;
}

