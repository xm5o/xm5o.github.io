// Back to Home Button Functionality
function goBackToHome() {
    const button = document.getElementById('backToHomeBtn');
    
    // Add click animation
    if (button) {
        button.style.transform = 'translateX(-3px) scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    // Check if there's a previous page in history
    if (window.history.length > 1 && document.referrer) {
        // Try to go back to previous page
        try {
            window.history.back();
        } catch (error) {
            // Fallback to index.html if history.back() fails
            window.location.href = './index.html';
        }
    } else {
        // No previous page, navigate to index.html
        window.location.href = './index.html';
    }
}

// Enhanced back button visibility logic
function initializeBackButton() {
    const backButton = document.getElementById('backToHomeBtn');
    if (!backButton) return;
    
    // Show/hide button based on page context
    const currentPath = window.location.pathname;
    const isMainPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
    
    if (isMainPage && window.history.length <= 1) {
        // Hide button on main page with no history
        backButton.style.display = 'none';
    } else {
        // Show button with animation
        backButton.style.display = 'flex';
        setTimeout(() => {
            backButton.style.opacity = '1';
            backButton.style.transform = 'translateX(0)';
        }, 100);
    }
    
    // Add keyboard shortcut (Alt + Left Arrow)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'ArrowLeft') {
            e.preventDefault();
            goBackToHome();
        }
    });
    
    // Add ripple effect on click
    backButton.addEventListener('click', function(e) {
        AnimationUtils.createRipple(this, e);
    });
}

// Initialize back button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBackButton();
});

class AnimationUtils {
    static fadeIn(element, duration = 300, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }

    static slideIn(element, direction = 'left', duration = 400, delay = 0) {
        const transforms = {
            left: 'translateX(-30px)',
            right: 'translateX(30px)',
            up: 'translateY(-30px)',
            down: 'translateY(30px)'
        };

        element.style.opacity = '0';
        element.style.transform = transforms[direction];
        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0, 0)';
        }, delay);
    }

    static staggerAnimation(elements, animationFn, staggerDelay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => animationFn(element), index * staggerDelay);
        });
    }

    static bounceIn(element, scale = 1.1, duration = 600) {
        element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        // element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration / 2);
    }

    static createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms ease-out;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
}

class PerformanceUtils {
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    static debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    static requestIdleCallback(callback) {
        if (window.requestIdleCallback) {
            return window.requestIdleCallback(callback);
        }
        return setTimeout(callback, 1);
    }

    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
}

let controlPanelActive = false;
let visibleSections = {
    showcase: true,
    services: true,
    skills: true,
    pricing: true,
    faq: true,
    contact: true
};
let favorites = [];

function openModal(mediaElement) {
    const modal = document.getElementById('mediaModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = '';
    const clone = mediaElement.cloneNode(true);
    
    if (clone.tagName === 'VIDEO') {
        clone.controls = true;
        clone.autoplay = true;
        clone.loop = false;
        clone.muted = false;
        clone.preload = 'auto';
        clone.style.borderRadius = '12px';
        clone.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.8)';
    }
    
    if (clone.tagName === 'IMG') {
        clone.style.borderRadius = '12px';
        clone.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.8)';
    }
    
    modalContent.appendChild(clone);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleModalEscape);
}

function closeModal() {
    const modal = document.getElementById('mediaModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    document.removeEventListener('keydown', handleModalEscape);
    
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => {
        video.style.transition = 'opacity 0.3s ease';
        video.style.opacity = '0';
        setTimeout(() => {
            video.pause();
            video.currentTime = 0;
        }, 300);
    });
}

