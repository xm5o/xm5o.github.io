// Upcoming Things Section JavaScript
class UpcomingThings {
    constructor() {
        this.currentFilter = 'all';
        this.itemsPerLoad = 6;
        this.currentPage = 1;
        this.isLoading = false;
        this.allItems = [];
        this.filteredItems = [];
        this.thumbnailGenerator = new VideoThumbnailGenerator();
        this.videoThumbnails = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateSampleData();
        this.generateVideoThumbnails();
        this.loadItems();
        this.animateOnScroll();
    }

    async generateVideoThumbnails() {
        const videoItems = this.allItems.filter(item => item.type === 'video');
        
        for (const item of videoItems) {
            try {
                // console.log(`Generating thumbnail for: ${item.title}`);
                
                const baseThumbnail = await this.thumbnailGenerator.generateThumbnail(item.media, 2, 300, 150);
                
                const thumbnailWithPlay = await this.thumbnailGenerator.addPlayButtonOverlay(baseThumbnail, 300, 150);
                
                this.videoThumbnails.set(item.id, thumbnailWithPlay);
                // console.log(`Successfully generated thumbnail for: ${item.title}`);
                
            } catch (error) {
                // console.warn(`Failed to generate thumbnail for ${item.title}:`, error);
                
                const fallbackThumbnail = this.createFallbackThumbnail(item.title, 300, 150);
                this.videoThumbnails.set(item.id, fallbackThumbnail);
            }
        }
        
        if (this.videoThumbnails.size > 0) {
            this.renderItems(true);
        }
    }

    createFallbackThumbnail(title, width = 300, height = 150) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2d2d2d');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#666';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎥', width/2, height/2 - 20);

        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText('Video Preview', width/2, height/2 + 20);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.1;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        ctx.beginPath();
        const triangleSize = radius * 0.6;
        ctx.moveTo(centerX - triangleSize * 0.3, centerY - triangleSize * 0.5);
        ctx.lineTo(centerX - triangleSize * 0.3, centerY + triangleSize * 0.5);
        ctx.lineTo(centerX + triangleSize * 0.7, centerY);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();

