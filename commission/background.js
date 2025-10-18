class DynamicBackground {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.scrollY = 0;
        this.time = 0;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
        this.createGrid();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 20000);

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                radius: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.4 + 0.1,
                color: this.getRandomColor(),
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    createGrid() {
        this.gridSize = 80;
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(200, 200, 255, ',
            'rgba(255, 200, 200, ',
            'rgba(200, 255, 200, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        // Add touch support for mobile devices
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouseX = e.touches[0].clientX;
                this.targetMouseY = e.touches[0].clientY;
            }
        });
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        this.ctx.lineWidth = 0.5;

        // Animate grid movement
        this.gridOffsetX = (this.gridOffsetX + 0.05) % this.gridSize;
        this.gridOffsetY = (this.gridOffsetY + 0.03) % this.gridSize;

        // Draw vertical lines
        for (let x = this.gridOffsetX; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = this.gridOffsetY; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    animate() {
        // Update time
        this.time += 0.01;

        // Smooth mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Clear canvas with subtle fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                particle.vx -= (dx / distance) * force * 0.15;
                particle.vy -= (dy / distance) * force * 0.15;
            }

            // Scroll effect
            particle.vy += 0.0005 * Math.sin(this.scrollY * 0.005);

            // Time-based pulsing
            particle.pulse += 0.05;
            const pulseEffect = Math.sin(particle.pulse) * 0.2 + 0.8;

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary check with wrapping
            if (particle.x < -particle.radius) particle.x = this.canvas.width + particle.radius;
            if (particle.x > this.canvas.width + particle.radius) particle.x = -particle.radius;
            if (particle.y < -particle.radius) particle.y = this.canvas.height + particle.radius;
            if (particle.y > this.canvas.height + particle.radius) particle.y = -particle.radius;

            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Draw particle with pulsing effect
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * pulseEffect, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + (particle.opacity * pulseEffect) + ')';
            this.ctx.fill();

            // Draw connections between nearby particles
            this.particles.slice(index + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const opacity = 0.1 * (1 - distance / 100);
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = particle.color + opacity + ')';
                    this.ctx.lineWidth = 0.3;
                    this.ctx.stroke();
                }
            });
        });

        // Draw subtle gradient overlays
        this.drawGradientOverlays();

        requestAnimationFrame(() => this.animate());
    }

    drawGradientOverlays() {
        // Create subtle gradient overlays for depth
        const gradient1 = this.ctx.createRadialGradient(
            this.canvas.width * 0.7, this.canvas.height * 0.3, 0,
            this.canvas.width * 0.7, this.canvas.height * 0.3, this.canvas.width * 0.8
        );
        gradient1.addColorStop(0, 'rgba(30, 30, 60, 0.1)');
        gradient1.addColorStop(1, 'rgba(30, 30, 60, 0)');

        this.ctx.fillStyle = gradient1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gradient2 = this.ctx.createRadialGradient(
            this.canvas.width * 0.3, this.canvas.height * 0.7, 0,
            this.canvas.width * 0.3, this.canvas.height * 0.7, this.canvas.width * 0.6
        );
        gradient2.addColorStop(0, 'rgba(60, 30, 30, 0.05)');
        gradient2.addColorStop(1, 'rgba(60, 30, 30, 0)');

        this.ctx.fillStyle = gradient2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new DynamicBackground());
} else {
    new DynamicBackground();
}