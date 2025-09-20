class VideoThumbnailGenerator {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.thumbnailCache = new Map();
    }

    async generateThumbnail(videoSrc, timeOffset = 1, width = 300, height = 150) {
        const cacheKey = `${videoSrc}_${timeOffset}_${width}_${height}`;
        if (this.thumbnailCache.has(cacheKey)) {
            return this.thumbnailCache.get(cacheKey);
        }

        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.preload = 'metadata';

            const cleanup = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('seeked', onSeeked);
                video.removeEventListener('error', onError);
                video.src = '';
                video.remove();
            };

            const onLoadedMetadata = () => {
                try {
                    this.canvas.width = width;
                    this.canvas.height = height;
                    
                    const seekTime = Math.min(timeOffset, Math.max(0, video.duration - 0.5));
                    video.currentTime = seekTime;
                } catch (error) {
                    cleanup();
                    reject(new Error(`Failed to set video time: ${error.message}`));
                }
            };

            const onSeeked = () => {
                try {
                    this.ctx.clearRect(0, 0, width, height);
                    
                    this.ctx.drawImage(video, 0, 0, width, height);
                    
                    const thumbnailDataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
                    
                    this.thumbnailCache.set(cacheKey, thumbnailDataUrl);
                    
                    cleanup();
                    resolve(thumbnailDataUrl);
                } catch (error) {
                    cleanup();
                    reject(new Error(`Failed to generate thumbnail: ${error.message}`));
                }
            };

            const onError = (e) => {
                cleanup();
                reject(new Error(`Failed to load video: ${e.message || 'Unknown error'}`));
            };

            video.addEventListener('loadedmetadata', onLoadedMetadata);
            video.addEventListener('seeked', onSeeked);
            video.addEventListener('error', onError);

            setTimeout(() => {
                cleanup();
                reject(new Error('Video loading timeout'));
            }, 10000);

            video.src = videoSrc;
        });
    }

    async generateMultipleThumbnails(videoSrc, count = 3, width = 300, height = 150) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.preload = 'metadata';

            const cleanup = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                video.src = '';
                video.remove();
            };

            const onLoadedMetadata = async () => {
                try {
                    const duration = video.duration;
                    const interval = duration / (count + 1);
                    const thumbnails = [];

                    for (let i = 1; i <= count; i++) {
                        const timeOffset = interval * i;
                        const thumbnail = await this.generateThumbnail(videoSrc, timeOffset, width, height);
                        thumbnails.push(thumbnail);
                    }
                    
                    cleanup();
                    resolve(thumbnails);
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            };

            const onError = (e) => {
                cleanup();
                reject(new Error(`Failed to load video: ${e.message || 'Unknown error'}`));
            };

            video.addEventListener('loadedmetadata', onLoadedMetadata);
            video.addEventListener('error', onError);

            setTimeout(() => {
                cleanup();
                reject(new Error('Video loading timeout'));
            }, 15000);

            video.src = videoSrc;
        });
    }

    addPlayButtonOverlay(thumbnailDataUrl, width = 300, height = 150) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            const cleanup = () => {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
            };

            const onLoad = () => {
                try {
                    // this.canvas.width = width;
                    // this.canvas.height = height;

                    // this.ctx.drawImage(img, 0, 0, width, height);

                    // this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    // this.ctx.fillRect(0, 0, width, height);

                    // const centerX = width / 2;
                    // const centerY = height / 2;
                    // const radius = Math.min(width, height) * 0.15;

                    // this.ctx.beginPath();
                    // this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    // this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    // this.ctx.fill();

                    // this.ctx.beginPath();
                    // const triangleSize = radius * 0.6;
                    // this.ctx.moveTo(centerX - triangleSize * 0.3, centerY - triangleSize * 0.5);
                    // this.ctx.lineTo(centerX - triangleSize * 0.3, centerY + triangleSize * 0.5);
                    // this.ctx.lineTo(centerX + triangleSize * 0.7, centerY);
                    // this.ctx.closePath();
                    // this.ctx.fillStyle = '#333';
                    // this.ctx.fill();

                    cleanup();
                    resolve(this.canvas.toDataURL('image/jpeg', 1));
                } catch (error) {
                    cleanup();
                    reject(new Error(`Failed to add play button overlay: ${error.message}`));
                }
            };

            const onError = () => {
                cleanup();
                reject(new Error('Failed to load thumbnail image'));
            };

            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);

            setTimeout(() => {
                cleanup();
                reject(new Error('Image loading timeout'));
            }, 5000);

            img.src = thumbnailDataUrl;
        });
    }

    clearCache() {
        this.thumbnailCache.clear();
    }

    getCacheSize() {
        return this.thumbnailCache.size;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoThumbnailGenerator;
} else {
    window.VideoThumbnailGenerator = VideoThumbnailGenerator;
}