function handleModalEscape(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

function openMedia(mediaElement) {
    AnimationUtils.bounceIn(mediaElement, 0.95, 200);
    
    setTimeout(() => {
        if (mediaElement.classList.contains('video-thumbnail')) {
            const video = mediaElement.querySelector('video');
            if (video) openModal(video);
        } else {
            openModal(mediaElement);
        }
    }, 100);
}

function loadFavorites() {
    try {
        const saved = localStorage.getItem('portfolio_favorites');
        if (saved) {
            favorites = JSON.parse(saved);
            setTimeout(() => updateFavoriteButtons(), 500);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = [];
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('portfolio_favorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

function toggleFavorite(itemId, button) {
    const index = favorites.indexOf(itemId);
    
    const rippleEl = document.createElement('div');
    rippleEl.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: favoriteRipple 0.6s ease-out;
        pointer-events: none;
        top: 50%;
        left: 50%;
        margin: -10px 0 0 -10px;
    `;
    button.appendChild(rippleEl);
    setTimeout(() => rippleEl.remove(), 600);
    
    if (index === -1) {
        favorites.push(itemId);
        button.classList.add('active');
        AnimationUtils.bounceIn(button, 1.2, 300);
        showToast('Added to favorites! ❤️', 'success');
    } else {
        favorites.splice(index, 1);
        button.classList.remove('active');
        button.style.animation = 'heartBreak 0.4s ease-out';
        setTimeout(() => button.style.animation = '', 400);
        showToast('Removed from favorites', 'info');
    }
    
    saveFavorites();
    updateFavoritesTab();
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.showcase-item').forEach((item, index) => {
        const itemId = item.getAttribute('data-id');
        const button = item.querySelector('.favorite-btn');
        
        if (itemId && button) {
            setTimeout(() => {
                if (favorites.includes(itemId)) {
                    button.classList.add('active');
                    AnimationUtils.fadeIn(button, 300);
                } else {
                    button.classList.remove('active');
                }
            }, index * 50);
        }
    });
}

function createFavoritesTab() {
    const tabsContainer = document.querySelector('.showcase-tabs');
    if (!tabsContainer) return;
    
    const existingFavTab = tabsContainer.querySelector('[onclick*="favorites"]');
    if (existingFavTab) return;
    
    const favoritesBtn = document.createElement('button');
    favoritesBtn.className = 'tab-btn';
    favoritesBtn.onclick = () => showTab('favorites');
    favoritesBtn.innerHTML = `
        <svg style="width: 12px; height: 12px; margin-right: 4px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        Favorites
    `;
    
    favoritesBtn.style.opacity = '0';
    favoritesBtn.style.transform = 'translateY(-10px)';
    tabsContainer.appendChild(favoritesBtn);
    
    AnimationUtils.fadeIn(favoritesBtn, 400, 200);

    const showcase = document.querySelector('.showcase');
    if (!showcase) return;
    
    const existingFavContent = document.getElementById('favorites');
    if (existingFavContent) return;
    
    const favoritesContent = document.createElement('div');
    favoritesContent.className = 'showcase-content';
    favoritesContent.id = 'favorites';
    showcase.appendChild(favoritesContent);

    updateFavoritesTab();
}

function updateFavoritesTab() {
    const favoritesContainer = document.getElementById('favorites');
    if (!favoritesContainer) {
        console.log('Favorites container not found');
        return;
    }

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="favorites-empty" style="opacity: 0;">
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h3>No favorites yet</h3>
                <p>Click the heart icon on any project to add it to your favorites!</p>
            </div>
        `;
        
        const emptyState = favoritesContainer.querySelector('.favorites-empty');
        AnimationUtils.fadeIn(emptyState, 500);
        return;
    }

    const favoriteItems = [];
    favorites.forEach(itemId => {
        const originalItem = document.querySelector(`[data-id="${itemId}"]`);
        if (originalItem) {
            const clone = originalItem.cloneNode(true);
            favoriteItems.push(clone);
        }
    });

    favoritesContainer.innerHTML = '';
    favoriteItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        favoritesContainer.appendChild(item);
        
        setTimeout(() => {
            AnimationUtils.fadeIn(item, 400, index * 100);
        }, 50);
    });
}

function toggleFAQ(questionElement) {
    const faqItem = questionElement.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            const answer = item.querySelector('.faq-answer');
            answer.style.animation = 'slideUp 0.3s ease-out';
        }
    });
    
    if (!isActive) {
        faqItem.classList.add('active');
        const answer = faqItem.querySelector('.faq-answer');
        answer.style.animation = 'slideDown 0.4s ease-out';
        
        const rippleEl = document.createElement('div');
        rippleEl.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(99, 102, 241, 0.1);
            top: 0;
            left: 0;
            border-radius: inherit;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
        `;
        questionElement.style.position = 'relative';
        questionElement.appendChild(rippleEl);
        setTimeout(() => rippleEl.remove(), 600);
    } else {
        faqItem.classList.remove('active');
        const answer = faqItem.querySelector('.faq-answer');
        answer.style.animation = 'slideUp 0.3s ease-out';
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    const formElement = event.target;
    
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.animation = 'shake 0.5s ease-in-out';
            field.style.borderColor = '#ef4444';
            setTimeout(() => {
                field.style.animation = '';
                field.style.borderColor = '';
            }, 500);
        }
    });
    
    if (!isValid) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.style.transform = 'scale(0.98)';
    submitBtn.innerHTML = `
        <svg class="submit-icon animate-spin" viewBox="0 0 24 24" style="margin-right: 8px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" fill="none"/>
        </svg>
        Sending your message...
    `;
    
    const formData = new FormData(event.target);
    const formDataObj = Object.fromEntries(formData.entries());
    
    const discordMessage = `
**New Project Inquiry ✨**
**Name:** ${formDataObj.name}
**Discord:** ${formDataObj.discord || 'Not provided'}
**Service:** ${formDataObj.service}
**Budget:** ${formDataObj.budget || 'Not specified'}
**Timeline:** ${formDataObj.timeline || 'Not specified'}
**Details:** ${formDataObj.message}

*Message sent from portfolio website*
    `.trim();
    
    setTimeout(() => {
        formElement.style.animation = 'successPulse 0.6s ease-out';
        
        const formFields = formElement.querySelectorAll('input, select, textarea');
        formFields.forEach((field, index) => {
            setTimeout(() => {
                field.style.transition = 'all 0.3s ease';
                field.style.transform = 'scale(0.98)';
                field.value = '';
                setTimeout(() => {
                    field.style.transform = 'scale(1)';
                }, 150);
            }, index * 50);
        });
        
        showToast('✅ Inquiry sent successfully! I\'ll get back to you within 24 hours.', 'success');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(discordMessage).then(() => {
                setTimeout(() => {
                    showToast('📋 Message also copied to clipboard - you can paste it directly in Discord!', 'info');
                }, 1500);
            });
        }
        
        submitBtn.innerHTML = `
            <svg class="submit-icon" viewBox="0 0 24 24" style="margin-right: 8px;">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
            </svg>
            Message Sent!
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        submitBtn.style.transform = 'scale(1)';
        
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            formElement.style.animation = '';
        }, 3000);
        
    }, 2000);
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    
    if (toast.classList.contains('show')) {
        toast.classList.remove('show');
        setTimeout(() => showToastInternal(message, type), 300);
    } else {
        showToastInternal(message, type);
    }
}

