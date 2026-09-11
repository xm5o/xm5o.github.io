class PrivacySafeSiteStats {
  constructor() {
    this.mainContent = document.getElementById('mainContent');
    this.visitorCounter = document.querySelector('.visitor-counter');
    this.init();
  }

  init() {
    // The old implementation collected IP addresses, approximate location,
    // browser/device details and a device fingerprint. The portfolio no longer
    // performs visitor-level tracking.
    if (this.visitorCounter) {
      this.visitorCounter.hidden = true;
      this.visitorCounter.setAttribute('aria-hidden', 'true');
    }

    this.showMainContent();
  }

  showMainContent() {
    if (window.loadingManager) {
      window.loadingManager.hideLoadingScreen();
    }

    if (!this.mainContent) return;

    this.mainContent.style.display = 'block';
    requestAnimationFrame(() => {
      this.mainContent.classList.add('fade-in');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PrivacySafeSiteStats();
});
