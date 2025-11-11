const audioConfig = {
    source: 'music.mp3', 
    volume: 0.050, 
    loop: true, 
    autoplay: true, 
    audioElementId: 'background-music-player',
    controls: false,
};

function initBackgroundMusic() {
    const audio = document.createElement('audio');
    audio.id = audioConfig.audioElementId;
    audio.loop = audioConfig.loop;
    audio.autoplay = audioConfig.autoplay; 

    const source = document.createElement('source');
    source.src = audioConfig.source;
    source.type = 'audio/mpeg';
    audio.appendChild(source);

    document.body.appendChild(audio);

    audio.volume = audioConfig.volume;

    if (audioConfig.autoplay) {
        const playAttempt = audio.play();

        if (playAttempt !== undefined) {
            playAttempt.catch(error => {
                // console.log("Autoplay was prevented. Waiting for user interaction to start music.");
                
                document.addEventListener('click', function startMusic() {
                    audio.play().then(() => {
                        // console.log("Background music started successfully on user interaction.");
                    }).catch(err => {
                        console.error("Failed to start music even after user interaction:", err);
                    });
                    document.removeEventListener('click', startMusic);
                }, { once: true });
            });
        }
    }

    if (audioConfig.controls) {
        audio.controls = true;
    }

    window.backgroundAudio = audio;
}

document.addEventListener('DOMContentLoaded', initBackgroundMusic);