/**
 * Commission Ad System - Modern & Customizable
 * Supports multiple ad types with extensive customization options
 */

class CommissionAdManager {
    constructor(options = {}) {
        this.config = {
            // Display settings
            autoShow: true,
            showDelay: 2000,
            showInterval: 30000, // Show every 30 seconds
            maxShowsPerSession: 1,
            respectUserPreference: true,
            
            // Animation settings
            animationDuration: 500,
            backdropBlur: true,
            
            // Behavior settings
            closeOnBackdrop: true,
            closeOnEscape: true,
            pauseOnHover: true,
            
            // Default ad configuration
            defaultAd: {
                type: 'promo',
                title: 'Special Commission Offer!',
                subtitle: 'Limited time only',
                description: 'Get premium quality work at unbeatable prices.',
                icon: '🎨',
                features: [
                    'Professional quality guaranteed',
                    'Fast delivery (1-3 days)',
                    'Unlimited revisions included',
                    '24/7 customer support'
                ],
                pricing: {
                    oldPrice: '$50',
                    newPrice: '$25',
                    discount: '50% OFF'
                },
                buttons: [
                    {
                        text: 'Get Started',
                        type: 'primary',
                        action: 'contact'
                    },
                    {
                        text: 'Learn More',
                        type: 'secondary',
                        action: 'info'
                    }
                ],
                timer: {
                    enabled: false,
                    duration: 24 * 60 * 60, // 24 hours in seconds
                    text: 'Offer expires in:'
                },
                socialProof: {
                    enabled: true,
                    text: '127+ happy customers this month'
                }
            },
            
            // Callbacks
            onShow: null,
            onClose: null,
            onAction: null,
            
            ...options
        };
        
        this.state = {
            isVisible: false,
            currentAd: null,
            showCount: 0,
            timerInterval: null,
            showTimeout: null
        };
        
        this.adTemplates = this.initializeAdTemplates();
        this.init();
    }
    
    init() {
        this.createAdStructure();
        this.bindEvents();
        this.loadUserPreferences();
        
        if (this.config.autoShow) {
            this.scheduleShow();
        }
    }
    
    initializeAdTemplates() {
        return {
            discount: {
                type: 'discount',
                title: '🔥 MASSIVE DISCOUNT!',
                subtitle: 'Limited time flash sale',
                description: 'Save big on all commission services. Don\'t miss out on this incredible opportunity!',
                icon: '💸',
                features: [
                    'Up to 70% off all services',
                    'Premium quality guaranteed',
                    'Express delivery available',
                    'Money-back guarantee'
                ],
                pricing: {
                    oldPrice: '$100',
                    newPrice: '$30',
                    discount: '70% OFF'
                },
                timer: {
                    enabled: true,
                    duration: 6 * 60 * 60, // 6 hours
                    text: 'Sale ends in:'
                }
            },
            
            promo: {
                type: 'promo',
                title: 'Special Promotion',
                subtitle: 'Exclusive offer for you',
                description: 'Take advantage of our premium services at promotional prices.',
                icon: '🎯',
                features: [
                    'Professional artwork',
                    'Quick turnaround time',
                    'Satisfaction guaranteed',
                    'Free consultations'
                ],
                pricing: {
                    oldPrice: '$60',
                    newPrice: '$35',
                    discount: '40% OFF'
                },
                socialProof: {
                    enabled: true,
                    text: '200+ projects completed successfully'
                }
            },
            
            exclusive: {
                type: 'exclusive',
                title: '👑 VIP Exclusive',
                subtitle: 'Members only offer',
                description: 'Unlock premium features and priority support with our exclusive package.',
                icon: '💎',
                features: [
                    'Priority queue processing',
                    'Dedicated project manager',
                    'Premium quality assurance',
                    'Exclusive design options'
                ],
                pricing: {
                    oldPrice: '$150',
                    newPrice: '$89',
                    discount: 'VIP PRICE'
                }
            },
            
            urgent: {
                type: 'urgent',
                title: '⚡ URGENT OFFER!',
                subtitle: 'Act now or miss out',
                description: 'This amazing deal won\'t last long. Secure your spot before it\'s gone!',
                icon: '🚨',
                features: [
                    'Immediate project start',
                    'Express 24h delivery',
                    'No waiting time',
                    'Rush order priority'
                ],
                pricing: {
                    oldPrice: '$80',
                    newPrice: '$45',
                    discount: 'URGENT DEAL'
                },
                timer: {
                    enabled: true,
                    duration: 2 * 60 * 60, // 2 hours
                    text: 'Hurry! Only:'
                }
            },
            
            seasonal: {
                type: 'promo',
                title: '🎄 Holiday Special',
                subtitle: 'Seasonal celebration offer',
                description: 'Celebrate the season with special pricing on all our services.',
                icon: '🎁',
                features: [
                    'Holiday-themed designs',
                    'Gift wrapping included',
                    'Special seasonal pricing',
                    'Extended support hours'
                ],
                pricing: {
                    oldPrice: '$75',
                    newPrice: '$50',
                    discount: 'HOLIDAY DEAL'
                }
            },
            
            bundle: {
                type: 'exclusive',
                title: '📦 Bundle Package',
                subtitle: 'Everything you need',
                description: 'Get the complete package with multiple services at an incredible value.',
                icon: '🎪',
                features: [
                    'Multiple service combo',
                    'Huge savings on bundle',
                    'Extended project scope',
                    'Bonus features included'
                ],
                pricing: {
                    oldPrice: '$200',
                    newPrice: '$99',
                    discount: 'BUNDLE SAVE'
                }
            }
        };
    }
    
