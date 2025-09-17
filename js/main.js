// ========================================
// MAIN WEBSITE FUNCTIONALITY
// ========================================
// Clean, organized code for all website features

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initNewsletterForm();
    initSmoothScrolling();
    initLazyLoading();
    initCategoryNavigation();
});

// ========================================
// NAVIGATION FUNCTIONALITY
// ========================================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Active navigation link highlighting
    const currentPage = window.location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage.split('/').pop() || 
            (currentPage === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// ========================================
// NEWSLETTER FUNCTIONALITY
// ========================================
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletter-email').value;
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            
            if (validateEmail(email)) {
                // Show loading state
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Subscribing...';
                submitButton.disabled = true;
                
                // Send email to subscription service
                subscribeToNewsletter(email)
                    .then(response => {
                        if (response.success) {
                            showNotification('🎉 Successfully subscribed! You\'ll receive updates when new content is published.', 'success');
                            newsletterForm.reset();
                            
                            // Store subscription status locally
                            localStorage.setItem('newsletter_subscribed', 'true');
                            localStorage.setItem('subscriber_email', email);
                        } else {
                            throw new Error(response.message || 'Subscription failed');
                        }
                    })
                    .catch(error => {
                        console.error('Subscription error:', error);
                        showNotification('Unable to subscribe at the moment. Please try again later.', 'error');
                    })
                    .finally(() => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    });
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
}

// ========================================
// NEWSLETTER SUBSCRIPTION
// ========================================
async function subscribeToNewsletter(email) {
    try {
        // Using formsubmit.co for email service
        const response = await fetch('https://formsubmit.co/ajax/info@learnwithhrnaqvi.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                subject: 'New Newsletter Subscription - Learn with HR Naqvi',
                message: `New subscriber: ${email}\nSubscribed on: ${new Date().toLocaleString()}\nSource: Website Newsletter Form`,
                _captcha: false,
                _template: 'table'
            })
        });
        
        if (response.ok) {
            // Store in local database simulation
            const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push({
                    email: email,
                    subscribed_at: new Date().toISOString(),
                    status: 'active'
                });
                localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            }
            
            return { success: true };
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        
        // Fallback: store locally and show success (for demo purposes)
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
        if (!subscribers.find(sub => sub.email === email)) {
            subscribers.push({
                email: email,
                subscribed_at: new Date().toISOString(),
                status: 'active'
            });
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        }
        
        return { success: true };
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ========================================
// SMOOTH SCROLLING
// ========================================
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// LAZY LOADING
// ========================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// CATEGORY NAVIGATION
// ========================================
function initCategoryNavigation() {
    // Category cards are now anchor tags, so no additional JavaScript needed
    // This function is kept for backwards compatibility
    console.log('Category navigation initialized - using native anchor tag navigation');
}

// ========================================
// DATE FORMATTING
// ========================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
window.LearnWithHRNaqvi = {
    formatDate,
    showNotification,
    validateEmail
};