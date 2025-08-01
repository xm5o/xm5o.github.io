document.addEventListener('DOMContentLoaded', function () {
  const skillBars = document.querySelectorAll('.skill-progress');
  const animateSkills = () => {
    skillBars.forEach(bar => {
      const value = bar.getAttribute('data-value');
      bar.style.width = value + '%';
    });
  };

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');

      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId + '-tab').classList.add('active');
    });
  });

  const skillsSection = document.querySelector('.skills-section');
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkills();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(skillsSection);
  }
});