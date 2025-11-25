document.addEventListener('DOMContentLoaded', () => {
  initTypewriterEffect();

  const profileImg = document.querySelector('.profile-img');
  profileImg.addEventListener('mousemove', (e) => {
    const rect = profileImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    profileImg.style.transform = `
      perspective(1000px)
      rotateX(${(y - rect.height / 2) / 8}deg)
      rotateY(${-(x - rect.width / 2) / 8}deg)
    `;
  });

  profileImg.addEventListener('mouseleave', () => {
    profileImg.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  });

  const socialLinks = document.querySelectorAll('.social-btn');
  socialLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const particles = document.createElement('div');
      particles.className = 'particle';
      particles.style.left = `${e.offsetX}px`;
      particles.style.top = `${e.offsetY}px`;
      link.appendChild(particles);

      setTimeout(() => particles.remove(), 1000);
    });
  });

  document.querySelector('.projects-cta').addEventListener('click', (e) => {
    e.preventDefault();
    const projectsSection = document.querySelector('#projects');
    projectsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.home-content > *').forEach(el => observer.observe(el));
});

function initTypewriterEffect() {
    const roles = [
        "Web Developer", "Frontend Dev", "Discord Bot Designer"
    ];
    
    const roleElement = document.querySelector('.animated-role');
    if (!roleElement) return;
    
    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typeSpeed = 150;
    
    function typeRole() {
        const currentRole = roles[currentRoleIndex];
        
        if (isDeleting) {
            roleElement.textContent = currentRole.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            typeSpeed = 75;
        } else {
            roleElement.textContent = currentRole.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            typeSpeed = 150;
        }
        
        // If word is complete
        if (!isDeleting && currentCharIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentRoleIndex = (currentRoleIndex + 1) % roles.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeRole, typeSpeed);
    }
    
    // Start typewriter effect
    setTimeout(typeRole, 1000);
}