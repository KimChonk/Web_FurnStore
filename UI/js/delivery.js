// Delivery Management JavaScript
class DeliveryManager {
    constructor() {
        this.deliveries = this.generateSampleData();
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDeliveries();
        this.updateStatusCounts();
        this.setupNotifications();
    }

    generateSampleData() {
        const statuses = ['assigned', 'in-transit', 'delivered', 'failed', 'pending'];
        const customers = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Hoàng Thị E'];
        const addresses = [
            '123 Đường ABC, Quận 1, TP.HCM',
            '456 Đường XYZ, Quận 2, TP.HCM', 
            '789 Đường DEF, Quận 3, TP.HCM',
            '321 Đường GHI, Quận 4, TP.HCM',
            '654 Đường JKL, Quận 5, TP.HCM'
        ];

        return Array.from({length: 15}, (_, i) => ({
            id: `DH${String(i + 1).padStart(3, '0')}`,
            customer: customers[Math.floor(Math.random() * customers.length)],
            phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            address: addresses[Math.floor(Math.random() * addresses.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
            assignedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            scheduledTime: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000),
            items: Math.floor(Math.random() * 5) + 1,
            value: Math.floor(Math.random() * 5000000) + 500000,
            notes: '',
            proofImages: [],
            shipper: 'Bạn'
        }));
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-accept')) {
                this.acceptDelivery(e.target.dataset.id);
            } else if (e.target.matches('.btn-start')) {
                this.startDelivery(e.target.dataset.id);
            } else if (e.target.matches('.btn-success')) {
                this.openSuccessModal(e.target.dataset.id);
            } else if (e.target.matches('.btn-report')) {
                this.openFailureModal(e.target.dataset.id);
            } else if (e.target.matches('.btn-details')) {
                this.viewDetails(e.target.dataset.id);
            }
        });

        // Modal handlers
        this.setupModalHandlers();
    }

    setupModalHandlers() {
        // Success modal
        const successForm = document.getElementById('successForm');
        if (successForm) {
            successForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSuccessSubmit();
            });
        }

        // Failure modal
        const failureForm = document.getElementById('failureForm');
        if (failureForm) {
            failureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFailureSubmit();
            });
        }

        // Photo upload
        const photoInput = document.getElementById('proofPhotos');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e.target.files);
            });
        }

        // Close modal buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                this.closeModals();
            }
        });
    }

    handleFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.renderDeliveries();
    }

    handleSort(sortType) {
        this.currentSort = sortType;
        this.renderDeliveries();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase();
        this.renderDeliveries();
    }

    getFilteredDeliveries() {
        let filtered = [...this.deliveries];

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(delivery => delivery.status === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(delivery => 
                delivery.id.toLowerCase().includes(this.searchQuery) ||
                delivery.customer.toLowerCase().includes(this.searchQuery) ||
                delivery.address.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply sorting
        switch(this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => b.assignedDate - a.assignedDate);
                break;
            case 'oldest':
                filtered.sort((a, b) => a.assignedDate - b.assignedDate);
                break;
            case 'priority':
                const priorityOrder = {high: 3, medium: 2, low: 1};
                filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'scheduled':
                filtered.sort((a, b) => a.scheduledTime - b.scheduledTime);
                break;
        }

        return filtered;
    }

    renderDeliveries() {
        const container = document.getElementById('deliveryList');
        if (!container) return;

        const deliveries = this.getFilteredDeliveries();
        
        if (deliveries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-truck"></i>
                    <h3>Không có đơn hàng</h3>
                    <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = deliveries.map(delivery => this.createDeliveryCard(delivery)).join('');
    }

    createDeliveryCard(delivery) {
        const statusConfig = this.getStatusConfig(delivery.status);
        const priorityClass = `priority-${delivery.priority}`;
        
        return `
            <div class="delivery-card ${delivery.status}" data-id="${delivery.id}">
                <div class="delivery-header">
                    <div class="delivery-id">
                        <span class="id-label">#${delivery.id}</span>
                        <span class="status-badge ${delivery.status}">${statusConfig.label}</span>
                        <span class="priority-badge ${priorityClass}">${this.getPriorityLabel(delivery.priority)}</span>
                    </div>
                    <div class="delivery-time">
                        <i class="fas fa-clock"></i>
                        ${this.formatScheduledTime(delivery.scheduledTime)}
                    </div>
                </div>

                <div class="delivery-body">
                    <div class="customer-info">
                        <h4><i class="fas fa-user"></i> ${delivery.customer}</h4>
                        <p><i class="fas fa-phone"></i> ${delivery.phone}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${delivery.address}</p>
                    </div>

                    <div class="delivery-details">
                        <div class="detail-item">
                            <span class="label">Số món:</span>
                            <span class="value">${delivery.items} sản phẩm</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Giá trị:</span>
                            <span class="value">${this.formatCurrency(delivery.value)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Ngày phân công:</span>
                            <span class="value">${this.formatDate(delivery.assignedDate)}</span>
                        </div>
                    </div>
                </div>

                <div class="delivery-actions">
                    ${this.getActionButtons(delivery)}
                </div>
            </div>
        `;
    }

    getStatusConfig(status) {
        const configs = {
            pending: { label: 'Chờ xử lý', color: '#f59e0b' },
            assigned: { label: 'Đã phân công', color: '#2563eb' },
            'in-transit': { label: 'Đang giao', color: '#8b5cf6' },
            delivered: { label: 'Đã giao', color: '#10b981' },
            failed: { label: 'Thất bại', color: '#dc2626' }
        };
        return configs[status] || configs.pending;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Thấp',
            medium: 'Trung bình', 
            high: 'Cao'
        };
        return labels[priority] || 'Thấp';
    }

    getActionButtons(delivery) {
        switch(delivery.status) {
            case 'assigned':
                return `
                    <button class="action-btn btn-accept" data-id="${delivery.id}">
                        <i class="fas fa-check"></i> Nhận đơn
                    </button>
                    <button class="action-btn btn-details" data-id="${delivery.id}">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            case 'in-transit':
                return `
                    <button class="action-btn btn-success" data-id="${delivery.id}">
                        <i class="fas fa-check-circle"></i> Giao thành công
                    </button>
                    <button class="action-btn btn-report" data-id="${delivery.id}">
                        <i class="fas fa-exclamation-triangle"></i> Báo cáo sự cố
                    </button>
                    <button class="action-btn btn-details" data-id="${delivery.id}">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            case 'pending':
                return `
                    <button class="action-btn btn-start" data-id="${delivery.id}">
                        <i class="fas fa-play"></i> Bắt đầu giao
                    </button>
                    <button class="action-btn btn-details" data-id="${delivery.id}">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
            default:
                return `
                    <button class="action-btn btn-details" data-id="${delivery.id}">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                `;
        }
    }

    acceptDelivery(deliveryId) {
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            delivery.status = 'in-transit';
            this.renderDeliveries();
            this.updateStatusCounts();
            this.showNotification('Đã nhận đơn hàng thành công!', 'success');
        }
    }

    startDelivery(deliveryId) {
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            delivery.status = 'in-transit';
            this.renderDeliveries();
            this.updateStatusCounts();
            this.showNotification('Đã bắt đầu giao hàng!', 'success');
        }
    }

    openSuccessModal(deliveryId) {
        this.currentDeliveryId = deliveryId;
        const modal = document.getElementById('successModal');
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        
        if (modal && delivery) {
            document.getElementById('successDeliveryId').textContent = delivery.id;
            document.getElementById('successCustomer').textContent = delivery.customer;
            modal.style.display = 'flex';
        }
    }

    openFailureModal(deliveryId) {
        this.currentDeliveryId = deliveryId;
        const modal = document.getElementById('failureModal');
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        
        if (modal && delivery) {
            document.getElementById('failureDeliveryId').textContent = delivery.id;
            document.getElementById('failureCustomer').textContent = delivery.customer;
            modal.style.display = 'flex';
        }
    }

    handleSuccessSubmit() {
        const delivery = this.deliveries.find(d => d.id === this.currentDeliveryId);
        const notes = document.getElementById('successNotes').value;
        const receiverName = document.getElementById('receiverName').value;
        
        if (delivery) {
            delivery.status = 'delivered';
            delivery.completedAt = new Date();
            delivery.receiverName = receiverName;
            delivery.successNotes = notes;
            
            this.renderDeliveries();
            this.updateStatusCounts();
            this.closeModals();
            this.showNotification('Đã xác nhận giao hàng thành công!', 'success');
        }
    }

    handleFailureSubmit() {
        const delivery = this.deliveries.find(d => d.id === this.currentDeliveryId);
        const reason = document.getElementById('failureReason').value;
        const description = document.getElementById('failureDescription').value;
        
        if (delivery && reason) {
            delivery.status = 'failed';
            delivery.failureReason = reason;
            delivery.failureDescription = description;
            delivery.failedAt = new Date();
            
            this.renderDeliveries();
            this.updateStatusCounts();
            this.closeModals();
            this.showNotification('Đã báo cáo sự cố giao hàng!', 'warning');
        }
    }

    handlePhotoUpload(files) {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-image';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        // Reset forms
        document.querySelectorAll('.modal form').forEach(form => {
            form.reset();
        });
        document.getElementById('photoPreview').innerHTML = '';
    }

    updateStatusCounts() {
        const counts = this.deliveries.reduce((acc, delivery) => {
            acc[delivery.status] = (acc[delivery.status] || 0) + 1;
            return acc;
        }, {});

        // Update status counters in UI
        Object.keys(counts).forEach(status => {
            const counter = document.querySelector(`[data-filter="${status}"] .count`);
            if (counter) {
                counter.textContent = counts[status] || 0;
            }
        });

        const totalCount = document.querySelector('[data-filter="all"] .count');
        if (totalCount) {
            totalCount.textContent = this.deliveries.length;
        }
    }

    viewDetails(deliveryId) {
        const delivery = this.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            // Create and show details modal
            this.showDeliveryDetails(delivery);
        }
    }

    showDeliveryDetails(delivery) {
        const modal = document.createElement('div');
        modal.className = 'modal detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết đơn hàng #${delivery.id}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-section">
                            <h4>Thông tin khách hàng</h4>
                            <p><strong>Tên:</strong> ${delivery.customer}</p>
                            <p><strong>SĐT:</strong> ${delivery.phone}</p>
                            <p><strong>Địa chỉ:</strong> ${delivery.address}</p>
                        </div>
                        <div class="detail-section">
                            <h4>Thông tin đơn hàng</h4>
                            <p><strong>Trạng thái:</strong> ${this.getStatusConfig(delivery.status).label}</p>
                            <p><strong>Độ ưu tiên:</strong> ${this.getPriorityLabel(delivery.priority)}</p>
                            <p><strong>Số sản phẩm:</strong> ${delivery.items}</p>
                            <p><strong>Giá trị:</strong> ${this.formatCurrency(delivery.value)}</p>
                        </div>
                        <div class="detail-section">
                            <h4>Thời gian</h4>
                            <p><strong>Ngày phân công:</strong> ${this.formatDateTime(delivery.assignedDate)}</p>
                            <p><strong>Thời gian dự kiến:</strong> ${this.formatDateTime(delivery.scheduledTime)}</p>
                            ${delivery.completedAt ? `<p><strong>Hoàn thành:</strong> ${this.formatDateTime(delivery.completedAt)}</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Auto remove modal after close
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    setupNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notifications')) {
            const container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        container.appendChild(notification);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN').format(date);
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    formatScheduledTime(date) {
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days} ngày nữa`;
        } else if (hours > 0) {
            return `${hours} giờ nữa`;
        } else if (diff > 0) {
            return 'Sắp đến';
        } else {
            return 'Đã quá hạn';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.deliveryManager = new DeliveryManager();
});

// Additional utility functions for delivery management
class DeliveryUtils {
    static getLocationCoords(address) {
        // Simulate getting coordinates from address
        // In real app, this would use Google Maps API or similar
        return {
            lat: 10.8231 + (Math.random() - 0.5) * 0.1,
            lng: 106.6297 + (Math.random() - 0.5) * 0.1
        };
    }

    static calculateDistance(coord1, coord2) {
        // Calculate distance between two coordinates
        const R = 6371; // Earth's radius in km
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static estimateDeliveryTime(distance) {
        // Estimate delivery time based on distance
        const baseTime = 30; // 30 minutes base time
        const timePerKm = 5; // 5 minutes per km
        return baseTime + (distance * timePerKm);
    }
}
