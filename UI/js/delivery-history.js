// Delivery History Management JavaScript
class DeliveryHistory {
    constructor() {
        this.historyData = this.generateHistoryData();
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'card';
        this.filters = {
            dateRange: 'month',
            status: 'all',
            sortBy: 'newest'
        };
        this.searchQuery = '';
        this.performanceChart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatistics();
        this.renderHistory();
        this.initializeChart();
        this.setupDateRange();
    }

    generateHistoryData() {
        const statuses = ['delivered', 'failed', 'returned'];
        const statusWeights = [0.8, 0.15, 0.05]; // 80% success, 15% failed, 5% returned
        const customers = [
            'Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Hoàng Thị E',
            'Võ Thị F', 'Đặng Văn G', 'Bùi Thị H', 'Dương Văn I', 'Hồ Thị K'
        ];
        const addresses = [
            '123 Đường ABC, Quận 1, TP.HCM',
            '456 Đường XYZ, Quận 2, TP.HCM',
            '789 Đường DEF, Quận 3, TP.HCM',
            '321 Đường GHI, Quận 4, TP.HCM',
            '654 Đường JKL, Quận 5, TP.HCM',
            '987 Đường MNO, Quận 6, TP.HCM',
            '147 Đường PQR, Quận 7, TP.HCM',
            '258 Đường STU, Quận 8, TP.HCM',
            '369 Đường VWX, Quận 9, TP.HCM',
            '741 Đường YZ, Quận 10, TP.HCM'
        ];

        const failureReasons = [
            'Khách hàng không có mặt',
            'Địa chỉ không đúng',
            'Khách hàng từ chối nhận',
            'Không liên lạc được',
            'Thời tiết xấu',
            'Sự cố xe',
            'Hàng hóa bị hỏng'
        ];

        return Array.from({length: 150}, (_, i) => {
            const statusIndex = this.weightedRandom(statusWeights);
            const status = statuses[statusIndex];
            const assignedDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
            const deliveryTime = Math.floor(Math.random() * 180) + 20; // 20-200 minutes
            const completedDate = new Date(assignedDate.getTime() + deliveryTime * 60 * 1000);

            return {
                id: `DH${String(i + 1).padStart(3, '0')}`,
                customer: customers[Math.floor(Math.random() * customers.length)],
                phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
                address: addresses[Math.floor(Math.random() * addresses.length)],
                status: status,
                assignedDate: assignedDate,
                completedDate: completedDate,
                deliveryTime: deliveryTime,
                items: Math.floor(Math.random() * 5) + 1,
                value: Math.floor(Math.random() * 5000000) + 500000,
                rating: status === 'delivered' ? Math.floor(Math.random() * 2) + 4 : null, // 4-5 stars
                notes: status === 'delivered' ? 'Giao hàng thành công' : 
                       status === 'failed' ? failureReasons[Math.floor(Math.random() * failureReasons.length)] :
                       'Khách hàng yêu cầu hoàn trả',
                receiverName: status === 'delivered' ? customers[Math.floor(Math.random() * customers.length)] : null,
                proofImages: status === 'delivered' ? Math.floor(Math.random() * 3) + 1 : 0
            };
        }).sort((a, b) => b.completedDate - a.completedDate); // Sort by newest first
    }

