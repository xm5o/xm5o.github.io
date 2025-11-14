class LoadingScreenManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.welcomeText = document.getElementById('welcome-text');
        this.loadingStatus = document.getElementById('loading-status');
        this.bgLayer = document.querySelector('.bg-layer');
        this.progressBarContainer = document.getElementById('progress-bar-container');
        this.progressBar = document.getElementById('progress-bar');
        this.progressPercentage = document.querySelector('.progress-percentage');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.loadingTips = document.querySelector('.loading-tips');
        this.progress = 0;

        this.tips = [
            "Tip: Use keyboard shortcuts for faster navigation",
            "Fun fact: This site was built with pure HTML, CSS & JavaScript",
            "Did you know? The loading animations are GPU-accelerated",
            "Tip: Check out the projects section for cool demos",
            "Try the music section for ambient background tunes"
        ];

        if (this.loadingScreen) {
            this.setupDynamicBackground();
            this.startTextSequence();
            this.startSimulatedLoading();
            this.rotateTips();
        }
    }

    setupDynamicBackground() {
        if (this.bgLayer) {
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                this.bgLayer.style.setProperty('--cursor-x', `${x}%`);
                this.bgLayer.style.setProperty('--cursor-y', `${y}%`);
            });
        }
        
        if (window.innerWidth <= 768) {
            const isLowPowerDevice = navigator.hardwareConcurrency <= 2 || 
                                   navigator.deviceMemory <= 2 ||
                                   navigator.connection?.effectiveType === 'slow-2g' ||
                                   navigator.connection?.effectiveType === '2g';
            
            if (isLowPowerDevice) {
                document.body.classList.add('reduced-motion');
            }
        }
    }

    startTextSequence() {
        if (!this.welcomeText || !this.loadingStatus) return;

        setTimeout(() => {
            this.welcomeText.classList.add('show');
        }, 500);

        setTimeout(() => {
            // this.welcomeText.classList.add('move-up');
            
            if (this.loadingStatus) {
                this.loadingStatus.classList.add('show');
            }
            
            if (this.loadingSpinner) {
                this.loadingSpinner.classList.add('show');
            }
            
            if (this.progressBarContainer) {
                this.progressBarContainer.classList.add('show');
            }
            
            if (this.progressPercentage) {
                this.progressPercentage.classList.add('show');
            }
            
            if (this.loadingTips) {
                this.loadingTips.classList.add('show');
            }
        }, 1200);
    }

    updateProgress(percentage) {
        this.progress = Math.min(100, Math.max(0, percentage));
        
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
        
        if (this.progressPercentage) {
            this.progressPercentage.textContent = `${Math.floor(this.progress)}%`;
        }
    }

    startSimulatedLoading() {
        const stages = [
            { progress: 10, message: "Initializing core systems...", duration: 300 },
            { progress: 25, message: "Loading resources...", duration: 400 },
            { progress: 40, message: "Establishing connection...", duration: 350 },
            { progress: 55, message: "Fetching data...", duration: 300 },
            { progress: 70, message: "Preparing interface...", duration: 400 },
            { progress: 85, message: "Finalizing setup...", duration: 350 },
            { progress: 95, message: "Almost ready...", duration: 300 },
            { progress: 100, message: "Launch sequence initiated!", duration: 500 }
        ];

        let currentStage = 0;

        const loadNextStage = () => {
            if (currentStage >= stages.length) {
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
                return;
            }

            const stage = stages[currentStage];
            
            this.animateProgressTo(stage.progress);
            
            if (this.loadingStatus) {
                this.loadingStatus.textContent = stage.message;
            }

            currentStage++;
            setTimeout(loadNextStage, stage.duration);
        };

        setTimeout(() => {
            loadNextStage();
        }, 1500);
    }

    animateProgressTo(targetProgress) {
        const startProgress = this.progress;
        const diff = targetProgress - startProgress;
        const duration = 300;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuad = progress * (2 - progress);
            const currentProgress = startProgress + (diff * easeOutQuad);
            
            this.updateProgress(currentProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    rotateTips() {
        if (!this.loadingTips) return;
        
        const tipElement = this.loadingTips.querySelector('.loading-tip');
        if (!tipElement) return;

        let currentTipIndex = 0;
        
        const updateTip = () => {
            tipElement.style.opacity = '0';
            
            setTimeout(() => {
                currentTipIndex = (currentTipIndex + 1) % this.tips.length;
                tipElement.textContent = this.tips[currentTipIndex];
                tipElement.style.opacity = '1';
            }, 500);
        };

        this.tipInterval = setInterval(updateTip, 4000);
    }

    hideLoadingScreen() {
        if (this.tipInterval) {
            clearInterval(this.tipInterval);
        }

        if (this.loadingScreen) {
            this.loadingScreen.style.transform = 'scale(1.1)';
            this.loadingScreen.style.filter = 'blur(20px)';
            this.loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                this.loadingScreen.remove();
                
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '0';
                    setTimeout(() => {
                        mainContent.style.transition = 'opacity 0.8s ease-out';
                        mainContent.style.opacity = '1';
                    }, 50);
                }
            }, 1000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.loadingManager = new LoadingScreenManager();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            console.warn('Loading screen timeout - removing');
            if (window.loadingManager) {
                window.loadingManager.hideLoadingScreen();
            }
        }
    }, 10000);
});