function showToastInternal(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    toast.className = 'toast';
    toast.style.background = '';
    toast.style.borderColor = '';
    toast.style.color = '';
    
    const toastStyles = {
        success: {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))',
            borderColor: 'rgba(34, 197, 94, 0.5)',
            color: 'white'
        },
        error: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
            borderColor: 'rgba(239, 68, 68, 0.5)',
            color: 'white'
        },
        info: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            color: 'white'
        },
        default: {
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
        }
    };
    
    const selectedStyle = toastStyles[type] || toastStyles.default;
    Object.assign(toast.style, selectedStyle);
    
    if (type !== 'default') {
        toast.style.boxShadow = `0 10px 30px ${selectedStyle.borderColor}, 0 0 20px ${selectedStyle.borderColor}`;
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.4s ease-out forwards';
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.animation = '';
            toast.style.boxShadow = '';
        }, 400);
    }, 4000);
}

function toggleControlPanel() {
    controlPanelActive = !controlPanelActive;
    const panel = document.getElementById('controlPanel');
    const toggle = document.querySelector('.control-toggle');
    
    if (controlPanelActive) {
        panel.classList.add('active');
        toggle.style.transform = 'scale(1.1) rotate(90deg)';
        
        const items = panel.querySelectorAll('.control-group');
        AnimationUtils.staggerAnimation(items, (item) => {
            AnimationUtils.slideIn(item, 'right', 300);
        }, 100);
    } else {
        panel.classList.remove('active');
        toggle.style.transform = 'scale(1) rotate(0deg)';
    }
}

