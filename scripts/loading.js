class LoadingScreenManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.welcomeText = document.getElementById('welcome-text');
        this.loadingStatus = document.getElementById('loading-status');
        this.bgLayer = document.querySelector('.bg-layer');
        this.progressBarContainer = document.getElementById('progress-bar-container');
        this.progressBar = document.getElementById('progress-bar');
        this.progress = 0;

        if (this.loadingScreen) {
            this.setupDynamicBackground();
            this.startTextSequence();
            this.startSimulatedLoading();
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
        if (!this.welcomeText || !this.loadingStatus || !this.progressBarContainer) return;

        // Show "Welcome" text
        setTimeout(() => {
            this.welcomeText.classList.add('show');
        }, 100);

        // After 1 second, move "Welcome" up, show "Please wait...", and show progress bar
        setTimeout(() => {
            this.welcomeText.classList.add('move-up');
            this.loadingStatus.classList.add('show');
            this.progressBarContainer.classList.add('show');
        }, 1000);
    }

    updateProgress(percentage) {
        this.progress = Math.min(100, Math.max(0, percentage));
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
    }

    startSimulatedLoading() {
        const totalSteps = 10;
        let currentStep = 0;
        const intervalTime = 200; // Time between steps in ms

        const loadingInterval = setInterval(() => {
            currentStep++;
            const newProgress = Math.floor((currentStep / totalSteps) * 90); // Stop at 90%
            this.updateProgress(newProgress);

            if (currentStep >= totalSteps) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.updateProgress(100);
                    this.hideLoadingScreen();
                }, 500);
            }
        }, intervalTime);

        const statusMessages = [
            "Initializing core systems...",
            "Connecting to server...",
            "Almost there..."
        ];
        let messageIndex = 0;
        const statusInterval = setInterval(() => {
            if (messageIndex < statusMessages.length) {
                this.loadingStatus.textContent = statusMessages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(statusInterval);
            }
        }, 1000);
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                this.loadingScreen.remove();
            }, 1000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.loadingManager = new LoadingScreenManager();
});
