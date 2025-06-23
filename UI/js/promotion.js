// Promotion Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const addPromotionBtn = document.getElementById('addPromotionBtn');
    const promotionModal = document.getElementById('promotionModal');
    const closeModal = document.getElementById('closeModal');
    const promotionForm = document.getElementById('promotionForm');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sortSelect = document.getElementById('sortSelect');
    const viewBtns = document.querySelectorAll('.view-btn');
    const promotionGrid = document.getElementById('promotionGrid');
    const emptyState = document.getElementById('emptyState');

    // User Menu Toggle
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        userDropdown.classList.remove('active');
    });

    // Modal Controls
    addPromotionBtn.addEventListener('click', function() {
        openModal('create');
    });

    closeModal.addEventListener('click', function() {
        closePromotionModal();
    });

    promotionModal.addEventListener('click', function(e) {
        if (e.target === promotionModal) {
            closePromotionModal();
        }
    });

    // Form Submission
    promotionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });

    // Search and Filter
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    statusFilter.addEventListener('change', handleFilter);
    typeFilter.addEventListener('change', handleFilter);
    sortSelect.addEventListener('change', handleSort);

    // View Toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            toggleView(this.dataset.view);
        });
    });

    // Promotion Card Actions
    setupPromotionActions();

    // Auto-populate form dates
    setupDateDefaults();

    // Initialize
    updateStats();
});

