function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    const isSmallScreen = window.innerWidth <= 768;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return mobileRegex.test(userAgent) || (isSmallScreen && isTouchDevice);
}

function createMobileMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'mobile-contact-message';
    messageContainer.innerHTML = `
        <div class="message-content">
            <div class="message-icon">
                <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Contact Section Coming Soon</h3>
            <p>This section is not available for mobile devices yet. We're working on bringing you an optimized mobile experience soon!</p>
            <div class="message-footer">
                <i class="fas fa-tools"></i>
                <span>Under Development</span>
            </div>
        </div>
    `;
    
    const styles = `
        .mobile-contact-message {
            background: var(--second-bg-color, #0b0b0c);
            border-radius: 20px;
            padding: 4rem 3rem;
            text-align: center;
            border: 2px solid rgba(var(--main-color-rgb, 121, 117, 108), 0.3);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
            animation: fadeInUp 0.8s ease forwards;
        }
        
        .mobile-contact-message::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 80%, rgba(var(--main-color-rgb, 121, 117, 108), 0.05) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .message-content {
            position: relative;
            z-index: 2;
        }
        
        .message-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 2rem;
            background: rgba(var(--main-color-rgb, 121, 117, 108), 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid var(--main-color, #79756c);
            animation: float 3s ease-in-out infinite;
        }
        
        .message-icon i {
            font-size: 3.5rem;
            color: var(--main-color, #79756c);
        }
        
        .mobile-contact-message h3 {
            font-size: 2.8rem;
            color: var(--text-color, #ffffff);
            margin-bottom: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--main-color, #79756c), var(--secondary-color, #c7c8c7));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .mobile-contact-message p {
            font-size: 1.7rem;
            color: rgba(var(--text-color-rgb, 255, 255, 255), 0.8);
            line-height: 1.7;
            margin-bottom: 2.5rem;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .message-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            font-size: 1.5rem;
            color: var(--main-color, #79756c);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .message-footer i {
            animation: pulse 2s infinite;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-15px);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
            .mobile-contact-message {
                padding: 3rem 2rem;
                margin: 1rem;
            }
            
            .message-icon {
                width: 80px;
                height: 80px;
            }
            
            .message-icon i {
                font-size: 3rem;
            }
            
            .mobile-contact-message h3 {
                font-size: 2.4rem;
            }
            
            .mobile-contact-message p {
                font-size: 1.5rem;
            }
            
            .message-footer {
                font-size: 1.3rem;
            }
        }
    `;
    
    if (!document.getElementById('mobile-message-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'mobile-message-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    return messageContainer;
}

function handleContactOnMobile() {
    const contactSection = document.getElementById('contact');
    
    if (!contactSection) {
        console.warn('Contact section not found');
        return;
    }
    
    if (isMobile()) {
        const originalContent = contactSection.innerHTML;
        contactSection.setAttribute('data-original-content', originalContent);
        
        contactSection.innerHTML = '';
        const mobileMessage = createMobileMessage();
        contactSection.appendChild(mobileMessage);
        
        console.log('Mobile detected - contact section replaced with mobile message');
    } else {
        const originalContent = contactSection.getAttribute('data-original-content');
        if (originalContent) {
            contactSection.innerHTML = originalContent;
            contactSection.removeAttribute('data-original-content');
        }
        
        console.log('Desktop detected - contact section showing normally');
    }
}

document.addEventListener('DOMContentLoaded', handleContactOnMobile);

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleContactOnMobile, 250);
});

if (!document.querySelector('link[href*="fontawesome"]') && !document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
}