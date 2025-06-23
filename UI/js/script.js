// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const ctaButton = document.querySelector('.cta-button');
const productBtns = document.querySelectorAll('.product-btn');
const contactForm = document.querySelector('.contact-form');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// CTA Button Scroll to Products
ctaButton.addEventListener('click', () => {
    const productsSection = document.querySelector('#products');
    const offsetTop = productsSection.offsetTop - 70;
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
});

// Product Button Interactions
productBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        
        // Show product modal or navigate to product page
        showProductModal(productName);
    });
});

// Product Modal Function
function showProductModal(productName) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${productName}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    <i class="fas fa-image"></i>
                    <p>Hình ảnh sản phẩm</p>
                </div>
                <div class="modal-info">
                    <p>Đây là mô tả chi tiết về ${productName}. Sản phẩm được làm từ chất liệu cao cấp với thiết kế hiện đại và sang trọng.</p>
                    <ul class="product-features">
                        <li><i class="fas fa-check"></i> Chất liệu cao cấp</li>
                        <li><i class="fas fa-check"></i> Thiết kế hiện đại</li>
                        <li><i class="fas fa-check"></i> Bảo hành 2 năm</li>
                        <li><i class="fas fa-check"></i> Giao hàng miễn phí</li>
                    </ul>
                    <div class="modal-actions">
                        <button class="btn-primary">Thêm vào giỏ hàng</button>
                        <button class="btn-secondary">Liên hệ tư vấn</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e9ecef;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .modal-image {
            width: 100%;
            height: 200px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #6c757d;
            margin-bottom: 1rem;
        }
        
        .modal-image i {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        .modal-info p {
            margin-bottom: 1rem;
            line-height: 1.6;
        }
        
        .product-features {
            list-style: none;
            margin-bottom: 1.5rem;
        }
        
        .product-features li {
            padding: 0.5rem 0;
            color: #333;
        }
          .product-features i {
            color: #dc2626;
            margin-right: 0.5rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .btn-primary, .btn-secondary {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%);
            color: white;
        }
        
        .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
            left: 100%;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
            border: 2px solid #dc2626;
        }
        
        .btn-secondary:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 600px) {
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
    
    // Add styles to head if not exists
    if (!document.querySelector('#modal-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'modal-styles';
        styleElement.textContent = modalStyles;
        document.head.appendChild(styleElement);
    }
    
    // Add modal to body
    document.body.appendChild(modalOverlay);
    
    // Close modal functionality
    const closeModal = () => {
        modalOverlay.remove();
    };
    
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Add to cart functionality
    modalOverlay.querySelector('.btn-primary').addEventListener('click', () => {
        alert(`Đã thêm ${productName} vào giỏ hàng!`);
        closeModal();
    });
    
    // Contact consultation functionality
    modalOverlay.querySelector('.btn-secondary').addEventListener('click', () => {
        closeModal();
        // Scroll to contact section
        const contactSection = document.querySelector('#contact');
        const offsetTop = contactSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    });
}

// Contact Form Submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const phone = contactForm.querySelector('input[type="tel"]').value;
    const message = contactForm.querySelector('textarea').value;
    
    // Validate form
    if (!name || !email || !phone || !message) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Simulate form submission
    showNotification('Đang gửi tin nhắn...', 'info');
    
    setTimeout(() => {
        showNotification('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
        contactForm.reset();
    }, 2000);
});

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        }
          .notification-success { background: linear-gradient(135deg, #16a085 0%, #27ae60 100%); }
        .notification-error { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
        .notification-info { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = notificationStyles;
        document.head.appendChild(styleElement);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Scroll to Top Functionality
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    
    // Show/hide scroll to top button
    let scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollToTopBtn) {
        scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        
        // Add scroll to top styles
        const scrollBtnStyles = `            .scroll-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 55px;
                height: 55px;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1500;
                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
            }
            
            .scroll-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            
            .scroll-to-top:hover {
                background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(220, 38, 38, 0.5);
            }
        `;
        
        if (!document.querySelector('#scroll-btn-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'scroll-btn-styles';
            styleElement.textContent = scrollBtnStyles;
            document.head.appendChild(styleElement);
        }
        
        document.body.appendChild(scrollToTopBtn);
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    if (scrollTop > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Active Navigation Link Highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Add active navigation styles
const activeNavStyles = `
    .nav-link.active {
        color: #dc2626 !important;
        background: #fef2f2 !important;
    }
    
    .nav-link.active::after {
        width: 80% !important;
    }
`;

if (!document.querySelector('#active-nav-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'active-nav-styles';
    styleElement.textContent = activeNavStyles;
    document.head.appendChild(styleElement);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('FurniStore website loaded successfully!');
    
    // Add loading animation to product cards
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
    
    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
