class SkeletonLoader {
  constructor() {
    this.body = document.body;
    this.revealed = false;
    this.init();
  }

  init() {
    const heroImageReady = this.waitForImage(document.querySelector('.profile-img'));

    // Reveal as soon as the important hero image is ready, but never make the
    // visitor wait on web fonts or an artificial minimum loading time.
    Promise.race([heroImageReady, this.wait(180)]).then(() => this.reveal());

    // Short safety net for unusual browsers/network failures.
    setTimeout(() => this.reveal(), 800);
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  waitForImage(img) {
    if (!img) return Promise.resolve();
    if (img.complete) return Promise.resolve();

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

  hideLoadingScreen() {
    this.reveal();
  }
}

function initSkeletonLoader() {
  window.loadingManager = new SkeletonLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkeletonLoader, { once: true });
} else {
  initSkeletonLoader();
}