function openModal(mode, promotionData = null) {
    const modal = document.getElementById('promotionModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('promotionForm');
    
    if (mode === 'create') {
        modalTitle.textContent = 'Tạo chương trình khuyến mãi mới';
        form.reset();
        setupDateDefaults();
    } else if (mode === 'edit') {
        modalTitle.textContent = 'Chỉnh sửa chương trình khuyến mãi';
        populateForm(promotionData);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePromotionModal() {
    const modal = document.getElementById('promotionModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function populateForm(data) {
    if (!data) return;
    
    document.getElementById('promotionName').value = data.name || '';
    document.getElementById('promotionCode').value = data.code || '';
    document.getElementById('discountType').value = data.type || '';
    document.getElementById('discountValue').value = data.value || '';
    document.getElementById('startDate').value = data.startDate || '';
    document.getElementById('endDate').value = data.endDate || '';
    document.getElementById('minOrder').value = data.minOrder || '';
    document.getElementById('usageLimit').value = data.usageLimit || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('autoActivate').checked = data.autoActivate || false;
}

function handleFormSubmission() {
    const formData = new FormData(document.getElementById('promotionForm'));
    const data = Object.fromEntries(formData.entries());
    
    // Validation
    if (!validateForm(data)) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#promotionForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Chương trình khuyến mãi đã được tạo thành công!', 'success');
        closePromotionModal();
        
        // Add new promotion card to grid
        addPromotionCard(data);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Update stats
        updateStats();
    }, 2000);
}

function validateForm(data) {
    const required = ['name', 'code', 'type', 'value', 'startDate', 'endDate'];
    
    for (let field of required) {
        if (!data[field]) {
            showNotification(`Vui lòng điền ${getFieldLabel(field)}!`, 'error');
            return false;
        }
    }
    
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate >= endDate) {
        showNotification('Ngày kết thúc phải sau ngày bắt đầu!', 'error');
        return false;
    }
    
    // Validate discount value
    if (data.type === 'percentage' && (data.value < 1 || data.value > 100)) {
        showNotification('Giá trị giảm giá phần trăm phải từ 1-100%!', 'error');
        return false;
    }
    
    return true;
}

function getFieldLabel(field) {
    const labels = {
        'name': 'tên chương trình',
        'code': 'mã khuyến mãi',
        'type': 'loại giảm giá',
        'value': 'giá trị giảm',
        'startDate': 'ngày bắt đầu',
        'endDate': 'ngày kết thúc'
    };
    return labels[field] || field;
}

function addPromotionCard(data) {
    const grid = document.getElementById('promotionGrid');
    const card = createPromotionCard(data);
    grid.insertBefore(card, grid.firstChild);
    
    // Animate new card
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
}

function createPromotionCard(data) {
    const card = document.createElement('div');
    card.className = 'promotion-card new';
    card.dataset.status = 'active';
    card.dataset.type = data.type;
    
    const discountDisplay = getDiscountDisplay(data.type, data.value);
    const statusBadge = 'Đang hoạt động';
    const statusClass = 'active';
    
    card.innerHTML = `
        <div class="promotion-header">
            <div class="promotion-status">
                <span class="status-badge ${statusClass}">${statusBadge}</span>
                <span class="new-label">Mới</span>
                <div class="promotion-actions">
                    <button class="action-btn" title="Chỉnh sửa" onclick="editPromotion(this)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Sao chép" onclick="copyPromotion(this)">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" title="Xóa" onclick="deletePromotion(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="promotion-title">
                <h3>${data.name}</h3>
                <p class="promotion-code">Mã: ${data.code}</p>
            </div>
        </div>
        <div class="promotion-body">
            <div class="discount-info">
                <div class="discount-value">
                    <span class="discount-number">${discountDisplay.number}</span>
                    <span class="discount-type">${discountDisplay.type}</span>
                </div>
                <div class="promotion-details">
                    <p><i class="fas fa-calendar"></i> ${formatDateRange(data.startDate, data.endDate)}</p>
                    ${data.minOrder ? `<p><i class="fas fa-shopping-cart"></i> Đơn tối thiểu: ${formatCurrency(data.minOrder)}</p>` : ''}
                    <p><i class="fas fa-users"></i> Đã sử dụng: 0/${data.usageLimit || '∞'}</p>
                </div>
            </div>
            <div class="progress-bar ${!data.usageLimit ? 'unlimited' : ''}">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">${!data.usageLimit ? 'Không giới hạn' : '0% đã sử dụng'}</div>
        </div>
        <div class="promotion-footer">
            <div class="performance-metrics">
                <span class="metric">
                    <i class="fas fa-eye"></i>
                    0 lượt xem
                </span>
                <span class="metric">
                    <i class="fas fa-chart-line"></i>
                    0% tỷ lệ chuyển đổi
                </span>
            </div>
        </div>
    `;
    
    return card;
}

function getDiscountDisplay(type, value) {
    switch(type) {
        case 'percentage':
            return { number: value + '%', type: 'Giảm giá' };
        case 'fixed':
            return { number: formatCurrency(value, true), type: 'Giảm tiền' };
        case 'bogo':
            return { number: '1+1', type: 'Mua 1 tặng 1' };
        case 'freeship':
            return { number: '0Đ', type: 'Phí ship' };
        default:
            return { number: value, type: 'Giảm giá' };
    }
}

function formatDateRange(startDate, endDate) {
    const start = new Date(startDate).toLocaleDateString('vi-VN');
    const end = new Date(endDate).toLocaleDateString('vi-VN');
    return `${start} - ${end}`;
}

function formatCurrency(amount, short = false) {
    const num = parseInt(amount);
    if (short && num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (short && num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
}

function setupPromotionActions() {
    // Use event delegation for dynamic content
    document.addEventListener('click', function(e) {
        if (e.target.closest('.action-btn')) {
            const btn = e.target.closest('.action-btn');
            const card = btn.closest('.promotion-card');
            const action = btn.title.toLowerCase();
            
            if (action.includes('chỉnh sửa')) {
                editPromotion(card);
            } else if (action.includes('sao chép')) {
                copyPromotion(card);
            } else if (action.includes('xóa')) {
                deletePromotion(card);
            }
        }
    });
}

function editPromotion(card) {
    const promotionData = extractPromotionData(card);
    openModal('edit', promotionData);
}

function copyPromotion(card) {
    const promotionData = extractPromotionData(card);
    promotionData.name = 'Copy of ' + promotionData.name;
    promotionData.code = promotionData.code + '_COPY';
    
    showNotification('Đã sao chép chương trình khuyến mãi!', 'success');
    setTimeout(() => {
        addPromotionCard(promotionData);
    }, 500);
}

function deletePromotion(card) {
    if (confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?')) {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            card.remove();
            showNotification('Đã xóa chương trình khuyến mãi!', 'success');
            updateStats();
        }, 300);
    }
}

function extractPromotionData(card) {
    return {
        name: card.querySelector('.promotion-title h3').textContent,
        code: card.querySelector('.promotion-code').textContent.replace('Mã: ', ''),
        type: card.dataset.type,
        // Add more data extraction as needed
    };
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filterPromotions();
}

function handleFilter() {
    filterPromotions();
}

function handleSort() {
    const sortValue = document.getElementById('sortSelect').value;
    sortPromotions(sortValue);
}

function filterPromotions() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const cards = document.querySelectorAll('.promotion-card');
    
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('.promotion-title h3').textContent.toLowerCase();
        const code = card.querySelector('.promotion-code').textContent.toLowerCase();
        const status = card.dataset.status;
        const type = card.dataset.type;
        
        const matchesSearch = !query || name.includes(query) || code.includes(query);
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesType = !typeFilter || type === typeFilter;
        
        if (matchesSearch && matchesStatus && matchesType) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('emptyState');
    const promotionGrid = document.getElementById('promotionGrid');
    
    if (visibleCount === 0) {
        promotionGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        promotionGrid.style.display = 'grid';
        emptyState.style.display = 'none';
    }
}