        return canvas.toDataURL('image/jpeg', 0.8);
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.upcoming-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });

        const loadMoreBtn = document.getElementById('upcomingLoadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreItems();
            });
        }

        this.setupIntersectionObserver();
    }

    generateSampleData() {
        this.allItems = [
            {
                id: 1,
                title: "New video on my channel",
                description: "A new video on my youtube channel coming soon!",
                category: "releases",
                status: "in-progress",
                progress: 55,
                date: "2025-10-20",
                type: "video",
                media: "commission/assets/Ignition.mp4",
                featured: false
            },
            {
                id: 2,
                title: "Immortal Fanchart Collection",
                description: "A Fanchart collection",
                category: "projects",
                status: "coming-soon",
                progress: 100,
                date: "2026-01-01",
                type: "image",
                media: "assets/immortal_collection.png",
                featured: true
            },
        ];
    }

    handleFilterChange(filter) {
        if (this.isLoading) return;
        
        document.querySelectorAll('.upcoming-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.currentFilter = filter;
        this.currentPage = 1;
        this.filterItems();
        this.renderItems(true);
    }

    filterItems() {
        if (this.currentFilter === 'all') {
            this.filteredItems = [...this.allItems];
        } else {
            this.filteredItems = this.allItems.filter(item => item.category === this.currentFilter);
        }
    }

    loadItems() {
        this.filterItems();
        this.renderItems(true);
    }

    loadMoreItems() {
        if (this.isLoading) return;
        
        this.currentPage++;
        this.renderItems(false);
    }

    renderItems(clearExisting = false) {
        const grid = document.getElementById('upcomingGrid');
        const loadMoreBtn = document.getElementById('upcomingLoadMoreBtn');
        
        if (!grid) return;
        
        if (clearExisting) {
            grid.innerHTML = '';
        }
        
        const startIndex = clearExisting ? 0 : (this.currentPage - 1) * this.itemsPerLoad;
        const endIndex = this.currentPage * this.itemsPerLoad;
        const itemsToShow = this.filteredItems.slice(startIndex, endIndex);
        
        if (itemsToShow.length === 0 && clearExisting) {
            grid.innerHTML = `
                <div class="no-items-message">
                    <i class="bx bx-search"></i>
                    <h3>No items found</h3>
                    <p>Try selecting a different filter or check back later for new updates.</p>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }
        
        itemsToShow.forEach((item, index) => {
            const itemElement = this.createItemElement(item);
            itemElement.style.animationDelay = `${index * 0.1}s`;
            grid.appendChild(itemElement);
        });
        
        if (loadMoreBtn) {
            const hasMoreItems = endIndex < this.filteredItems.length;
            loadMoreBtn.style.display = hasMoreItems ? 'flex' : 'none';
        }
        
        this.animateNewItems();
    }

    createItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'upcoming-item';
        itemDiv.dataset.category = item.category;
        
        const statusClass = item.status.replace('-', '-');
        const formattedDate = this.formatDate(item.date);
        
        let mediaSrc;
        if (item.type === 'video') {
            mediaSrc = this.videoThumbnails.get(item.id) || this.createFallbackThumbnail(item.title, 300, 150);
        } else {
            mediaSrc = item.media;
        }
        
        itemDiv.innerHTML = `
            <div class="upcoming-media">
                <img src="${mediaSrc}" alt="${item.title}" loading="lazy">
                ${item.type === 'video' ? `
                    <div class="upcoming-play-overlay" onclick="upcomingThings.playVideo('${item.id}')">
                        <i class="bx bx-play"></i>
                    </div>
                ` : ''}
                <div class="upcoming-status ${statusClass}">
                    ${item.status.replace('-', ' ')}
                </div>
            </div> 
            <div class="upcoming-content">
                <div class="upcoming-category">${item.category}</div>
                <h3 class="upcoming-title">${item.title}</h3>
                <p class="upcoming-description">${item.description}</p>
                <div class="upcoming-meta">
                    <div class="upcoming-date">
                        <i class="bx bx-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    ${item.status === 'in-progress' ? `
                        <div class="upcoming-progress">
                            <div class="upcoming-progress-bar">
                                <div class="upcoming-progress-fill" style="width: ${item.progress}%"></div>
                            </div>
                            <span class="upcoming-progress-text">${item.progress}%</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        itemDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.upcoming-play-overlay')) {
                this.showItemDetails(item);
            }
        });
        
        return itemDiv;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    playVideo(itemId) {
        const item = this.allItems.find(i => i.id == itemId);
        if (!item) return;
        
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <button class="video-modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="bx bx-x"></i>
                </button>
                <div class="video-container">
                    <video controls autoplay>
                        <source src="${item.media}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="video-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (!document.querySelector('#video-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'video-modal-styles';
            styles.textContent = `
                .video-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                }
                
                .video-modal-content {
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                    background: var(--second-bg-color);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(var(--main-color-rgb), 0.3);
                }
                
                .video-modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .video-modal-close:hover {
                    background: var(--main-color);
                    transform: scale(1.1);
                }
                
                .video-container video {
                    width: 100%;
                    height: auto;
                    max-height: 70vh;
                }
                
                .video-info {
                    padding: 2rem;
                }
                
                .video-info h3 {
                    color: var(--text-color);
                    margin-bottom: 1rem;
                    font-size: 2rem;
                }
                
                .video-info p {
                    color: rgba(var(--text-color-rgb), 0.8);
                    line-height: 1.6;
                }
            `;
            document.head.appendChild(styles);
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showItemDetails(item) {
        let mediaSrc;
        if (item.type === 'video') {
            mediaSrc = this.videoThumbnails.get(item.id) || this.createFallbackThumbnail(item.title, 300, 150);
        } else {
            mediaSrc = item.media;
        }

        const modal = document.createElement('div');
        modal.className = 'item-details-modal';
        modal.innerHTML = `
            <div class="item-details-content">
                <button class="item-details-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="bx bx-x"></i>
                </button>
                <div class="item-details-header">
                    <img src="${mediaSrc}" alt="${item.title}">
                    <div class="item-details-info">
                        <div class="upcoming-category">${item.category}</div>
                        <h2>${item.title}</h2>
                        <div class="upcoming-status ${item.status.replace('-', '-')}">${item.status.replace('-', ' ')}</div>
                    </div>
                </div>
                <div class="item-details-body">
                    <p>${item.description}</p>
                    <div class="item-details-meta">
                        <div class="meta-item">
                            <i class="bx bx-calendar"></i>
                            <span>Expected: ${this.formatDate(item.date)}</span>
                        </div>
                        ${item.status === 'in-progress' ? `
                            <div class="meta-item">
                                <i class="bx bx-trending-up"></i>
                                <span>Progress: ${item.progress}%</span>
                            </div>
                        ` : ''}
                        <div class="meta-item">
                            <i class="bx bx-category"></i>
                            <span>Category: ${item.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (!document.querySelector('#item-details-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'item-details-modal-styles';
            styles.textContent = `
                .item-details-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                    padding: 2rem;
                }
                
                .item-details-content {
                    position: relative;
                    max-width: 600px;
                    width: 100%;
                    background: var(--second-bg-color);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(var(--main-color-rgb), 0.3);
                    animation: slideInUp 0.4s ease;
                }
                
                .item-details-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 40px;
                    height: 40px;
                    background: rgba(0, 0, 0, 0.7);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .item-details-close:hover {
                    background: var(--main-color);
                    transform: scale(1.1);
                }
                
                .item-details-header {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }
                
                .item-details-header img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .item-details-info {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    padding: 2rem;
                    color: white;
                }
                
                .item-details-info h2 {
                    font-size: 2.4rem;
                    margin: 1rem 0;
                }
                
                .item-details-body {
                    padding: 2rem;
                }
                
                .item-details-body p {
                    color: rgba(var(--text-color-rgb), 0.9);
                    line-height: 1.8;
                    font-size: 1.6rem;
                    margin-bottom: 2rem;
                }
                
                .item-details-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: var(--main-color);
                    font-size: 1.4rem;
                }
                
                .meta-item i {
                    font-size: 1.8rem;
                }
            `;
            document.head.appendChild(styles);
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const section = document.querySelector('.upcoming-things');
        if (section) {
            observer.observe(section);
        }
    }

    animateOnScroll() {
        const animateElements = document.querySelectorAll('.upcoming-section-header, .upcoming-filter');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.3 });

        animateElements.forEach(el => observer.observe(el));
    }

    animateNewItems() {
        const newItems = document.querySelectorAll('.upcoming-item:not(.animated)');
        newItems.forEach((item, index) => {
            item.classList.add('animated');
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    addItem(item) {
        this.allItems.unshift(item);
        this.filterItems();
        this.renderItems(true);
    }

    updateProgress(itemId, progress) {
        const item = this.allItems.find(i => i.id === itemId);
        if (item) {
            item.progress = progress;
            this.renderItems(true);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.upcomingThings = new UpcomingThings();
});

// Add CSS for no items message
const noItemsStyles = document.createElement('style');
noItemsStyles.textContent = `
    .no-items-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: rgba(var(--text-color-rgb), 0.6);
    }
    
    .no-items-message i {
        font-size: 4rem;
        margin-bottom: 1rem;
        color: var(--main-color);
    }
    
    .no-items-message h3 {
        font-size: 2.4rem;
        margin-bottom: 1rem;
        color: var(--text-color);
    }
    
    .no-items-message p {
        font-size: 1.6rem;
        line-height: 1.6;
    }
    
    .upcoming-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .upcoming-item.animated {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(noItemsStyles);