    createAdStructure() {
        // Remove existing ad if present
        const existingAd = document.getElementById('commission-ad-overlay');
        if (existingAd) {
            existingAd.remove();
        }
        
        // Create ad overlay
        const overlay = document.createElement('div');
        overlay.id = 'commission-ad-overlay';
        overlay.className = 'ad-overlay';
        
        // Create ad container
        const container = document.createElement('div');
        container.className = 'ad-container';
        container.id = 'commission-ad-container';
        
        // Add container to overlay
        overlay.appendChild(container);
        
        // Add to body
        document.body.appendChild(overlay);
        
        this.elements = {
            overlay,
            container
        };
    }
    
    bindEvents() {
        const { overlay, container } = this.elements;
        
        // Close on backdrop click
        if (this.config.closeOnBackdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide();
                }
            });
        }
        
        // Close on escape key
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.state.isVisible) {
                    this.hide();
                }
            });
        }
        
        // Pause timer on hover
        if (this.config.pauseOnHover) {
            container.addEventListener('mouseenter', () => {
                this.pauseTimer();
            });
            
            container.addEventListener('mouseleave', () => {
                this.resumeTimer();
            });
        }
    }
    
    generateAdHTML(adData) {
        const {
            type = 'promo',
            title,
            subtitle,
            description,
            icon,
            features = [],
            pricing = {},
            buttons = [],
            timer = {},
            socialProof = {}
        } = adData;
        
        return `
            <button class="ad-close" onclick="commissionAd.hide()">&times;</button>
            
            <div class="ad-header">
                <div class="ad-icon">${icon}</div>
                <div class="ad-header-text">
                    <h2>${title}</h2>
                    <p>${subtitle}</p>
                </div>
            </div>
            
            <div class="ad-content">
                <div class="ad-description">${description}</div>
                
                ${pricing.oldPrice && pricing.newPrice ? `
                    <div class="ad-pricing">
                        <span class="ad-old-price">${pricing.oldPrice}</span>
                        <span class="ad-new-price">${pricing.newPrice}</span>
                        ${pricing.discount ? `<span class="ad-discount-badge">${pricing.discount}</span>` : ''}
                    </div>
                ` : ''}
                
                ${features.length > 0 ? `
                    <ul class="ad-features">
                        ${features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${timer.enabled ? `
                    <div class="ad-timer">
                        ${timer.text}<span class="ad-timer-value" id="ad-timer-display">--:--:--</span>
                    </div>
                ` : ''}
                
                ${socialProof.enabled && socialProof.text ? `
                    <div class="ad-social-proof">${socialProof.text}</div>
                ` : ''}
            </div>
            
            ${buttons.length > 0 ? `
                <div class="ad-actions">
                    ${buttons.map((button, index) => `
                        <button class="ad-btn ad-btn-${button.type}" 
                                onclick="commissionAd.handleAction('${button.action}', ${index})">
                            ${button.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
    
    show(adData = null) {
/**
 * Commission Ad System - One-time popup matching portfolio design
 */

class CommissionAdManager {
    constructor(options = {}) {
        this.config = {
            // Display settings - Show only once on load
            autoShow: true,
            showDelay: 3000, // Show after 3 seconds
            showOnce: true, // Only show once per session
            respectUserPreference: true,
            
            // Animation settings
            animationDuration: 500,
            backdropBlur: true,
            
            // Behavior settings
            closeOnBackdrop: true,
            closeOnEscape: true,
            
            // Default ad configuration
            defaultAd: {
                type: 'promo',
                title: 'Special Commission Offer! 🎨',
                subtitle: 'Limited time promotion',
                description: 'Get professional artwork, charts, and modcharts at special rates. Perfect for your FNF projects!',
                icon: '🎯',
                features: [
                    'Professional quality guaranteed',
                    'Fast delivery (1-4 days max)',
                    'Free revisions included',
                    'PayPal secure payment'
                ],
                pricing: {
                    oldPrice: 'Regular Price',
                    newPrice: 'Special Rate',
                    discount: 'LIMITED TIME'
                },
                buttons: [
                    {
                        text: 'Contact on Discord',
                        type: 'primary',
                        action: 'contact'
                    },
                    {
                        text: 'View Pricing',
                        type: 'secondary',
                        action: 'info'
                    }
                ],
                socialProof: {
                    enabled: true,
                    text: '100+ satisfied customers this month'
                }
            },
            
            // Callbacks
            onShow: null,
            onClose: null,
            onAction: null,
            
            ...options
        };
        
        this.state = {
            isVisible: false,
            currentAd: null,
            hasShown: false,
            showTimeout: null
        };
        
        this.adTemplates = this.initializeAdTemplates();
        this.init();
    }
    
    init() {
        // Check if ad has already been shown
        if (this.config.showOnce && this.hasAdBeenShown()) {
            return;
        }
        
        this.createAdStructure();
        this.bindEvents();
        
        if (this.config.autoShow) {
            this.scheduleShow();
        }
    }
    
    initializeAdTemplates() {
        return {
            discount: {
                type: 'discount',
                title: '🔥 FLASH SALE!',
                subtitle: 'Limited time discount',
                description: 'Save big on all commission services. Don\'t miss out on this incredible opportunity!',
                icon: '💸',
                features: [
                    'Up to 50% off all services',
                    'Premium quality guaranteed',
                    'Express delivery available',
                    'Money-back guarantee'
                ],
                pricing: {
                    oldPrice: '$50',
                    newPrice: '$25',
                    discount: '50% OFF'
                }
            },
            
            promo: {
                type: 'promo',
                title: 'Special Commission Offer! 🎨',
                subtitle: 'Exclusive promotion',
                description: 'Get professional artwork, charts, and modcharts at special rates. Perfect for your FNF projects!',
                icon: '🎯',
                features: [
                    'Professional quality work',
                    'Quick turnaround time',
                    'Satisfaction guaranteed',
                    'Free consultations'
                ],
                pricing: {
                    oldPrice: 'Regular Price',
                    newPrice: 'Special Rate',
                    discount: 'LIMITED TIME'
                },
                socialProof: {
                    enabled: true,
                    text: '100+ projects completed successfully'
                }
            },
            
            exclusive: {
                type: 'exclusive',
                title: '👑 VIP Experience',
                subtitle: 'Premium service package',
                description: 'Unlock premium features and priority support with our exclusive commission package.',
                icon: '💎',
                features: [
                    'Priority queue processing',
                    'Dedicated project manager',
                    'Premium quality assurance',
                    'Exclusive design options'
                ],
                pricing: {
                    oldPrice: '$100',
                    newPrice: '$75',
                    discount: 'VIP RATE'
                }
            }
        };
    }
    
    createAdStructure() {
        // Remove existing ad if present
        const existingAd = document.getElementById('commission-ad-overlay');
        if (existingAd) {
            existingAd.remove();
        }
        
        // Create ad overlay
        const overlay = document.createElement('div');
        overlay.id = 'commission-ad-overlay';
        overlay.className = 'ad-overlay';
        
        // Create ad container
        const container = document.createElement('div');
        container.className = 'ad-container';
        container.id = 'commission-ad-container';
        
        // Add container to overlay
        overlay.appendChild(container);
        
        // Add to body
        document.body.appendChild(overlay);
        
        this.elements = {
            overlay,
            container
        };
    }
    
    bindEvents() {
        const { overlay, container } = this.elements;
        
        // Close on backdrop click
        if (this.config.closeOnBackdrop) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hide();
                }
            });
        }
        
        // Close on escape key
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.state.isVisible) {
                    this.hide();
                }
            });
        }
    }
    
    generateAdHTML(adData) {
        const {
            type = 'promo',
            title,
            subtitle,
            description,
            icon,
            features = [],
            pricing = {},
            buttons = [],
            timer = {},
            socialProof = {}
        } = adData;
        
        return `
            <button class="ad-close" onclick="commissionAd.hide()">&times;</button>
            
            <div class="ad-left">
                <div class="ad-header">
                    <div class="ad-icon">${icon}</div>
                    <div class="ad-header-text">
                        <h2>${title}</h2>
                        <p>${subtitle}</p>
                    </div>
                </div>
                
                <div class="ad-title">${title.replace(/[🎨🔥👑💎🎯💸]/g, '').trim()}</div>
                <div class="ad-subtitle">${subtitle}</div>
                <div class="ad-description">${description}</div>
                
                ${pricing.oldPrice && pricing.newPrice ? `
                    <div class="ad-pricing">
                        <span class="ad-old-price">${pricing.oldPrice}</span>
                        <span class="ad-new-price">${pricing.newPrice}</span>
                        ${pricing.discount ? `<span class="ad-discount-badge">${pricing.discount}</span>` : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="ad-right">
                ${features.length > 0 ? `
                    <ul class="ad-features">
                        ${features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                ` : ''}
                
                ${timer.enabled ? `
                    <div class="ad-timer">
                        ${timer.text}<span class="ad-timer-value" id="ad-timer-display">--:--:--</span>
                    </div>
                ` : ''}
                
                ${socialProof.enabled && socialProof.text ? `
                    <div class="ad-social-proof">${socialProof.text}</div>
                ` : ''}
            </div>
            
            ${buttons.length > 0 ? `
                <div class="ad-actions">
                    ${buttons.map((button, index) => `
                        <button class="ad-btn ad-btn-${button.type}" 
                                onclick="commissionAd.handleAction('${button.action}', ${index})">
                            ${button.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
    
    show(adData = null) {
        // Check if we should show the ad
        if (!this.shouldShowAd()) {
            return false;
        }
        
        // Use provided ad data or default
        const finalAdData = adData || this.config.defaultAd;
        this.state.currentAd = finalAdData;
        
        // Update container class for ad type
        const { container, overlay } = this.elements;
        container.className = `ad-container ${finalAdData.type || 'promo'}`;
        
        // Generate and insert HTML
        container.innerHTML = this.generateAdHTML(finalAdData);
        
        // Show overlay
        overlay.classList.add('active');
        this.state.isVisible = true;
        this.state.hasShown = true;
        
        // Mark as shown in storage
        this.markAdAsShown();
        
        // Trigger callback
        if (this.config.onShow) {
            this.config.onShow(finalAdData);
        }
        
        return true;
    }
    
    hide() {
        const { overlay } = this.elements;
        
        if (!this.state.isVisible) return;
        
        overlay.classList.remove('active');
        this.state.isVisible = false;
        
        // Trigger callback
        if (this.config.onClose) {
            this.config.onClose(this.state.currentAd);
        }
        
        this.state.currentAd = null;
    }
    
    shouldShowAd() {
        // Check if ad has already been shown this session
        if (this.config.showOnce && this.state.hasShown) {
            return false;
        }
        
        // Check if user has disabled ads
        if (this.config.respectUserPreference) {
            const userPrefs = this.getUserPreferences();
            if (userPrefs.adsDisabled) {
                return false;
            }
        }
        
        // Check if already visible
        if (this.state.isVisible) {
            return false;
        }
        
        // Check if already shown this session (from storage)
        if (this.config.showOnce && this.hasAdBeenShown()) {
            return false;
        }
        
        return true;
    }
    
    scheduleShow() {
        // Clear existing timeout
        if (this.state.showTimeout) {
            clearTimeout(this.state.showTimeout);
        }
        
        this.state.showTimeout = setTimeout(() => {
            this.show();
        }, this.config.showDelay);
    }
    
    handleAction(action, buttonIndex) {
        const currentAd = this.state.currentAd;
        const button = currentAd.buttons[buttonIndex];
        
        // Trigger callback
        if (this.config.onAction) {
            this.config.onAction(action, button, currentAd);
        }
        
        // Handle predefined actions
        switch (action) {
            case 'contact':
                this.openContact();
                break;
            case 'info':
                this.showMoreInfo();
                break;
            case 'close':
                this.hide();
                break;
            case 'dismiss':
                this.dismissAd();
                break;
            default:
                // Custom action - let the callback handle it
                break;
        }
    }
    
    openContact() {
        // Try to find and click existing contact button
        const contactBtn = document.querySelector('.btn-primary, [onclick*="copyDiscord"]');
        if (contactBtn) {
            contactBtn.click();
        } else {
            // Fallback - try to open Discord link
            window.open('https://discord.com/users/1282747277206884436', '_blank');
        }
        this.hide();
    }
    
    showMoreInfo() {
        // Scroll to services or pricing section
        const pricingSection = document.getElementById('pricingSection') || document.querySelector('.pricing');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
        this.hide();
    }
    
    dismissAd() {
        // Mark ads as disabled for this session
        const prefs = this.getUserPreferences();
        prefs.adsDisabled = true;
        prefs.dismissedAt = Date.now();
        this.saveUserPreferences(prefs);
        this.hide();
    }
    
    // Template methods for easy ad creation
    showDiscountAd(customOptions = {}) {
        const adData = { ...this.adTemplates.discount, ...customOptions };
        return this.show(adData);
    }
    
    showPromoAd(customOptions = {}) {
        const adData = { ...this.adTemplates.promo, ...customOptions };
        return this.show(adData);
    }
    
    showExclusiveAd(customOptions = {}) {
        const adData = { ...this.adTemplates.exclusive, ...customOptions };
        return this.show(adData);
    }
    
    // Custom ad creation
    createCustomAd(adData) {
        const customAd = {
            type: adData.type || 'promo',
            title: adData.title || 'Special Offer',
            subtitle: adData.subtitle || 'Limited time',
            description: adData.description || 'Don\'t miss out on this amazing deal!',
            icon: adData.icon || '🎯',
            features: adData.features || [],
            pricing: adData.pricing || {},
            buttons: adData.buttons || [
                { text: 'Get Started', type: 'primary', action: 'contact' },
                { text: 'Maybe Later', type: 'secondary', action: 'close' }
            ],
            timer: adData.timer || { enabled: false },
            socialProof: adData.socialProof || { enabled: false }
        };
        
        return this.show(customAd);
    }
    
    // Utility methods for one-time showing
    hasAdBeenShown() {
        try {
            const sessionData = sessionStorage.getItem('commission_ad_shown');
            return sessionData === 'true';
        } catch (error) {
            return false;
        }
    }
    
    markAdAsShown() {
        try {
            sessionStorage.setItem('commission_ad_shown', 'true');
        } catch (error) {
            console.warn('Could not save ad state:', error);
        }
    }
    
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem('commission_ad_prefs');
            return prefs ? JSON.parse(prefs) : { adsDisabled: false };
        } catch (error) {
            return { adsDisabled: false };
        }
    }
    
    saveUserPreferences(prefs = null) {
        try {
            const prefsToSave = prefs || {
                adsDisabled: false,
                lastShown: Date.now()
            };
            localStorage.setItem('commission_ad_prefs', JSON.stringify(prefsToSave));
        } catch (error) {
            console.warn('Could not save ad preferences:', error);
        }
    }
    
    // Admin/Debug methods
    forceShow() {
        // Force show ad regardless of preferences (for testing)
        this.state.hasShown = false;
        sessionStorage.removeItem('commission_ad_shown');
        return this.show();
    }
    
    resetAdState() {
        sessionStorage.removeItem('commission_ad_shown');
        localStorage.removeItem('commission_ad_prefs');
        this.state.hasShown = false;
        console.log('Ad state reset - will show on next page load');
    }
    
    // Cleanup method
    destroy() {
        this.hide();
        
        if (this.state.showTimeout) {
            clearTimeout(this.state.showTimeout);
        }
        
        const overlay = document.getElementById('commission-ad-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Auto-initialize with default settings
let commissionAd;

// Initialize when DOM is ready
function initCommissionAd(customConfig = {}) {
    // Default configuration for the portfolio
    const defaultConfig = {
        autoShow: true,
        showDelay: 3000, // Show after 3 seconds
        showOnce: true, // Only show once per session
        
        defaultAd: {
            type: 'promo',
            title: 'Special Commission Offer! 🎨',
            subtitle: 'Limited time promotion',
            description: 'Get professional artwork, charts, and modcharts at special rates. Perfect for your FNF projects!',
            icon: '🎯',
            features: [
                'Professional quality guaranteed',
                'Fast delivery (1-4 days max)',
                'Free revisions included',
                'PayPal secure payment'
            ],
            pricing: {
                oldPrice: 'Regular Price',
                newPrice: 'Special Rate',
                discount: 'LIMITED TIME'
            },
            buttons: [
                {
                    text: 'Contact on Discord',
                    type: 'primary',
                    action: 'contact'
                },
                {
                    text: 'View Pricing',
                    type: 'secondary',
                    action: 'info'
                }
            ],
            socialProof: {
                enabled: true,
                text: '100+ satisfied customers this month'
            }
        },
        
        // Callbacks
        onShow: (adData) => {
            console.log('Commission ad shown:', adData.type);
        },
        
        onAction: (action, button, adData) => {
            console.log('Ad action:', action, 'for ad type:', adData.type);
            
            // Track analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ad_interaction', {
                    event_category: 'commission_ad',
                    event_label: action,
                    ad_type: adData.type
                });
            }
        },
        
        ...customConfig
    };
    
    commissionAd = new CommissionAdManager(defaultConfig);
    return commissionAd;
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the main site to load
    setTimeout(() => {
        initCommissionAd();
    }, 1000);
});

