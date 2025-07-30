class ParticleCanvas {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];

    this.init();
  }

  init() {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.zIndex = '-1';
    document.body.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));

    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      });
    }

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${window.getComputedStyle(document.documentElement)
        .getPropertyValue('--main-color-rgb')}, 0.2)`;
      this.ctx.fill();

      particle.x += particle.dx;
      particle.y += particle.dy;

      if (particle.x < 0 || particle.x > this.width) particle.dx *= -1;
      if (particle.y < 0 || particle.y > this.height) particle.dy *= -1;
    });

    requestAnimationFrame(this.animate.bind(this));
  }
}

new ParticleCanvas();