// Refund Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const returnForm = document.getElementById('returnForm');
    const trackBtn = document.getElementById('trackBtn');
    const trackingInput = document.getElementById('trackingCode');
    
    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    // File upload handling
    const fileInput = document.getElementById('images');
    const fileLabel = document.querySelector('.file-label span');
    
    // Return form submission
    returnForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(returnForm);
        const orderNumber = formData.get('orderNumber');
        const email = formData.get('customerEmail');
        const productName = formData.get('productName');
        const reason = formData.get('returnReason');
        
        // Validate required fields
        if (!orderNumber || !email || !productName || !reason) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Vui lòng nhập email hợp lệ!', 'error');
            return;
        }
        
        // Validate order number format
        if (!orderNumber.startsWith('FN') || orderNumber.length < 8) {
            showNotification('Mã đơn hàng không hợp lệ! (VD: FN123456789)', 'error');
            return;
        }
        
        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms').checked;
        if (!agreeTerms) {
            showNotification('Vui lòng đồng ý với chính sách hoàn trả!', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Đang gửi yêu cầu hoàn trả...', 'info');
        
        // Disable submit button
        const submitBtn = returnForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        
        setTimeout(() => {
            const trackingCode = 'RT' + Date.now().toString().slice(-8);
            
            showNotification(`Yêu cầu hoàn trả đã được gửi thành công! Mã theo dõi: ${trackingCode}`, 'success');
            
            // Reset form
            returnForm.reset();
            fileLabel.textContent = 'Tải lên hình ảnh (tối đa 5 ảnh)';
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi yêu cầu hoàn trả';
            
            // Auto-fill tracking input
            trackingInput.value = trackingCode;
        }, 2000);
    });
    
    // Tracking functionality
    trackBtn.addEventListener('click', function() {
        const trackingCode = trackingInput.value.trim();
        
        if (!trackingCode) {
            showNotification('Vui lòng nhập mã theo dõi!', 'error');
            return;
        }
        
        if (!trackingCode.startsWith('RT') || trackingCode.length < 8) {
            showNotification('Mã theo dõi không hợp lệ!', 'error');
            return;
        }
        
        // Simulate tracking lookup
        trackBtn.disabled = true;
        trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tra cứu...';
        
        setTimeout(() => {
            showNotification('Đã tìm thấy thông tin theo dõi!', 'success');
            
            // Update process steps based on tracking
            updateProcessSteps();
            
            trackBtn.disabled = false;
            trackBtn.innerHTML = '<i class="fas fa-search"></i> Tra cứu';
        }, 1500);
    });
    
    // File upload handling
    fileInput.addEventListener('change', function() {
        const files = this.files;
        if (files.length > 0) {
            if (files.length > 5) {
                showNotification('Chỉ được tải lên tối đa 5 hình ảnh!', 'error');
                this.value = '';
                return;
            }
            
            let fileNames = [];
            for (let i = 0; i < Math.min(files.length, 5); i++) {
                fileNames.push(files[i].name);
            }
            fileLabel.textContent = `Đã chọn ${files.length} file: ${fileNames.join(', ')}`;
        } else {
            fileLabel.textContent = 'Tải lên hình ảnh (tối đa 5 ảnh)';
        }
    });
    
    // FAQ accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Smooth scrolling for policy link
    document.querySelector('.terms-link').addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector('#policy');
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    });
    
    // Auto-populate form with URL parameters (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('order')) {
        document.getElementById('orderNumber').value = urlParams.get('order');
    }
    if (urlParams.get('email')) {
        document.getElementById('customerEmail').value = urlParams.get('email');
    }
});

// Update process steps based on tracking
function updateProcessSteps() {
    const steps = document.querySelectorAll('.step');
    const statuses = ['completed', 'completed', 'active', '', ''];
    
    steps.forEach((step, index) => {
        step.className = 'step ' + (statuses[index] || '');
    });
    
    // Update step times
    const stepTimes = document.querySelectorAll('.step-time');
    stepTimes[0].textContent = '3 ngày trước';
    stepTimes[1].textContent = '2 ngày trước';
    stepTimes[2].textContent = 'Ước tính: 1-2 ngày';
}

// Enhanced notification function with different types
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-bell"></i>';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icon}
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Enhanced notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            min-width: 300px;
            max-width: 500px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 1.1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.3s ease;
            margin-left: 15px;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .notification-success { 
            background: linear-gradient(135deg, #16a085 0%, #27ae60 100%); 
        }
        .notification-error { 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
        }
        .notification-info { 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
        }
        
        @keyframes slideInRight {
            from { 
                transform: translateX(100%) scale(0.8); 
                opacity: 0; 
            }
            to { 
                transform: translateX(0) scale(1); 
                opacity: 1; 
            }
        }
        
        @media (max-width: 480px) {
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
            }
        }
    `;
    
    if (!document.querySelector('#notification-styles-enhanced')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles-enhanced';
        styleElement.textContent = notificationStyles;
        document.head.appendChild(styleElement);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification && notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add scroll animations
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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.stat-card, .policy-card, .faq-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
