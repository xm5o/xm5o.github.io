class BackgroundMusicController {
  constructor() {
    this.audio = null;
    
    this.playlist = [
      {
        name: "Bubblegum",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/656f879c4c22fe49879310b8_Bubblegum.jpg',
        src: 'assets/cas/Bubblegum.mp3'
      },
      {
        name: 'Hentai',
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/657046caf7ba342d201c8b82_Cry.jpg',
        src: 'assets/cas/Hentai.mp3'
      },
      {
        name: "X's",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/669003328c84d4ebb0e0198a_Xs_3000x%20(2)%20(1)-p-500.jpg',
        src: 'assets/cas/x.mp3'
      },
      {
        name: "Cry",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/657046caf7ba342d201c8b82_Cry.jpg',
        src: 'assets/cas/Cry.mp3'
      },
      {
        name: "Dark Vacay",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/669003328c84d4ebb0e0198a_Xs_3000x%20(2)%20(1)-p-500.jpg',
        src: 'assets/cas/DarkVacay.mp3'
      },
      {
        name: "Heavenly",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/657046caf7ba342d201c8b82_Cry.jpg',
        src: 'assets/cas/Heavenly.mp3'
      },
      {
        name: "Apocalypse",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/6582c267729189e29e133756_Cigarettes%2BAfter%2BSex-p-500.jpg',
        src: 'assets/cas/Apocalypse.mp3'
      },
      {
        name: "The Crystal Ship",
        artist: 'Cigarettes After Sex',
        cover: 'https://cdn.prod.website-files.com/64cb5f36172f60e17c655f5f/68f6b976b2860d9b54f3dcd8_CAS%20Anna%20Karenina-p-500.jpg',
        src: 'assets/cas/TheCrystalShip.mp3'
      },
    ];
    
    this.currentTrackIndex = 0;
    
    this.settings = {
      volume: 5,
      autoplay: true,
      loop: false,
      shuffle: false,
      isPlaying: false
    };
    
    this.elements = {};
    
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    this.loadSettings();
    this.createAudioElement();
    this.cacheDOMElements();
    this.attachEventListeners();
    this.loadTrack(this.currentTrackIndex);
    
    this.applySettingsToUI();
    
    if (this.settings.autoplay) {
      this.attemptAutoplay();
    }
  }
  
  applySettingsToUI() {
    this.elements.volumeSlider.value = this.settings.volume;
    this.elements.volumeValue.textContent = `${this.settings.volume}%`;
    this.updateVolumeIcon();
    
    this.elements.loop.setAttribute('data-active', this.settings.loop);
    
    this.elements.shuffle.setAttribute('data-active', this.settings.shuffle);
    
    this.elements.autoplay.setAttribute('data-active', this.settings.autoplay);
    
    console.log('UI updated with saved settings');
  }
  
  createAudioElement() {
    this.audio = new Audio();
    this.audio.volume = this.settings.volume / 100;
    this.audio.loop = this.settings.loop;
    
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.handleTrackEnd());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('play', () => this.onPlay());
    this.audio.addEventListener('pause', () => this.onPause());
  }
  
  cacheDOMElements() {
    this.elements = {
      toggle: document.getElementById('bgMusicToggle'),
      panel: document.getElementById('bgMusicPanel'),
      close: document.getElementById('bgMusicClose'),
      
      cover: document.getElementById('bgMusicCover'),
      trackName: document.getElementById('bgMusicTrackName'),
      artist: document.getElementById('bgMusicArtist'),
      
      progressBar: document.getElementById('bgMusicProgressBar'),
      progressFill: document.getElementById('bgMusicProgressFill'),
      progressHandle: document.getElementById('bgMusicProgressHandle'),
      currentTime: document.getElementById('bgMusicCurrentTime'),
      duration: document.getElementById('bgMusicDuration'),
      
      prev: document.getElementById('bgMusicPrev'),
      playPause: document.getElementById('bgMusicPlayPause'),
      next: document.getElementById('bgMusicNext'),
      
      volumeBtn: document.getElementById('bgMusicVolumeBtn'),
      volumeSlider: document.getElementById('bgMusicVolumeSlider'),
      volumeValue: document.getElementById('bgMusicVolumeValue'),
      
      loop: document.getElementById('bgMusicLoop'),
      shuffle: document.getElementById('bgMusicShuffle'),
      autoplay: document.getElementById('bgMusicAutoplay')
    };
  }
  
  attachEventListeners() {
    this.elements.toggle.addEventListener('click', () => this.togglePanel());
    this.elements.close.addEventListener('click', () => this.closePanel());
    
    this.elements.playPause.addEventListener('click', () => this.togglePlayPause());
    this.elements.prev.addEventListener('click', () => this.previousTrack());
    this.elements.next.addEventListener('click', () => this.nextTrack());
    
    this.elements.progressBar.addEventListener('click', (e) => this.seekTo(e));
    this.elements.progressBar.addEventListener('mousedown', () => this.isDragging = true);
    document.addEventListener('mouseup', () => this.isDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) this.seekTo(e);
    });
    
    this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
    this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    this.elements.loop.addEventListener('click', () => this.toggleLoop());
    this.elements.shuffle.addEventListener('click', () => this.toggleShuffle());
    this.elements.autoplay.addEventListener('click', () => this.toggleAutoplay());
    
    document.addEventListener('click', (e) => {
      if (!this.elements.toggle.contains(e.target) && 
          !this.elements.panel.contains(e.target) &&
          this.elements.panel.classList.contains('active')) {
        this.closePanel();
      }
    });
  }
  
  togglePanel() {
    this.elements.panel.classList.toggle('active');
  }
  
  closePanel() {
    this.elements.panel.classList.remove('active');
  }
  
  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    const track = this.playlist[index];
    this.currentTrackIndex = index;
    
    this.elements.trackName.textContent = track.name;
    this.elements.artist.textContent = track.artist;
    this.elements.cover.src = track.cover;
    
    this.audio.src = track.src;
  }
  
  async attemptAutoplay() {
    try {
      await this.audio.play();
    } catch (error) {
      console.log('Autoplay blocked. User interaction required.');
      const playOnInteraction = () => {
        this.audio.play().catch(err => console.error('Playback failed:', err));
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
      };
      
      document.addEventListener('click', playOnInteraction, { once: true });
      document.addEventListener('keydown', playOnInteraction, { once: true });
    }
  }
  
  togglePlayPause() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }
  
  onPlay() {
    this.settings.isPlaying = true;
    this.elements.playPause.innerHTML = '<i class="bx bx-pause"></i>';
    this.elements.toggle.classList.add('playing');
    this.saveSettings();
  }
  
  onPause() {
    this.settings.isPlaying = false;
    this.elements.playPause.innerHTML = '<i class="bx bx-play"></i>';
    this.elements.toggle.classList.remove('playing');
    this.saveSettings();
  }
  
  previousTrack() {
    let newIndex = this.currentTrackIndex - 1;
    if (newIndex < 0) newIndex = this.playlist.length - 1;
    
    const wasPlaying = !this.audio.paused;
    this.loadTrack(newIndex);
    
    if (wasPlaying) {
      this.audio.play();
    }
  }
  
  nextTrack() {
    let newIndex;
    
    if (this.settings.shuffle) {
      do {
        newIndex = Math.floor(Math.random() * this.playlist.length);
      } while (newIndex === this.currentTrackIndex && this.playlist.length > 1);
    } else {
      newIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    }
    
    const wasPlaying = !this.audio.paused;
    this.loadTrack(newIndex);
    
    if (wasPlaying) {
      this.audio.play();
    }
  }
  
  handleTrackEnd() {
    if (!this.settings.loop) {
      this.nextTrack();
    }
  }
  
  updateProgress() {
    if (!this.audio.duration) return;
    
    const progress = (this.audio.currentTime / this.audio.duration) * 100;
    this.elements.progressFill.style.width = `${progress}%`;
    this.elements.progressHandle.style.left = `${progress}%`;
    
    this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
  }
  
  updateDuration() {
    if (!this.audio.duration) return;
    this.elements.duration.textContent = this.formatTime(this.audio.duration);
  }
  
  seekTo(e) {
    const rect = this.elements.progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * this.audio.duration;
    
    if (!isNaN(time)) {
      this.audio.currentTime = time;
    }
  }
  
  setVolume(value) {
    this.settings.volume = parseInt(value);
    this.audio.volume = this.settings.volume / 100;
    this.elements.volumeValue.textContent = `${this.settings.volume}%`;
    
    this.updateVolumeIcon();
    this.saveSettings();
  }
  
  toggleMute() {
    if (this.audio.volume > 0) {
      this.audio.volume = 0;
      this.elements.volumeSlider.value = 0;
      this.elements.volumeValue.textContent = '0%';
    } else {
      this.audio.volume = this.settings.volume / 100;
      this.elements.volumeSlider.value = this.settings.volume;
      this.elements.volumeValue.textContent = `${this.settings.volume}%`;
    }
    
    this.updateVolumeIcon();
  }
  
  updateVolumeIcon() {
    const volume = this.audio.volume;
    let icon = 'bx-volume-full';
    
    if (volume === 0) {
      icon = 'bx-volume-mute';
    } else if (volume < 0.5) {
      icon = 'bx-volume-low';
    }
    
    this.elements.volumeBtn.innerHTML = `<i class='bx ${icon}'></i>`;
  }
  
  toggleLoop() {
    this.settings.loop = !this.settings.loop;
    this.audio.loop = this.settings.loop;
    this.elements.loop.setAttribute('data-active', this.settings.loop);
    this.saveSettings();
  }
  
  toggleShuffle() {
    this.settings.shuffle = !this.settings.shuffle;
    this.elements.shuffle.setAttribute('data-active', this.settings.shuffle);
    this.saveSettings();
  }
  
  toggleAutoplay() {
    this.settings.autoplay = !this.settings.autoplay;
    this.elements.autoplay.setAttribute('data-active', this.settings.autoplay);
    this.saveSettings();
  }
  
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
  
  saveSettings() {
    try {
      const settingsToSave = {
        volume: this.settings.volume,
        autoplay: this.settings.autoplay,
        loop: this.settings.loop,
        shuffle: this.settings.shuffle,
        currentTrackIndex: this.currentTrackIndex,
        timestamp: Date.now()
      };
      
      window.bgMusicSettings = settingsToSave;
      
      const encoded = btoa(JSON.stringify(settingsToSave));
      document.cookie = `bgMusicSettings=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
      
      console.log('Settings saved:', settingsToSave);
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }
  
  loadSettings() {
    try {
      let saved = null;
      
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'bgMusicSettings') {
          try {
            saved = JSON.parse(atob(value));
            console.log('Settings loaded from cookie:', saved);
          } catch (e) {
            console.warn('Failed to parse cookie:', e);
          }
          break;
        }
      }
      
      if (!saved && window.bgMusicSettings) {
        saved = window.bgMusicSettings;
        console.log('Settings loaded from memory:', saved);
      }
      
      if (saved) {
        this.settings.volume = saved.volume !== undefined ? saved.volume : this.settings.volume;
        this.settings.autoplay = saved.autoplay !== undefined ? saved.autoplay : this.settings.autoplay;
        this.settings.loop = saved.loop !== undefined ? saved.loop : this.settings.loop;
        this.settings.shuffle = saved.shuffle !== undefined ? saved.shuffle : this.settings.shuffle;
        this.currentTrackIndex = saved.currentTrackIndex || 0;
        
        console.log('Applied settings:', this.settings);
      } else {
        console.log('No saved settings found, using defaults:', this.settings);
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }
}

const bgMusicController = new BackgroundMusicController();