function sortPromotions(sortValue) {
    const grid = document.getElementById('promotionGrid');
    const cards = Array.from(grid.querySelectorAll('.promotion-card'));
    
    cards.sort((a, b) => {
        switch(sortValue) {
            case 'name_asc':
                return a.querySelector('.promotion-title h3').textContent.localeCompare(
                    b.querySelector('.promotion-title h3').textContent
                );
            case 'name_desc':
                return b.querySelector('.promotion-title h3').textContent.localeCompare(
                    a.querySelector('.promotion-title h3').textContent
                );
            // Add more sorting options
            default:
                return 0;
        }
    });
    
    // Re-append sorted cards
    cards.forEach(card => grid.appendChild(card));
}

function toggleView(view) {
    const grid = document.getElementById('promotionGrid');
    
    if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
        grid.querySelectorAll('.promotion-card').forEach(card => {
            card.style.display = 'flex';
            card.style.flexDirection = 'row';
        });
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        grid.querySelectorAll('.promotion-card').forEach(card => {
            card.style.display = 'block';
            card.style.flexDirection = '';
        });
    }
}

function setupDateDefaults() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    startDate.value = tomorrow.toISOString().slice(0, 16);
    endDate.value = nextWeek.toISOString().slice(0, 16);
}

function updateStats() {
    // Simulate real-time stats update
    const stats = calculateStats();
    
    document.querySelector('.active-promotions .stat-info h3').textContent = stats.active;
    document.querySelector('.total-savings .stat-info h3').textContent = stats.savings;
    document.querySelector('.usage-rate .stat-info h3').textContent = stats.usage + '%';
    document.querySelector('.revenue-impact .stat-info h3').textContent = stats.revenue;
}

function calculateStats() {
    const cards = document.querySelectorAll('.promotion-card');
    const activeCards = document.querySelectorAll('.promotion-card[data-status="active"]');
    
    return {
        active: activeCards.length,
        savings: '2.5M VNĐ',
        usage: Math.floor(Math.random() * 20) + 70, // 70-90%
        revenue: '45M VNĐ'
    };
}

// Enhanced notification function
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
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
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background 0.3s ease;
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
    `;
    
    if (!document.querySelector('#notification-styles-promotion')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles-promotion';
        styleElement.textContent = notificationStyles;
        document.head.appendChild(styleElement);
    }
    
    document.body.appendChild(notification);
    
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

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize scroll animations
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

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.stat-card, .promotion-card');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});
