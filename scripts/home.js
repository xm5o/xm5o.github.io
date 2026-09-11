function initHome() {
  initTypewriterEffect();

  const profileImg = document.querySelector('.profile-img');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep the desktop tilt effect, but update it at most once per animation frame.
  // The previous version did layout reads + style writes for every mousemove event.
  if (profileImg && finePointer && !reduceMotion) {
    let frame = null;
    let pointerX = 0;
    let pointerY = 0;

    profileImg.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;

      frame = requestAnimationFrame(() => {
        const rect = profileImg.getBoundingClientRect();
        const x = pointerX - rect.left;
        const y = pointerY - rect.top;
        profileImg.style.transform = `perspective(1000px) rotateX(${(y - rect.height / 2) / 8}deg) rotateY(${-(x - rect.width / 2) / 8}deg)`;
        frame = null;
      });
    }, { passive: true });

    profileImg.addEventListener('pointerleave', () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      profileImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }, { passive: true });
  }

  // Social buttons already have CSS hover effects. Avoid creating a new DOM
  // particle on every pointer movement; that caused needless allocations and GC.

  const projectsCta = document.querySelector('.projects-cta');
  const projectsSection = document.querySelector('#projects');
  if (projectsCta && projectsSection) {
    projectsCta.addEventListener('click', (event) => {
      event.preventDefault();
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.home-content > *').forEach(el => observer.observe(el));
  }
}

function initTypewriterEffect() {
  const roles = [
    'Web Developer', 'Frontend Dev', 'Discord Bot Dev', 'Open-Source Contributor'
  ];

  const roleElement = document.querySelector('.animated-role');
  if (!roleElement) return;

  let currentRoleIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let timer = null;

  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(typeRole, delay);
  }

  function typeRole() {
    // Don't keep waking the page while the tab is hidden.
    if (document.hidden) return;

    const currentRole = roles[currentRoleIndex];
    let typeSpeed;

    if (isDeleting) {
      roleElement.textContent = currentRole.substring(0, currentCharIndex - 1);
      currentCharIndex -= 1;
      typeSpeed = 75;
    } else {
      roleElement.textContent = currentRole.substring(0, currentCharIndex + 1);
      currentCharIndex += 1;
      typeSpeed = 150;
    }

    if (!isDeleting && currentCharIndex === currentRole.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      currentRoleIndex = (currentRoleIndex + 1) % roles.length;
      typeSpeed = 500;
    }

    schedule(typeSpeed);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer);
    } else {
      schedule(250);
    }
  });

  schedule(1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHome, { once: true });
} else {
  initHome();
}