function setTheme(theme) {
    const root = document.documentElement;
    
    document.querySelectorAll('.control-group:first-child .control-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'scale(1)';
    });
    
    event.target.classList.add('active');
    AnimationUtils.bounceIn(event.target, 1.1, 300);
    
    const themeConfigs = {
        light: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8f9fa',
            '--bg-tertiary': '#e9ecef',
            '--bg-card': 'rgba(255, 255, 255, 0.95)',
            '--text-primary': '#1a1a1a',
            '--text-secondary': '#6b7280',
            '--text-muted': '#9ca3af',
            '--border': 'rgba(0, 0, 0, 0.1)',
            '--shadow-dark': 'rgba(0, 0, 0, 0.1)',
            '--shadow-glow': 'rgba(99, 102, 241, 0.2)'
        },
        blue: {
            '--bg-primary': '#0f172a',
            '--bg-secondary': '#1e293b',
            '--bg-tertiary': '#334155',
            '--bg-card': 'rgba(30, 41, 59, 0.9)',
            '--accent': '#3b82f6',
            '--accent-hover': '#2563eb',
            '--accent-secondary': '#1d4ed8',
            '--shadow-glow': 'rgba(59, 130, 246, 0.2)'
        },
        dark: {
            '--bg-primary': '#050505',
            '--bg-secondary': '#0a0a0a',
            '--bg-tertiary': '#0f0f0f',
            '--bg-card': 'rgba(10, 10, 10, 0.95)',
            '--text-primary': '#ffffff',
            '--text-secondary': '#9ca3af',
            '--text-muted': '#6b7280',
            '--border': 'rgba(255, 255, 255, 0.08)',
            '--accent': '#6366f1',
            '--accent-hover': '#5855eb',
            '--shadow-glow': 'rgba(99, 102, 241, 0.15)'
        }
    };

    const selectedTheme = themeConfigs[theme] || themeConfigs.dark;
    
    document.body.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    Object.entries(selectedTheme).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
    
    showToast(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'info');
    
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

function toggleSection(sectionName) {
    const section = document.getElementById(sectionName + 'Section');
    const button = event.target;
    
    visibleSections[sectionName] = !visibleSections[sectionName];
    
    if (visibleSections[sectionName]) {
        section.classList.remove('hidden');
        section.style.animation = 'fadeInUp 0.6s ease-out';
        button.classList.add('active');
        AnimationUtils.bounceIn(button, 1.1, 200);
    } else {
        section.style.animation = 'fadeOut 0.4s ease-out';
        setTimeout(() => {
            section.classList.add('hidden');
        }, 400);
        button.classList.remove('active');
    }
}

function changeAccentColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--accent', color);
    
    const rgb = parseInt(color.slice(1), 16);
    const r = Math.max(0, (rgb >> 16) - 20);
    const g = Math.max(0, ((rgb >> 8) & 255) - 20);
    const b = Math.max(0, (rgb & 255) - 20);
    const hoverColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    
    root.style.setProperty('--accent-hover', hoverColor);
    
    const glowColor = `${color}40`;
    root.style.setProperty('--shadow-glow', glowColor);
    
    showToast('Accent color updated!', 'success');
}

function showTab(tabName) {
    document.querySelectorAll('.showcase-content.active').forEach(content => {
        content.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            content.classList.remove('active');
        }, 300);
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.animation = 'fadeInUp 0.5s ease-out';
            
            const items = targetContent.querySelectorAll('.showcase-item');
            AnimationUtils.staggerAnimation(items, (item) => {
                item.style.animation = 'itemSlideIn 0.6s ease-out forwards';
            }, 100);
        }
        
        const targetButton = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
            btn.getAttribute('onclick')?.includes(tabName) || 
            btn.textContent.toLowerCase().includes(tabName.toLowerCase())
        );
        
        if (targetButton) {
            targetButton.classList.add('active');
            AnimationUtils.bounceIn(targetButton, 1.05, 200);
        }
        
        if (tabName === 'favorites') {
            updateFavoritesTab();
        }
    }, 300);
}

