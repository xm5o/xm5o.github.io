document.addEventListener('DOMContentLoaded', function() {
    let currentAudio = null;
    let audioPlayer = null;
    let fullscreenPlayer = null;
    let currentSongIndex = 0;
    let isPlaying = false;
    let isFullscreen = false;
    let playlist = [];
    
    audioPlayer = document.getElementById('audioPlayer');
    fullscreenPlayer = document.getElementById('fullscreenPlayer');
    
    const playPauseBtn = audioPlayer.querySelector('.play-pause-btn');
    const prevBtn = audioPlayer.querySelector('.prev-btn');
    const nextBtn = audioPlayer.querySelector('.next-btn');
    const closeBtn = audioPlayer.querySelector('.close-audio');
    const fullscreenBtn = audioPlayer.querySelector('.fullscreen-btn');
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
    
    const fullscreenClose = fullscreenPlayer.querySelector('.fullscreen-close');
    const fullscreenMinimize = fullscreenPlayer.querySelector('.fullscreen-minimize');
    const fullscreenImage = fullscreenPlayer.querySelector('.fullscreen-image');
    const fullscreenTitle = fullscreenPlayer.querySelector('.fullscreen-title');
    const fullscreenArtist = fullscreenPlayer.querySelector('.fullscreen-artist');
    const fullscreenPlayPause = fullscreenPlayer.querySelector('.fullscreen-play-pause');
    const fullscreenPrev = fullscreenPlayer.querySelector('.fullscreen-prev');
    const fullscreenNext = fullscreenPlayer.querySelector('.fullscreen-next');
    const fullscreenProgressFill = fullscreenPlayer.querySelector('.fullscreen-progress-fill');
    const fullscreenProgressBar = fullscreenPlayer.querySelector('.fullscreen-progress');
    const fullscreenProgressHandle = fullscreenPlayer.querySelector('.fullscreen-progress-handle');
    const fullscreenCurrentTime = fullscreenPlayer.querySelector('.fullscreen-current-time');
    const fullscreenTotalTime = fullscreenPlayer.querySelector('.fullscreen-total-time');
    const fullscreenVolumeBtn = fullscreenPlayer.querySelector('.fullscreen-volume-btn');
    const fullscreenVolumeSlider = fullscreenPlayer.querySelector('.fullscreen-volume-slider');
    
    const songData = {
        'the-crystal-ship': {
            title: 'The Crystal Ship',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/68f6b976b2860d9b54f3dcd8_CAS%20Anna%20Karenina-p-500.jpg',
            preview: './assets/music/TheCrystalShip.mp3',
            fallback: './assets/music/TheCrystalShip.ogg',
            duration: '3:00'
        },
        'flash': {
            title: 'Flash',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
            preview: './assets/music/Flash.mp3',
            fallback: './assets/music/Flash.ogg',
            duration: '4:34'
        },
        'cry': {
            title: 'Cry',
            artist: 'Cigarettes After Sex',
            image: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/657046caf7ba342d201c8b82_Cry.jpg',
            preview: './assets/music/Cry.mp3',
            fallback: './assets/music/Cry.ogg',
            duration: '3:55'
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
    
    playlist = Object.keys(songData);
    
    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function updateProgress() {
        if (currentAudio && currentAudio.duration) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            
            progressFill.style.width = progress + '%';
            progressHandle.style.left = progress + '%';
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
            
            if (isFullscreen) {
                fullscreenProgressFill.style.width = progress + '%';
                fullscreenProgressHandle.style.left = progress + '%';
                fullscreenCurrentTime.textContent = formatTime(currentAudio.currentTime);
            }
        }
    }
    
    function updateVisualizer() {
        if (isPlaying && visualizerBars.length > 0) {
            visualizerBars.forEach((bar, index) => {
                const height = Math.random() * 35 + 8;
                bar.style.height = height + 'px';
            });
        } else if (visualizerBars.length > 0) {
            visualizerBars.forEach(bar => {
                bar.style.height = '8px';
            });
        }
    }
    
    function startVisualizer() {
        setInterval(updateVisualizer, 150);
    }
    
    function updatePlayerUI(song) {
        playerImage.src = song.image;
        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist;
        totalTimeEl.textContent = song.duration;
        
        if (isFullscreen) {
            fullscreenImage.src = song.image;
            fullscreenTitle.textContent = song.title;
            fullscreenArtist.textContent = song.artist;
            fullscreenTotalTime.textContent = song.duration;
        }
    }
    
    function updatePlayPauseButtons() {
        const icon = isPlaying ? '<i class="bx bx-pause"></i>' : '<i class="bx bx-play"></i>';
        playPauseBtn.innerHTML = icon;
        if (isFullscreen) {
            fullscreenPlayPause.innerHTML = icon;
        }
    }
    
    function loadSong(songId, autoPlay = true) {
        const song = songData[songId];
        if (!song) return;
        
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        currentAudio = new Audio();
        currentAudio.volume = volumeSlider.value;
        
        updatePlayerUI(song);
        
        audioPlayer.classList.add('active');
        
        currentSongIndex = playlist.indexOf(songId);
        
        currentAudio.addEventListener('loadstart', function() {
            console.log('Loading audio...');
            showLoadingState();
        });
        
        currentAudio.addEventListener('loadeddata', function() {
            console.log('Audio data loaded');
            hideLoadingState();
        });
        
        currentAudio.addEventListener('loadedmetadata', function() {
            const duration = formatTime(currentAudio.duration);
            totalTimeEl.textContent = duration;
            if (isFullscreen) {
                fullscreenTotalTime.textContent = duration;
            }
        });
        
        currentAudio.addEventListener('canplay', function() {
            console.log('Audio can play');
            if (autoPlay) {
                currentAudio.play().then(() => {
                    isPlaying = true;
                    updatePlayPauseButtons();
                }).catch(error => {
                    console.error('Error playing audio:', error);
                    tryFallbackAudio(song);
                });
            }
        });
        
        currentAudio.addEventListener('timeupdate', updateProgress);
        
        currentAudio.addEventListener('ended', function() {
            playNext();
        });
        
        currentAudio.addEventListener('error', function(e) {
            console.error('Audio error:', e);
            tryFallbackAudio(song);
        });
        
        currentAudio.src = song.preview;
        currentAudio.load();
    }
    
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
    
    function showLoadingState() {
        playPauseBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
        playPauseBtn.disabled = true;
        if (isFullscreen) {
            fullscreenPlayPause.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
            fullscreenPlayPause.disabled = true;
        }
    }
    
    function hideLoadingState() {
        updatePlayPauseButtons();
        playPauseBtn.disabled = false;
        if (isFullscreen) {
            fullscreenPlayPause.disabled = false;
        }
    }
    
    function playNext() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(playlist[currentSongIndex]);
    }
    
    function playPrevious() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(playlist[currentSongIndex]);
    }
    
    function togglePlayPause() {
        if (!currentAudio) return;
        
        if (currentAudio.paused) {
            currentAudio.play().then(() => {
                isPlaying = true;
                updatePlayPauseButtons();
            }).catch(error => {
                console.error('Error playing audio:', error);
                showAudioError('Unable to play audio');
            });
        } else {
            currentAudio.pause();
            isPlaying = false;
            updatePlayPauseButtons();
        }
    }
    
    function enterFullscreen() {
        if (!currentAudio) return;
        
        isFullscreen = true;
        fullscreenPlayer.classList.add('active');
        
        const currentSong = songData[playlist[currentSongIndex]];
        if (currentSong) {
            updatePlayerUI(currentSong);
        }
        
        fullscreenVolumeSlider.value = volumeSlider.value;
        
        updatePlayPauseButtons();
        
        audioPlayer.style.opacity = '0';
        
        document.body.style.overflow = 'hidden';
    }
    
    function exitFullscreen() {
        isFullscreen = false;
        fullscreenPlayer.classList.remove('active');
        
        audioPlayer.style.opacity = '1';
        
        document.body.style.overflow = '';
    }
    
    function updateProgressFromEvent(e, progressBar, isFullscreenBar = false) {
        if (!currentAudio || !currentAudio.duration) return;
        
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        
        currentAudio.currentTime = currentAudio.duration * percentage;
    }
    
    function updateVolume(value) {
        if (currentAudio) {
            currentAudio.volume = value;
        }
        
        const volume = parseFloat(value);
        const updateVolumeIcon = (btn) => {
            const volumeIcon = btn.querySelector('i');
            if (volume === 0) {
                volumeIcon.className = 'bx bx-volume-mute';
            } else if (volume < 0.5) {
                volumeIcon.className = 'bx bx-volume-low';
            } else {
                volumeIcon.className = 'bx bx-volume-full';
            }
        };
        
        updateVolumeIcon(volumeBtn);
        if (isFullscreen) {
            updateVolumeIcon(fullscreenVolumeBtn);
        }
    }
    
    // Event Listeners
    
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const songCard = this.closest('.song-card');
            const songId = songCard.dataset.song;
            
            loadSong(songId);
        });
    });
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    fullscreenBtn.addEventListener('click', enterFullscreen);
    
    closeBtn.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        audioPlayer.classList.remove('active');
        if (isFullscreen) {
            exitFullscreen();
        }
        isPlaying = false;
        progressFill.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeEl.textContent = '0:00';
    });
    
    fullscreenPlayPause.addEventListener('click', togglePlayPause);
    fullscreenPrev.addEventListener('click', playPrevious);
    fullscreenNext.addEventListener('click', playNext);
    fullscreenClose.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        audioPlayer.classList.remove('active');
        exitFullscreen();
        isPlaying = false;
    });
    fullscreenMinimize.addEventListener('click', exitFullscreen);
    
    let isDragging = false;
    
    progressBar.addEventListener('mousedown', function(e) {
        isDragging = true;
        updateProgressFromEvent(e, progressBar);
    });
    
    progressBar.addEventListener('touchstart', function(e) {
        isDragging = true;
        updateProgressFromEvent(e.touches[0], progressBar);
    });
    
    fullscreenProgressBar.addEventListener('mousedown', function(e) {
        isDragging = true;
        updateProgressFromEvent(e, fullscreenProgressBar, true);
    });
    
    fullscreenProgressBar.addEventListener('touchstart', function(e) {
        isDragging = true;
        updateProgressFromEvent(e.touches[0], fullscreenProgressBar, true);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            if (isFullscreen) {
                updateProgressFromEvent(e, fullscreenProgressBar, true);
            } else {
                updateProgressFromEvent(e, progressBar);
            }
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
            if (isFullscreen) {
                updateProgressFromEvent(e.touches[0], fullscreenProgressBar, true);
            } else {
                updateProgressFromEvent(e.touches[0], progressBar);
            }
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
    
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    volumeSlider.addEventListener('input', function() {
        updateVolume(this.value);
        if (isFullscreen) {
            fullscreenVolumeSlider.value = this.value;
        }
    });
    
    fullscreenVolumeSlider.addEventListener('input', function() {
        updateVolume(this.value);
        volumeSlider.value = this.value;
    });
    
    volumeBtn.addEventListener('click', function() {
        if (currentAudio && currentAudio.volume > 0) {
            currentAudio.volume = 0;
            volumeSlider.value = 0;
            fullscreenVolumeSlider.value = 0;
        } else if (currentAudio) {
            currentAudio.volume = 0.5;
            volumeSlider.value = 0.5;
            fullscreenVolumeSlider.value = 0.5;
        }
        updateVolume(currentAudio ? currentAudio.volume : 0);
    });
    
    fullscreenVolumeBtn.addEventListener('click', function() {
        if (currentAudio && currentAudio.volume > 0) {
            currentAudio.volume = 0;
            volumeSlider.value = 0;
            fullscreenVolumeSlider.value = 0;
        } else if (currentAudio) {
            currentAudio.volume = 0.5;
            volumeSlider.value = 0.5;
            fullscreenVolumeSlider.value = 0.5;
        }
        updateVolume(currentAudio ? currentAudio.volume : 0);
    });
    
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
            if (isFullscreen) {
                exitFullscreen();
            }
        }, 5000);
    }

    document.addEventListener('keydown', function(e) {
        if (!audioPlayer.classList.contains('active')) return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'Escape':
                if (isFullscreen) {
                    exitFullscreen();
                } else {
                    closeBtn.click();
                }
                break;
            case 'KeyF':
                if (currentAudio && !isFullscreen) {
                    enterFullscreen();
                }
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
                const newVolumeUp = Math.min(1, parseFloat(volumeSlider.value) + 0.1);
                volumeSlider.value = newVolumeUp;
                fullscreenVolumeSlider.value = newVolumeUp;
                updateVolume(newVolumeUp);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolumeDown = Math.max(0, parseFloat(volumeSlider.value) - 0.1);
                volumeSlider.value = newVolumeDown;
                fullscreenVolumeSlider.value = newVolumeDown;
                updateVolume(newVolumeDown);
                break;
            case 'KeyN':
                playNext();
                break;
            case 'KeyP':
                playPrevious();
                break;
        }
    });
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    if (fullscreenPlayer) {
        fullscreenPlayer.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        fullscreenPlayer.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    playPrevious();
                } else {
                    playNext();
                }
            } else if (deltaY > 100) {
                exitFullscreen();
            }
        });
    }
    
    startVisualizer();
    
    if (window.innerWidth <= 768) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
        
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: false });
    }
    
    console.log('Enhanced Music Player with Fullscreen Support initialized');
});