    weightedRandom(weights) {
        const random = Math.random();
        let sum = 0;
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (random <= sum) return i;
        }
        return 0;
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.handleDateRangeChange(e.target.value);
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.renderHistory();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.renderHistory();
        });

        // Search
        document.getElementById('historySearch').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.renderHistory();
        });

        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.toggle-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderHistory();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = this.getTotalPages();
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderHistory();
            }
        });

        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChart(e.target.dataset.chart);
            });
        });

        // Modal handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                this.closeModals();
            }
            if (e.target.matches('.btn-detail')) {
                this.showDeliveryDetail(e.target.dataset.id);
            }
        });
    }

    handleDateRangeChange(range) {
        this.filters.dateRange = range;
        if (range === 'custom') {
            document.getElementById('dateRangeModal').style.display = 'flex';
        } else {
            this.currentPage = 1;
            this.renderHistory();
            this.updateStatistics();
        }
    }

    setupDateRange() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        document.getElementById('startDate').value = this.formatDateForInput(lastMonth);
        document.getElementById('endDate').value = this.formatDateForInput(today);
    }

    applyDateRange() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        
        if (startDate && endDate && startDate <= endDate) {
            this.customDateRange = { startDate, endDate };
            this.currentPage = 1;
            this.renderHistory();
            this.updateStatistics();
            this.closeModals();
        }
    }

    getFilteredData() {
        let filtered = [...this.historyData];

        // Date range filter
        const now = new Date();
        let startDate, endDate;

        switch(this.filters.dateRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'custom':
                if (this.customDateRange) {
                    startDate = this.customDateRange.startDate;
                    endDate = this.customDateRange.endDate;
                }
                break;
        }

        if (startDate && endDate) {
            filtered = filtered.filter(item => 
                item.completedDate >= startDate && item.completedDate <= endDate
            );
        }

        // Status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(item => item.status === this.filters.status);
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(item =>
                item.id.toLowerCase().includes(this.searchQuery) ||
                item.customer.toLowerCase().includes(this.searchQuery) ||
                item.address.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort
        switch(this.filters.sortBy) {
            case 'newest':
                filtered.sort((a, b) => b.completedDate - a.completedDate);
                break;
            case 'oldest':
                filtered.sort((a, b) => a.completedDate - b.completedDate);
                break;
            case 'value':
                filtered.sort((a, b) => b.value - a.value);
                break;
            case 'duration':
                filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
                break;
        }

        return filtered;
    }

    renderHistory() {
        const filteredData = this.getFilteredData();
        const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        if (this.currentView === 'card') {
            this.renderCardView(pageData);
        } else {
            this.renderTableView(pageData);
        }

        this.updatePagination(totalPages);
    }

    renderCardView(data) {
        const container = document.getElementById('cardView');
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Không có dữ liệu</h3>
                    <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map(item => this.createHistoryCard(item)).join('');
    }

    renderTableView(data) {
        const tbody = document.getElementById('historyTableBody');
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-history"></i>
                        <div>Không có dữ liệu</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(item => this.createTableRow(item)).join('');
    }

    createHistoryCard(item) {
        const statusConfig = this.getStatusConfig(item.status);
        const ratingStars = item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : '';

        return `
            <div class="history-card ${item.status}">
                <div class="card-header">
                    <div class="card-id">
                        <span class="id-label">#${item.id}</span>
                        <span class="status-badge ${item.status}">${statusConfig.label}</span>
                    </div>
                    <div class="card-date">
                        ${this.formatDateTime(item.completedDate)}
                    </div>
                </div>

                <div class="card-body">
                    <div class="customer-info">
                        <h4><i class="fas fa-user"></i> ${item.customer}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${this.truncateAddress(item.address)}</p>
                    </div>

                    <div class="delivery-stats">
                        <div class="stat-item">
                            <span class="label">Thời gian giao:</span>
                            <span class="value">${item.deliveryTime} phút</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">Giá trị:</span>
                            <span class="value">${this.formatCurrency(item.value)}</span>
                        </div>
                        ${item.rating ? `
                            <div class="stat-item">
                                <span class="label">Đánh giá:</span>
                                <span class="value rating">${ratingStars}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="card-notes">
                        <i class="fas fa-sticky-note"></i>
                        <span>${item.notes}</span>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="btn btn-outline btn-detail" data-id="${item.id}">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    ${item.proofImages > 0 ? `
                        <span class="proof-indicator">
                            <i class="fas fa-camera"></i> ${item.proofImages} ảnh
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createTableRow(item) {
        const statusConfig = this.getStatusConfig(item.status);
        
        return `
            <tr class="${item.status}">
                <td>
                    <span class="id-label">#${item.id}</span>
                </td>
                <td>
                    <div class="table-customer">
                        <strong>${item.customer}</strong>
                        <small>${item.phone}</small>
                    </div>
                </td>
                <td>
                    <span class="table-address" title="${item.address}">
                        ${this.truncateAddress(item.address, 30)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${item.status}">${statusConfig.label}</span>
                </td>
                <td>
                    <div class="table-time">
                        <div>${this.formatDateTime(item.completedDate)}</div>
                        <small>${item.deliveryTime} phút</small>
                    </div>
                </td>
                <td>
                    <span class="table-value">${this.formatCurrency(item.value)}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline btn-detail" data-id="${item.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Show/hide views
        if (view === 'card') {
            document.getElementById('cardView').style.display = 'grid';
            document.getElementById('tableView').style.display = 'none';
        } else {
            document.getElementById('cardView').style.display = 'none';
            document.getElementById('tableView').style.display = 'block';
        }

        this.renderHistory();
    }

    updatePagination(totalPages) {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageNumbers = document.getElementById('pageNumbers');

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;

        let paginationHTML = '';
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.deliveryHistory.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderHistory();
    }

    getTotalPages() {
        const filteredData = this.getFilteredData();
        return Math.ceil(filteredData.length / this.itemsPerPage);
    }

    updateStatistics() {
        const data = this.getFilteredData();
        
        const totalDelivered = data.filter(item => item.status === 'delivered').length;
        const totalFailed = data.filter(item => item.status === 'failed').length;
        const avgDeliveryTime = data.length > 0 ? 
            Math.round(data.reduce((sum, item) => sum + item.deliveryTime, 0) / data.length) : 0;
        const successRate = data.length > 0 ? 
            Math.round((totalDelivered / data.length) * 100) : 0;

        document.getElementById('totalDelivered').textContent = totalDelivered;
        document.getElementById('totalFailed').textContent = totalFailed;
        document.getElementById('avgDeliveryTime').textContent = avgDeliveryTime;
        document.getElementById('successRate').textContent = successRate;
    }

    initializeChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const chartData = this.getChartData('delivery');

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Biểu đồ giao hàng theo thời gian'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getChartData(type) {
        const data = this.getFilteredData();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date;
        });

        const labels = last7Days.map(date => this.formatDate(date));

        switch(type) {
            case 'delivery':
                const deliveryCounts = last7Days.map(date => {
                    return data.filter(item => 
                        this.isSameDay(item.completedDate, date)
                    ).length;
                });

                return {
                    labels: labels,
                    datasets: [{
                        label: 'Số đơn giao',
                        data: deliveryCounts,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        tension: 0.4
                    }]
                };

            case 'success':
                const successRates = last7Days.map(date => {
                    const dayData = data.filter(item => this.isSameDay(item.completedDate, date));
                    const successful = dayData.filter(item => item.status === 'delivered').length;
                    return dayData.length > 0 ? (successful / dayData.length) * 100 : 0;
                });

                return {
                    labels: labels,
                    datasets: [{
                        label: 'Tỷ lệ thành công (%)',
                        data: successRates,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                };

            case 'time':
                const avgTimes = last7Days.map(date => {
                    const dayData = data.filter(item => this.isSameDay(item.completedDate, date));
                    if (dayData.length === 0) return 0;
                    return dayData.reduce((sum, item) => sum + item.deliveryTime, 0) / dayData.length;
                });

                return {
                    labels: labels,
                    datasets: [{
                        label: 'Thời gian trung bình (phút)',
                        data: avgTimes,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4
                    }]
                };
        }
    }

    updateChart(type) {
        const newData = this.getChartData(type);
        this.performanceChart.data = newData;
        this.performanceChart.update();
    }

    showDeliveryDetail(deliveryId) {
        const delivery = this.historyData.find(item => item.id === deliveryId);
        if (!delivery) return;

        const modal = document.getElementById('detailModal');
        const content = document.getElementById('deliveryDetailContent');

        document.getElementById('detailDeliveryId').textContent = delivery.id;

        content.innerHTML = `
            <div class="detail-grid">
                <div class="detail-section">
                    <h4>Thông tin khách hàng</h4>
                    <div class="detail-item">
                        <span class="label">Tên khách hàng:</span>
                        <span class="value">${delivery.customer}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Số điện thoại:</span>
                        <span class="value">${delivery.phone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Địa chỉ:</span>
                        <span class="value">${delivery.address}</span>
                    </div>
                    ${delivery.receiverName ? `
                        <div class="detail-item">
                            <span class="label">Người nhận:</span>
                            <span class="value">${delivery.receiverName}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h4>Thông tin đơn hàng</h4>
                    <div class="detail-item">
                        <span class="label">Trạng thái:</span>
                        <span class="value">
                            <span class="status-badge ${delivery.status}">
                                ${this.getStatusConfig(delivery.status).label}
                            </span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Số sản phẩm:</span>
                        <span class="value">${delivery.items}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Giá trị:</span>
                        <span class="value">${this.formatCurrency(delivery.value)}</span>
                    </div>
                    ${delivery.rating ? `
                        <div class="detail-item">
                            <span class="label">Đánh giá:</span>
                            <span class="value rating">
                                ${'★'.repeat(delivery.rating)}${'☆'.repeat(5 - delivery.rating)}
                            </span>
                        </div>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h4>Thời gian</h4>
                    <div class="detail-item">
                        <span class="label">Ngày phân công:</span>
                        <span class="value">${this.formatDateTime(delivery.assignedDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Hoàn thành:</span>
                        <span class="value">${this.formatDateTime(delivery.completedDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Thời gian giao:</span>
                        <span class="value">${delivery.deliveryTime} phút</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Ghi chú</h4>
                    <div class="notes-content">
                        ${delivery.notes}
                    </div>
                    ${delivery.proofImages > 0 ? `
                        <div class="proof-images">
                            <h5>Ảnh minh chứng (${delivery.proofImages})</h5>
                            <div class="image-grid">
                                ${Array.from({length: delivery.proofImages}, (_, i) => `
                                    <img src="https://via.placeholder.com/150" alt="Proof ${i + 1}" class="proof-image">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Utility functions
    getStatusConfig(status) {
        const configs = {
            delivered: { label: 'Đã giao', color: '#10b981' },
            failed: { label: 'Thất bại', color: '#dc2626' },
            returned: { label: 'Hoàn trả', color: '#f59e0b' }
        };
        return configs[status] || configs.delivered;
    }

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

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    truncateAddress(address, maxLength = 40) {
        return address.length > maxLength ? address.substring(0, maxLength) + '...' : address;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}

// Export functionality
function exportHistory() {
    const data = window.deliveryHistory.getFilteredData();
    
    // Create CSV content
    const headers = ['Mã đơn', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Trạng thái', 'Hoàn thành', 'Thời gian giao (phút)', 'Giá trị', 'Ghi chú'];
    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            item.id,
            `"${item.customer}"`,
            item.phone,
            `"${item.address}"`,
            window.deliveryHistory.getStatusConfig(item.status).label,
            window.deliveryHistory.formatDateTime(item.completedDate),
            item.deliveryTime,
            item.value,
            `"${item.notes}"`
        ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lich-su-giao-hang-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Apply custom date range
function applyDateRange() {
    window.deliveryHistory.applyDateRange();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.deliveryHistory = new DeliveryHistory();
});
