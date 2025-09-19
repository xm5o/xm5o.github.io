// Enhanced Music Player JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentAudio = null;
    let audioPlayer = null;
    let currentSongIndex = 0;
    let isPlaying = false;
    let playlist = [];
    
    // Initialize audio player
    audioPlayer = document.getElementById('audioPlayer');
    
    // Get player elements
    const playPauseBtn = audioPlayer.querySelector('.play-pause-btn');
    const prevBtn = audioPlayer.querySelector('.prev-btn');
    const nextBtn = audioPlayer.querySelector('.next-btn');
    const closeBtn = audioPlayer.querySelector('.close-audio');
    const progressFill = audioPlayer.querySelector('.audio-progress-fill');
    const progressBar = audioPlayer.querySelector('.audio-progress');
    const progressHandle = audioPlayer.querySelector('.audio-progress-handle');
    const playerImage = audioPlayer.querySelector('.audio-player-image img');
    const playerTitle = audioPlayer.querySelector('.current-song-title');
    const playerArtist = audioPlayer.querySelector('.current-song-artist');
    const currentTimeEl = audioPlayer.querySelector('.current-time');
    const totalTimeEl = audioPlayer.querySelector('.total-time');
    const volumeBtn = audioPlayer.querySelector('.volume-btn');
    const volumeSlider = audioPlayer.querySelector('.volume-slider');
    const visualizerBars = audioPlayer.querySelectorAll('.visualizer-bar');
    
    // Song data with enhanced information
    const songData = {
        // 'apocalypse': {
        //     title: 'Apocalypse',
        //     artist: 'Cigarettes After Sex',
        //     image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
        //     preview: './assets/music/Apocalypse.mp3',
        //     fallback: './assets/music/Apocalypse.ogg',
        //     duration: '3:42'
        // },
        'flash': {
            title: 'flash',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
            preview: './assets/music/flash.mp3',
            fallback: './assets/music/flash.ogg',
            duration: '4:34'
        },
        'sesame-syrup': {
            title: 'Sesame Syrup',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c2ab3553da315057921f_Crush-p-500.jpg',
            preview: './assets/music/SesameSyrup.mp3',
            fallback: './assets/music/SesameSyrup.ogg',
            duration: '4:15'
        },
        'dark-vacay': {
            title: 'Dark Vacay',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/669003328c84d4ebb0e0198a_Xs_3000x%20(2)%20(1)-p-500.jpg',
            preview: './assets/music/DarkVacay.mp3',
            fallback: './assets/music/DarkVacay.ogg',
            duration: '3:28'
        },
        'bubblegum': {
            title: 'Bubblegum',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/656f879c4c22fe49879310b8_Bubblegum.jpg',
            preview: './assets/music/Bubblegum.mp3',
            fallback: './assets/music/Bubblegum.ogg',
            duration: '4:02'
        },
        'heavenly': {
            title: 'Heavenly',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/657046caf7ba342d201c8b82_Cry.jpg',
            preview: './assets/music/Heavenly.mp3',
            fallback: './assets/music/Heavenly.ogg',
            duration: '3:55'
        },
        'k': {
            title: 'K.',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
            preview: './assets/music/K.mp3',
            fallback: './assets/music/k.ogg',
            duration: '4:33'
        },
        'sweet': {
            title: 'Sweet',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
            preview: './assets/music/Sweet.mp3',
            fallback: './assets/music/Sweet.ogg',
            duration: '3:17'
        }
    };
    
    // Create playlist from song data
    playlist = Object.keys(songData);
    
    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Update progress bar and handle position
    function updateProgress() {
        if (currentAudio && currentAudio.duration) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressFill.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
        }
    }
    
    // Update visualizer bars
    function updateVisualizer() {
        if (isPlaying) {
            visualizerBars.forEach((bar, index) => {
                const height = Math.random() * 35 + 8;
                bar.style.height = height + 'px';
            });
        } else {
            visualizerBars.forEach(bar => {
                bar.style.height = '8px';
            });
        }
    }
    
    // Start visualizer animation
    function startVisualizer() {
        setInterval(updateVisualizer, 150);
    }
    
    // Load and play song
    function loadSong(songId, autoPlay = true) {
        const song = songData[songId];
        if (!song) return;
        
        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        // Create new audio
        currentAudio = new Audio();
        currentAudio.volume = volumeSlider.value;
        
        // Update player UI
        playerImage.src = song.image;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;
        totalTimeEl.textContent = song.duration;
        
        // Show player
        audioPlayer.classList.add('active');
        
        // Update current song index
        currentSongIndex = playlist.indexOf(songId);
        
        // Audio event listeners
        currentAudio.addEventListener('loadstart', function() {
            console.log('Loading audio...');
            showLoadingState();
        });
        
        currentAudio.addEventListener('loadeddata', function() {
            console.log('Audio data loaded');
            hideLoadingState();
        });
        
        currentAudio.addEventListener('loadedmetadata', function() {
            totalTimeEl.textContent = formatTime(currentAudio.duration);
        });
        
        currentAudio.addEventListener('canplay', function() {
            console.log('Audio can play');
            if (autoPlay) {
                currentAudio.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="bx bx-pause"></i>';
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    tryFallbackAudio(song);
                });
            }
        });
        
        currentAudio.addEventListener('timeupdate', updateProgress);
        
        currentAudio.addEventListener('ended', function() {
            // Auto play next song
            playNext();
        });
        
        currentAudio.addEventListener('error', function(e) {
            console.error('Audio error:', e);
            tryFallbackAudio(song);
        });
        
        // Set audio source
        currentAudio.src = song.preview;
        currentAudio.load();
    }
    
    // Try fallback audio format
    function tryFallbackAudio(song) {
        if (song.fallback && currentAudio) {
            console.log('Trying fallback audio format...');
            currentAudio.src = song.fallback;
            currentAudio.load();
            currentAudio.play().catch(error => {
                console.error('Fallback audio also failed:', error);
                showAudioError('Unable to load audio file');
            });
        } else {
            showAudioError('Audio file not found');
        }
    }
    
    // Show/hide loading state
    function showLoadingState() {
        playPauseBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
        playPauseBtn.disabled = true;
    }
    
    function hideLoadingState() {
        playPauseBtn.innerHTML = isPlaying ? '<i class="bx bx-pause"></i>' : '<i class="bx bx-play"></i>';
        playPauseBtn.disabled = false;
    }
    
    // Play next song
    function playNext() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(playlist[currentSongIndex]);
    }
    
    // Play previous song
    function playPrevious() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(playlist[currentSongIndex]);
    }
    
    // Play button click handlers for song cards
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const songCard = this.closest('.song-card');
            const songId = songCard.dataset.song;
            
            loadSong(songId);
        });
    });
    
    // Play/Pause button in player
    playPauseBtn.addEventListener('click', function() {
        if (!currentAudio) return;
        
        if (currentAudio.paused) {
            currentAudio.play().then(() => {
                isPlaying = true;
                this.innerHTML = '<i class="bx bx-pause"></i>';
            }).catch(error => {
                console.error('Error playing audio:', error);
                showAudioError('Unable to play audio');
            });
        } else {
            currentAudio.pause();
            isPlaying = false;
            this.innerHTML = '<i class="bx bx-play"></i>';
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        playPrevious();
    });
    
    // Next button
    nextBtn.addEventListener('click', function() {
        playNext();
    });
    
    // Close button
    closeBtn.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        audioPlayer.classList.remove('active');
        isPlaying = false;
        progressFill.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeEl.textContent = '0:00';
    });
    
    // Progress bar click and drag
    let isDragging = false;
    
    progressBar.addEventListener('mousedown', function(e) {
        isDragging = true;
        updateProgressFromEvent(e);
    });
    
    progressBar.addEventListener('touchstart', function(e) {
        isDragging = true;
        updateProgressFromEvent(e.touches[0]);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            updateProgressFromEvent(e);
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
            updateProgressFromEvent(e.touches[0]);
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    function updateProgressFromEvent(e) {
        if (!currentAudio || !currentAudio.duration) return;
        
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        
        currentAudio.currentTime = currentAudio.duration * percentage;
    }
    
    // Volume controls
    volumeSlider.addEventListener('input', function() {
        if (currentAudio) {
            currentAudio.volume = this.value;
        }
        
        // Update volume icon
        const volume = parseFloat(this.value);
        const volumeIcon = volumeBtn.querySelector('i');
        
        if (volume === 0) {
            volumeIcon.className = 'bx bx-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'bx bx-volume-low';
        } else {
            volumeIcon.className = 'bx bx-volume-full';
        }
    });
    
    volumeBtn.addEventListener('click', function() {
        const volumeIcon = this.querySelector('i');
        
        if (currentAudio && currentAudio.volume > 0) {
            currentAudio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = 'bx bx-volume-mute';
        } else if (currentAudio) {
            currentAudio.volume = 0.5;
            volumeSlider.value = 0.5;
            volumeIcon.className = 'bx bx-volume-full';
        }
    });
    
    // Show audio error
    function showAudioError(message = 'Unable to load audio file') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(237, 66, 69, 0.95);
            color: white;
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            z-index: 10000;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
            max-width: 400px;
            margin: 0 2rem;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1.5rem;">🎵</div>
            <h3 style="margin: 0 0 1.5rem 0; color: white; font-size: 2rem;">Audio Error</h3>
            <p style="margin: 0; opacity: 0.9; font-size: 1.6rem; line-height: 1.5;">${message}</p>
            <p style="margin: 1.5rem 0 0 0; font-size: 1.4rem; opacity: 0.7;">
                Please check if the audio files exist in ./assets/music/ directory
            </p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            audioPlayer.classList.remove('active');
        }, 5000);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (!audioPlayer.classList.contains('active')) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                playPauseBtn.click();
                break;
            case 'Escape':
                closeBtn.click();
                break;
            case 'ArrowLeft':
                if (currentAudio) {
                    currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
                }
                break;
            case 'ArrowRight':
                if (currentAudio) {
                    currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                volumeSlider.value = Math.min(1, parseFloat(volumeSlider.value) + 0.1);
                volumeSlider.dispatchEvent(new Event('input'));
                break;
            case 'ArrowDown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, parseFloat(volumeSlider.value) - 0.1);
                volumeSlider.dispatchEvent(new Event('input'));
                break;
            case 'KeyN':
                nextBtn.click();
                break;
            case 'KeyP':
                prevBtn.click();
                break;
        }
    });
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    audioPlayer.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    audioPlayer.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Swipe gestures (minimum 50px movement)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // Swipe right - previous song
                prevBtn.click();
            } else {
                // Swipe left - next song
                nextBtn.click();
            }
        }
    });
    
    // Initialize visualizer
    startVisualizer();
    
    // Add scroll animations for song cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe song cards
    document.querySelectorAll('.song-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.8s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Observe band header
    const bandHeader = document.querySelector('.band-header');
    if (bandHeader) {
        bandHeader.style.opacity = '0';
        bandHeader.style.transform = 'translateY(30px)';
        bandHeader.style.transition = 'all 1s ease';
        observer.observe(bandHeader);
    }
    
    // Add click animation to song cards
    document.querySelectorAll('.song-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-15px) scale(1.03)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // Prevent context menu on audio player (for better mobile experience)
    audioPlayer.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    console.log('Enhanced Music Player initialized successfully!');
});