function copyDiscord() {
    const username = "trr0";
    const btn = event?.target?.closest('.btn');
    
    if (btn) {
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
        
        AnimationUtils.createRipple(btn, event);
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(username).then(() => {
            showToast('🎮 Discord username copied! (trr0)', 'success');
        }).catch(() => {
            fallbackCopy(username);
        });
    } else {
        fallbackCopy(username);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('🎮 Discord username copied! (trr0)', 'success');
}

window.showTab = showTab;
window.handleFormSubmit = handleFormSubmit;
window.copyDiscord = copyDiscord;
window.toggleControlPanel = toggleControlPanel;
window.setTheme = setTheme;
window.toggleSection = toggleSection;
window.changeAccentColor = changeAccentColor;
window.closeModal = closeModal;
window.toggleFAQ = toggleFAQ;
window.toggleFavorite = toggleFavorite;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing enhanced portfolio...');
    
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        @keyframes rippleExpand {
            to { transform: scale(1.5); opacity: 0; }
        }
        @keyframes favoriteRipple {
            to { transform: scale(3); opacity: 0; }
        }
        @keyframes heartBreak {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.8); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        @keyframes successPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        @keyframes slideUp {
            from { max-height: 200px; opacity: 1; }
            to { max-height: 0; opacity: 0; }
        }
        @keyframes slideDown {
            from { max-height: 0; opacity: 0; }
            to { max-height: 200px; opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes toastFadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(20px); }
            to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(animationStyle);
    
    setTimeout(() => loadFavorites(), 100);
    setTimeout(() => createFavoritesTab(), 200);
    
    document.querySelectorAll('.showcase-media img, .showcase-media .video-thumbnail').forEach((media, index) => {
        media.style.opacity = '0';
        media.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            AnimationUtils.fadeIn(media, 400);
        }, index * 100);
        
        media.addEventListener('click', () => openMedia(media));
        
        media.addEventListener('mouseenter', () => {
            media.style.transform = 'scale(1.02)';
            media.style.filter = 'brightness(1.1)';
        });
        
        media.addEventListener('mouseleave', () => {
            media.style.transform = 'scale(1)';
            media.style.filter = 'brightness(1)';
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.target.closest('.favorite-btn');
            const itemId = btn.closest('.showcase-item').getAttribute('data-id');
            if (itemId) {
                toggleFavorite(itemId, btn);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.faq-question')) {
            const question = e.target.closest('.faq-question');
            toggleFAQ(question);
        }
    });

    const mediaModal = document.getElementById('mediaModal');
    if (mediaModal) {
        mediaModal.addEventListener('click', (e) => {
            if (e.target === mediaModal) closeModal();
        });
    }

    document.addEventListener('click', (e) => {
        const panel = document.getElementById('controlPanel');
        const toggle = document.querySelector('.control-toggle');
        
        if (controlPanelActive && panel && toggle && 
            !panel.contains(e.target) && !toggle.contains(e.target)) {
            toggleControlPanel();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'f' && e.ctrlKey) {
            e.preventDefault();
            showTab('favorites');
        }
        if (e.key === '1' && e.ctrlKey) {
            e.preventDefault();
            showTab('coding');
        }
        if (e.key === '2' && e.ctrlKey) {
            e.preventDefault();
            showTab('charts');
        }
        if (e.key === '3' && e.ctrlKey) {
            e.preventDefault();
            showTab('modcharts');
        }
    });

    document.documentElement.style.scrollBehavior = 'smooth';
    
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                scrollObserver.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);
    
    document.querySelectorAll('.section').forEach(section => {
        scrollObserver.observe(section);
    });

    const videos = document.querySelectorAll('video[preload="metadata"]');
    if (videos.length > 0) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.preload = 'auto';
                    
                    video.style.transition = 'opacity 0.3s ease';
                    video.addEventListener('loadeddata', () => {
                        video.style.opacity = '1';
                    });
                    
                    videoObserver.unobserve(video);
                }
            });
        }, { rootMargin: '100px' });

        videos.forEach(video => {
            video.style.opacity = '0.8';
            videoObserver.observe(video);
        });
    }
    
    PerformanceUtils.requestIdleCallback(() => {
        console.log('✨ Portfolio loaded successfully!');
        console.log('📊 Performance:', {
            favorites: favorites.length,
            loadTime: performance.now(),
            memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
        });
    });
    
    setTimeout(() => {
        showToast('👋 Welcome to my portfolio! Click the heart icons to save your favorite projects.', 'info');
    }, 2000);
});

const handleResize = PerformanceUtils.throttle(() => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && controlPanelActive) {
        toggleControlPanel();
    }
    
    if (isMobile) {
        document.documentElement.style.setProperty('--animation-duration', '0.2s');
    } else {
        document.documentElement.style.setProperty('--animation-duration', '0.4s');
    }
}, 250);

window.addEventListener('resize', handleResize);

document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
        e.target.style.animation = 'shake 1s ease-in-out';
        setTimeout(() => {
            e.target.style.animation = '';
        }, 300);
    }
});

if ('serviceWorker' in navigator) {
    PerformanceUtils.requestIdleCallback(() => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
        });
    });
}