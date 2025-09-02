const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.onscroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    scrollProgress.style.transform = `scaleX(${progress}%)`;

    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
        const top = window.scrollY;
        const offset = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        
        if(top >= offset && top < offset + height) {
            document.querySelector('.navbar a[href*=' + id + ']').classList.add('active');
        } else {
            document.querySelector('.navbar a[href*=' + id + ']').classList.remove('active');
        }
    });
}

const themeToggle = document.createElement('div');
themeToggle.className = 'theme-toggle';
themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
document.body.appendChild(themeToggle);

themeToggle.onclick = () => {
    document.body.setAttribute('data-theme',
        document.body.getAttribute('data-theme') === 'midnight' ? 'dark' : 'midnight'
    );
    themeToggle.innerHTML = document.body.getAttribute('data-theme') === 'midnight' 
        ? '<i class="bx bx-moon"></i>' 
        : '<i class="bx bx-sun"></i>';
}

const skillBars = document.querySelectorAll('.skill-progress');
const animateSkills = () => {
    skillBars.forEach(bar => {
        const value = bar.getAttribute('data-value');
        bar.style.width = value + '%';
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            if (entry.target.classList.contains('skills-section')) {
                animateSkills();
            }
        }
    });
});

document.querySelectorAll('.service-box, .skill-bar, .about-content').forEach(el => observer.observe(el));

const contactForm = document.querySelector('.contact form');
contactForm.onsubmit = (e) => {
    e.preventDefault();

    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Message sent successfully!';
    contactForm.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
    contactForm.reset();
}

const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
          if (filterValue === 'all' || card.classList.contains(filterValue)) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 0);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      });
    });