class SkeletonLoader {
  constructor() {
    this.body = document.body;
    this.minDisplayTime = 500;
    this.revealed = false;
    this.init();
  }

  init() {
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    const heroImageReady = this.waitForImage(document.querySelector('.profile-img'));
    const minTime = this.wait(this.minDisplayTime);

    Promise.all([fontsReady, heroImageReady, minTime]).then(() => this.reveal());

    // Safety net so the page never gets stuck behind the skeleton
    setTimeout(() => this.reveal(), 5000);
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  waitForImage(img) {
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  reveal() {
    if (this.revealed) return;
    this.revealed = true;
    this.body.classList.remove('is-loading');
  }

  // Kept for compatibility — scripts/views.js calls window.loadingManager.hideLoadingScreen()
  // once the visitor tracker finishes.
  hideLoadingScreen() {
    this.reveal();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.loadingManager = new SkeletonLoader();
});