// Global methods for easy access
window.showCommissionAd = (type = 'promo', customOptions = {}) => {
    if (!commissionAd) {
        initCommissionAd();
    }
    
    switch (type) {
        case 'discount':
            return commissionAd.showDiscountAd(customOptions);
        case 'promo':
            return commissionAd.showPromoAd(customOptions);
        case 'exclusive':
            return commissionAd.showExclusiveAd(customOptions);
        case 'custom':
            return commissionAd.createCustomAd(customOptions);
        default:
            return commissionAd.show(customOptions);
    }
};

window.hideCommissionAd = () => {
    if (commissionAd) {
        commissionAd.hide();
    }
};

// Debug methods for testing
window.forceShowAd = () => {
    if (commissionAd) {
        return commissionAd.forceShow();
    }
};

window.resetAdState = () => {
    if (commissionAd) {
        commissionAd.resetAdState();
    }
};

// Expose the class for advanced usage
window.CommissionAdManager = CommissionAdManager;
    }
    
    hide() {
        const { overlay } = this.elements;
        
        if (!this.state.isVisible) return;
        
        overlay.classList.remove('active');
        this.state.isVisible = false;
        
        // Clear timer
        this.clearTimer();
        
        // Schedule next show if auto-show is enabled
        if (this.config.autoShow) {
            this.scheduleShow();
        }
        
        // Trigger callback
        if (this.config.onClose) {
            this.config.onClose(this.state.currentAd);
        }
        
        this.state.currentAd = null;
    }
    
    shouldShowAd() {
        // Check if user has disabled ads
        if (this.config.respectUserPreference) {
            const userPrefs = this.getUserPreferences();
            if (userPrefs.adsDisabled) {
                return false;
            }
        }
        
        // Check max shows per session
        if (this.state.showCount >= this.config.maxShowsPerSession) {
            return false;
        }
        
        // Check if already visible
        if (this.state.isVisible) {
            return false;
        }
        
        return true;
    }
    
    scheduleShow() {
        // Clear existing timeout
        if (this.state.showTimeout) {
            clearTimeout(this.state.showTimeout);
        }
        
        this.state.showTimeout = setTimeout(() => {
            this.show();
        }, this.config.showDelay);
    }
    
    startTimer(duration) {
        this.clearTimer();
        
        let timeLeft = duration;
        const timerDisplay = document.getElementById('ad-timer-display');
        
        if (!timerDisplay) return;
        
        const updateTimer = () => {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                this.hide();
                return;
            }
            
            timeLeft--;
        };
        
        updateTimer(); // Initial call
        this.state.timerInterval = setInterval(updateTimer, 1000);
    }
    
    pauseTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
    }
    
    resumeTimer() {
        // Note: This is a simplified resume - in a real app you'd need to track the remaining time
        if (this.state.currentAd && this.state.currentAd.timer && this.state.currentAd.timer.enabled) {
            // Restart timer with remaining time (simplified)
            this.startTimer(this.state.currentAd.timer.duration);
        }
    }
    
    clearTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
    }
    
    handleAction(action, buttonIndex) {
        const currentAd = this.state.currentAd;
        const button = currentAd.buttons[buttonIndex];
        
        // Trigger callback
        if (this.config.onAction) {
            this.config.onAction(action, button, currentAd);
        }
        
        // Handle predefined actions
        switch (action) {
            case 'contact':
                this.openContact();
                break;
            case 'info':
                this.showMoreInfo();
                break;
            case 'close':
                this.hide();
                break;
            case 'dismiss':
                this.dismissAd();
                break;
            default:
                // Custom action - let the callback handle it
                break;
        }
    }
    
    openContact() {
        // Try to find and click existing contact button
        const contactBtn = document.querySelector('.btn-primary, [onclick*="copyDiscord"]');
        if (contactBtn) {
            contactBtn.click();
        } else {
            // Fallback - try to open Discord link
            window.open('https://discord.com/users/1282747277206884436', '_blank');
        }
        this.hide();
    }
    
    showMoreInfo() {
        // Scroll to services or pricing section
        const servicesSection = document.getElementById('servicesSection') || document.querySelector('.services');
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
        this.hide();
    }
    
    dismissAd() {
        // Mark ads as disabled for this session
        const prefs = this.getUserPreferences();
        prefs.adsDisabled = true;
        prefs.dismissedAt = Date.now();
        this.saveUserPreferences(prefs);
        this.hide();
    }
    
    // Template methods for easy ad creation
    showDiscountAd(customOptions = {}) {
        const adData = { ...this.adTemplates.discount, ...customOptions };
        return this.show(adData);
    }
    
    showPromoAd(customOptions = {}) {
        const adData = { ...this.adTemplates.promo, ...customOptions };
        return this.show(adData);
    }
    
    showExclusiveAd(customOptions = {}) {
        const adData = { ...this.adTemplates.exclusive, ...customOptions };
        return this.show(adData);
    }
    
    showUrgentAd(customOptions = {}) {
        const adData = { ...this.adTemplates.urgent, ...customOptions };
        return this.show(adData);
    }
    
    showSeasonalAd(customOptions = {}) {
        const adData = { ...this.adTemplates.seasonal, ...customOptions };
        return this.show(adData);
    }
    
    showBundleAd(customOptions = {}) {
        const adData = { ...this.adTemplates.bundle, ...customOptions };
        return this.show(adData);
    }
    
    // Custom ad creation
    createCustomAd(adData) {
        const customAd = {
            type: adData.type || 'promo',
            title: adData.title || 'Special Offer',
            subtitle: adData.subtitle || 'Limited time',
            description: adData.description || 'Don\'t miss out on this amazing deal!',
            icon: adData.icon || '🎯',
            features: adData.features || [],
            pricing: adData.pricing || {},
            buttons: adData.buttons || [
                { text: 'Get Started', type: 'primary', action: 'contact' },
                { text: 'Maybe Later', type: 'secondary', action: 'close' }
            ],
            timer: adData.timer || { enabled: false },
            socialProof: adData.socialProof || { enabled: false }
        };
        
        return this.show(customAd);
    }
    
    // Utility methods
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem('commission_ad_prefs');
            return prefs ? JSON.parse(prefs) : { showCount: 0, adsDisabled: false };
        } catch (error) {
            return { showCount: 0, adsDisabled: false };
        }
    }
    
    saveUserPreferences(prefs = null) {
        try {
            const prefsToSave = prefs || {
                showCount: this.state.showCount,
                adsDisabled: false,
                lastShown: Date.now()
            };
            localStorage.setItem('commission_ad_prefs', JSON.stringify(prefsToSave));
        } catch (error) {
            console.warn('Could not save ad preferences:', error);
        }
    }
    
    loadUserPreferences() {
        const prefs = this.getUserPreferences();
        
        // Reset show count if it's a new session (more than 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (prefs.lastShown && (Date.now() - prefs.lastShown) > oneHour) {
            prefs.showCount = 0;
            prefs.adsDisabled = false;
            this.saveUserPreferences(prefs);
        }
        
        this.state.showCount = prefs.showCount || 0;
    }
    
    // Admin/Debug methods
    showRandomAd() {
        const templates = Object.keys(this.adTemplates);
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        const adData = this.adTemplates[randomTemplate];
        return this.show(adData);
    }
    
    resetAdPreferences() {
        localStorage.removeItem('commission_ad_prefs');
        this.state.showCount = 0;
        console.log('Ad preferences reset');
    }
    
    getAdStats() {
        const prefs = this.getUserPreferences();
        return {
            showCount: this.state.showCount,
            isVisible: this.state.isVisible,
            currentAd: this.state.currentAd?.type || null,
            userPrefs: prefs
        };
    }
    
    // Cleanup method
    destroy() {
        this.hide();
        this.clearTimer();
        
        if (this.state.showTimeout) {
            clearTimeout(this.state.showTimeout);
        }
        
        const overlay = document.getElementById('commission-ad-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Auto-initialize with default settings
let commissionAd;

// Initialize when DOM is ready
function initCommissionAd(customConfig = {}) {
    // Default configuration for the portfolio
    const defaultConfig = {
        autoShow: true,
        showDelay: 5000, // Show after 5 seconds
        showInterval: 45000, // Show every 45 seconds
        maxShowsPerSession: 2,
        
        defaultAd: {
            type: 'promo',
            title: 'Limited Time Offer! 🎨',
            subtitle: 'Special commission pricing',
            description: 'Get professional artwork, charts, and modcharts at discounted rates. Perfect for your FNF projects!',
            icon: '🎯',
            features: [
                'Professional quality guaranteed',
                'Fast delivery (1-4 days max)',
                'Free revisions included',
                'PayPal secure payment'
            ],
            pricing: {
                oldPrice: 'Regular Price',
                newPrice: 'Special Rate',
                discount: 'LIMITED TIME'
            },
            buttons: [
                {
                    text: 'Contact on Discord',
                    type: 'primary',
                    action: 'contact'
                },
                {
                    text: 'View Pricing',
                    type: 'secondary',
                    action: 'info'
                }
            ],
            socialProof: {
                enabled: true,
                text: '100+ satisfied customers this month'
            }
        },
        
        // Callbacks
        onShow: (adData) => {
            console.log('Commission ad shown:', adData.type);
        },
        
        onAction: (action, button, adData) => {
            console.log('Ad action:', action, 'for ad type:', adData.type);
            
            // Track analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ad_interaction', {
                    event_category: 'commission_ad',
                    event_label: action,
                    ad_type: adData.type
                });
            }
        },
        
        ...customConfig
    };
    
    commissionAd = new CommissionAdManager(defaultConfig);
    return commissionAd;
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the main site to load
    setTimeout(() => {
        initCommissionAd();
    }, 1000);
});

// Global methods for easy access
window.showCommissionAd = (type = 'promo', customOptions = {}) => {
    if (!commissionAd) {
        initCommissionAd();
    }
    
    switch (type) {
        case 'discount':
            return commissionAd.showDiscountAd(customOptions);
        case 'promo':
            return commissionAd.showPromoAd(customOptions);
        case 'exclusive':
            return commissionAd.showExclusiveAd(customOptions);
        case 'urgent':
            return commissionAd.showUrgentAd(customOptions);
        case 'seasonal':
            return commissionAd.showSeasonalAd(customOptions);
        case 'bundle':
            return commissionAd.showBundleAd(customOptions);
        case 'custom':
            return commissionAd.createCustomAd(customOptions);
        default:
            return commissionAd.show(customOptions);
    }
};

window.hideCommissionAd = () => {
    if (commissionAd) {
        commissionAd.hide();
    }
};

// Expose the class for advanced usage
window.CommissionAdManager = CommissionAdManager;