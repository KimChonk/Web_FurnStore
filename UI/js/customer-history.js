// Customer History JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize customer history functionality
    initCustomerHistory();
});

function initCustomerHistory() {
    // Get DOM elements
    const customerSearch = document.getElementById('customerSearch');
    const timeFilter = document.getElementById('timeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const amountFilter = document.getElementById('amountFilter');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    const exportBtn = document.getElementById('exportBtn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const customerContainer = document.querySelector('.customer-container');
    
    // Initialize functionality
    setupEventListeners();
    setupCustomerCards();
    setupNotifications();
    animateAnalytics();
    
    function setupEventListeners() {
        // Search and filter events
        customerSearch.addEventListener('input', debounce(filterCustomers, 300));
        timeFilter.addEventListener('change', filterCustomers);
        statusFilter.addEventListener('change', filterCustomers);
        amountFilter.addEventListener('change', filterCustomers);
        
        // Action button events
        advancedSearchBtn.addEventListener('click', showAdvancedSearch);
        exportBtn.addEventListener('click', exportCustomerData);
        
        // View toggle events
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;
                toggleView(view);
            });
        });
    }
    
    function setupCustomerCards() {
        const customerCards = document.querySelectorAll('.customer-card');
        
        customerCards.forEach(card => {
            const toggleBtn = card.querySelector('.toggle-history');
            const historySection = card.querySelector('.order-history');
            const viewBtn = card.querySelector('.action-btn[title="Xem chi tiết"]');
            const emailBtn = card.querySelector('.action-btn[title="Gửi email"]');
            const loadMoreBtn = card.querySelector('.load-more-btn');
            
            // Toggle history
            if (toggleBtn && historySection) {
                toggleBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleOrderHistory(card, historySection, toggleBtn);
                });
            }
            
            // View customer details
            if (viewBtn) {
                viewBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    viewCustomerDetails(card);
                });
            }
            
            // Send email
            if (emailBtn) {
                emailBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    sendEmailToCustomer(card);
                });
            }
            
            // Load more orders
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    loadMoreOrders(card);
                });
            }
            
            // Setup order action buttons
            setupOrderActions(card);
        });
    }
    
    function setupOrderActions(customerCard) {
        const orderItems = customerCard.querySelectorAll('.order-item');
        
        orderItems.forEach(orderItem => {
            const actionBtns = orderItem.querySelectorAll('.order-action-btn');
            
            actionBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    handleOrderAction(btn, orderItem);
                });
            });
        });
    }
    
    function toggleOrderHistory(card, historySection, toggleBtn) {
        const isVisible = historySection.style.display !== 'none';
        const customerName = card.querySelector('h3').textContent;
        
        if (isVisible) {
            historySection.style.display = 'none';
            toggleBtn.classList.remove('active');
            showNotification(`Đã ẩn lịch sử của ${customerName}`, 'info');
        } else {
            historySection.style.display = 'block';
            toggleBtn.classList.add('active');
            showNotification(`Đang hiển thị lịch sử của ${customerName}`, 'info');
        }
    }
    
    function viewCustomerDetails(card) {
        const customerId = card.dataset.customerId;
        const customerName = card.querySelector('h3').textContent;
        const email = card.querySelector('.customer-contact span:first-child').textContent.trim();
        const phone = card.querySelector('.customer-contact span:last-child').textContent.trim();
        const totalOrders = card.querySelector('.stat-value').textContent;
        const totalSpent = card.querySelectorAll('.stat-value')[1].textContent;
        
        // Create detailed view modal
        const modalHTML = `
            <div class="customer-detail-modal">
                <div class="modal-header">
                    <h2>Chi tiết khách hàng</h2>
                    <button class="modal-close" onclick="this.closest('.customer-detail-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="customer-summary">
                        <h3>${customerName}</h3>
                        <div class="contact-info">
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Điện thoại:</strong> ${phone}</p>
                        </div>
                        <div class="purchase-summary">
                            <div class="summary-item">
                                <span class="label">Tổng đơn hàng:</span>
                                <span class="value">${totalOrders}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Tổng chi tiêu:</span>
                                <span class="value">${totalSpent}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="sendEmailToCustomerById('${customerId}')">
                            <i class="fas fa-envelope"></i> Gửi email
                        </button>
                        <button class="btn-secondary" onclick="exportCustomerReport('${customerId}')">
                            <i class="fas fa-download"></i> Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal (simplified - in real app would use proper modal system)
        showNotification(`Đang xem chi tiết khách hàng ${customerName}`, 'info');
        console.log('Customer Details:', { customerId, customerName, email, phone, totalOrders, totalSpent });
    }
    
    function sendEmailToCustomer(card) {
        const customerName = card.querySelector('h3').textContent;
        const email = card.querySelector('.customer-contact span:first-child').textContent.replace(/.*\s/, '');
        
        // Simulate email composition
        const emailTemplates = [
            'Cảm ơn bạn đã tin tưởng FurniStore',
            'Khuyến mãi đặc biệt dành cho bạn',
            'Sản phẩm mới vừa về kho',
            'Ưu đãi sinh nhật khách hàng VIP'
        ];
        
        const randomTemplate = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
        
        showNotification(`Đang soạn email "${randomTemplate}" gửi đến ${customerName} (${email})`, 'info');
        
        // Simulate sending
        setTimeout(() => {
            showNotification(`Đã gửi email thành công đến ${customerName}`, 'success');
        }, 1500);
    }
    
    function loadMoreOrders(card) {
        const customerName = card.querySelector('h3').textContent;
        const ordersList = card.querySelector('.orders-list');
        const loadMoreBtn = card.querySelector('.load-more-btn');
        
        // Simulate loading more orders
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
        loadMoreBtn.disabled = true;
        
        setTimeout(() => {
            const newOrdersHTML = generateMoreOrders();
            ordersList.insertAdjacentHTML('beforeend', newOrdersHTML);
            
            // Update button text
            const remainingText = loadMoreBtn.textContent.match(/\((\d+)[^)]*\)/);
            if (remainingText) {
                const remaining = parseInt(remainingText[1]) - 3;
                if (remaining > 0) {
                    loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Xem thêm đơn hàng (${remaining} đơn còn lại)`;
                    loadMoreBtn.disabled = false;
                } else {
                    loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> Đã hiển thị tất cả';
                    loadMoreBtn.disabled = true;
                }
            }
            
            showNotification(`Đã tải thêm đơn hàng của ${customerName}`, 'success');
            
            // Setup actions for new order items
            setupOrderActions(card);
        }, 1000);
    }
    
    function generateMoreOrders() {
        const orderTemplates = [
            {
                id: '#ORD-2024-' + Math.floor(Math.random() * 200 + 100),
                date: getRandomDate(),
                products: 'Ghế văn phòng, Tủ hồ sơ',
                amount: (Math.random() * 3000000 + 1000000).toFixed(0),
                status: 'completed'
            },
            {
                id: '#ORD-2024-' + Math.floor(Math.random() * 200 + 100),
                date: getRandomDate(),
                products: 'Bàn ăn mở rộng, Ghế ăn bọc da',
                amount: (Math.random() * 5000000 + 2000000).toFixed(0),
                status: 'completed'
            },
            {
                id: '#ORD-2024-' + Math.floor(Math.random() * 200 + 100),
                date: getRandomDate(),
                products: 'Kệ sách đa năng',
                amount: (Math.random() * 2000000 + 500000).toFixed(0),
                status: 'completed'
            }
        ];
        
        return orderTemplates.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${order.date}</div>
                    <div class="order-products">
                        <span>${order.products}</span>
                    </div>
                </div>
                <div class="order-amount">
                    <span class="amount">${parseInt(order.amount).toLocaleString('vi-VN')} VNĐ</span>
                    <span class="status ${order.status}">Hoàn thành</span>
                </div>
                <div class="order-actions">
                    <button class="order-action-btn" title="Xem chi tiết">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="order-action-btn" title="In hóa đơn">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function getRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toLocaleDateString('vi-VN');
    }
    
    function handleOrderAction(btn, orderItem) {
        const orderId = orderItem.querySelector('.order-id').textContent;
        const title = btn.getAttribute('title');
        
        switch (title) {
            case 'Xem chi tiết':
                viewOrderDetails(orderId);
                break;
            case 'In hóa đơn':
                printInvoice(orderId);
                break;
            case 'Cập nhật':
                updateOrder(orderId);
                break;
            case 'Theo dõi':
                trackOrder(orderId);
                break;
            case 'Liên hệ':
                contactCustomer(orderId);
                break;
            default:
                showNotification(`Thao tác "${title}" cho đơn hàng ${orderId}`, 'info');
        }
    }
    
    function viewOrderDetails(orderId) {
        showNotification(`Đang xem chi tiết đơn hàng ${orderId}`, 'info');
        // In real app, would open order detail modal or navigate to order page
    }
    
    function printInvoice(orderId) {
        showNotification(`Đang in hóa đơn cho đơn hàng ${orderId}`, 'info');
        // Simulate printing process
        setTimeout(() => {
            showNotification(`Đã in hóa đơn ${orderId} thành công`, 'success');
        }, 1000);
    }
    
    function updateOrder(orderId) {
        showNotification(`Đang cập nhật đơn hàng ${orderId}`, 'info');
        // In real app, would open order edit form
    }
    
    function trackOrder(orderId) {
        showNotification(`Đang theo dõi đơn hàng ${orderId}`, 'info');
        // In real app, would show tracking information
    }
    
    function contactCustomer(orderId) {
        showNotification(`Đang liên hệ khách hàng về đơn hàng ${orderId}`, 'info');
        // In real app, would open contact form or initiate call
    }
    
    function filterCustomers() {
        const searchTerm = customerSearch.value.toLowerCase().trim();
        const timeValue = timeFilter.value;
        const statusValue = statusFilter.value;
        const amountValue = amountFilter.value;
        
        const customerCards = document.querySelectorAll('.customer-card');
        let visibleCount = 0;
        
        customerCards.forEach(card => {
            const customerName = card.querySelector('h3').textContent.toLowerCase();
            const email = card.querySelector('.customer-contact span:first-child').textContent.toLowerCase();
            const phone = card.querySelector('.customer-contact span:last-child').textContent.toLowerCase();
            
            // Check search term
            const matchesSearch = !searchTerm || 
                customerName.includes(searchTerm) || 
                email.includes(searchTerm) || 
                phone.includes(searchTerm);
            
            // Check filters (simplified logic)
            const matchesFilters = checkFilters(card, timeValue, statusValue, amountValue);
            
            if (matchesSearch && matchesFilters) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateResultsCount(visibleCount);
        
        if (visibleCount === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }
    }
    
    function checkFilters(card, timeValue, statusValue, amountValue) {
        // Simplified filter logic - in real app would check actual data
        
        if (timeValue) {
            // Check time filter against order dates
            // This would normally check against actual order data
        }
        
        if (statusValue) {
            // Check status filter against order statuses
            const hasMatchingStatus = card.querySelector(`.status.${statusValue}`);
            if (!hasMatchingStatus) return false;
        }
        
        if (amountValue) {
            // Check amount filter against total spending
            const totalSpent = parseFloat(card.querySelectorAll('.stat-value')[1].textContent.replace(/[^\d.]/g, ''));
            
            switch (amountValue) {
                case 'under_1m':
                    if (totalSpent >= 1000000) return false;
                    break;
                case '1m_5m':
                    if (totalSpent < 1000000 || totalSpent > 5000000) return false;
                    break;
                case '5m_10m':
                    if (totalSpent < 5000000 || totalSpent > 10000000) return false;
                    break;
                case '10m_20m':
                    if (totalSpent < 10000000 || totalSpent > 20000000) return false;
                    break;
                case 'over_20m':
                    if (totalSpent < 20000000) return false;
                    break;
            }
        }
        
        return true;
    }
    
    function updateResultsCount(count) {
        const existingCount = document.querySelector('.results-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        if (count > 0) {
            const countEl = document.createElement('div');
            countEl.className = 'results-count';
            countEl.innerHTML = `<small>Hiển thị ${count} khách hàng</small>`;
            countEl.style.cssText = 'color: #6b7280; font-size: 0.8rem; margin-top: 12px; text-align: center;';
            document.querySelector('.search-filter-section').appendChild(countEl);
        }
    }
    
    function showEmptyState() {
        const existingEmpty = document.querySelector('.empty-state');
        if (existingEmpty) return;
        
        const emptyHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: #6b7280;">
                <div style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;">
                    <i class="fas fa-search"></i>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 8px; color: #374151;">Không tìm thấy khách hàng</h3>
                <p style="margin-bottom: 24px; font-size: 1rem;">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button class="btn-primary" onclick="clearFilters()" style="padding: 10px 20px; border-radius: 6px;">
                    <i class="fas fa-undo"></i> Xóa bộ lọc
                </button>
            </div>
        `;
        
        customerContainer.insertAdjacentHTML('afterend', emptyHTML);
    }
    
    function hideEmptyState() {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }
    
    function toggleView(view) {
        viewBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        const customerCards = document.querySelectorAll('.customer-card');
        
        if (view === 'grid') {
            customerContainer.style.display = 'grid';
            customerContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
            customerContainer.style.gap = '20px';
            
            customerCards.forEach(card => {
                card.style.marginBottom = '0';
            });
        } else {
            customerContainer.style.display = 'block';
            customerContainer.style.gridTemplateColumns = 'none';
            customerContainer.style.gap = 'normal';
            
            customerCards.forEach(card => {
                card.style.marginBottom = '16px';
            });
        }
        
        showNotification(`Đã chuyển sang chế độ ${view === 'grid' ? 'lưới' : 'danh sách'}`, 'info');
    }
    
    function showAdvancedSearch() {
        const advancedOptions = [
            'Tìm theo khoảng thời gian cụ thể',
            'Lọc theo loại sản phẩm đã mua',
            'Tìm theo phương thức thanh toán',
            'Lọc theo địa chỉ giao hàng',
            'Tìm theo mã giảm giá đã sử dụng'
        ];
        
        showNotification('Đang mở tìm kiếm nâng cao...', 'info');
        // In real app, would show advanced search modal
        console.log('Advanced search options:', advancedOptions);
    }
    
    function exportCustomerData() {
        const visibleCustomers = document.querySelectorAll('.customer-card[style*="display: block"], .customer-card:not([style*="display: none"])');
        
        showNotification(`Đang xuất dữ liệu ${visibleCustomers.length} khách hàng...`, 'info');
        
        // Simulate export process
        setTimeout(() => {
            showNotification('Đã xuất báo cáo khách hàng thành công!', 'success');
        }, 2000);
    }
    
    function animateAnalytics() {
        // Animate progress bars and charts
        const progressFills = document.querySelectorAll('.progress-fill');
        const bars = document.querySelectorAll('.mini-chart .bar');
        
        setTimeout(() => {
            progressFills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            });
            
            bars.forEach((bar, index) => {
                const height = bar.style.height;
                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.height = height;
                }, 100 + index * 50);
            });
        }, 500);
    }
    
    function setupNotifications() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }
    
    function showNotification(message, type = 'info') {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const colors = {
            success: '#10b981',
            error: '#dc2626',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        
        notification.innerHTML = `
            <div style="
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid ${colors[type]};
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease;
            ">
                <i class="${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i>
                <span style="flex: 1; color: #374151; font-size: 0.9rem;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
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
}

// Global functions for modal actions
function clearFilters() {
    document.getElementById('customerSearch').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('amountFilter').value = '';
    
    const customerCards = document.querySelectorAll('.customer-card');
    customerCards.forEach(card => {
        card.style.display = 'block';
    });
    
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.remove();
    }
    
    // Show notification
    const container = document.querySelector('.notification-container');
    if (container) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #10b981;
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.2rem;"></i>
                <span style="flex: 1; color: #374151; font-size: 0.9rem;">Đã xóa tất cả bộ lọc</span>
            </div>
        `;
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

function sendEmailToCustomerById(customerId) {
    console.log('Sending email to customer:', customerId);
}

function exportCustomerReport(customerId) {
    console.log('Exporting report for customer:', customerId);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification-container * {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
