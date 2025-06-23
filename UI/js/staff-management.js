// Staff Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize staff management functionality
    initStaffManagement();
});

function initStaffManagement() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');
    const roleFilter = document.getElementById('roleFilter');
    const sortSelect = document.getElementById('sortSelect');
    const viewBtns = document.querySelectorAll('.view-btn');
    const staffGrid = document.getElementById('staffGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Modal elements
    const addStaffBtn = document.getElementById('addStaffBtn');
    const staffModal = document.getElementById('staffModal');
    const closeModal = document.getElementById('closeModal');
    const staffForm = document.getElementById('staffForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Action buttons
    const bulkActionBtn = document.getElementById('bulkActionBtn');
    const exportBtn = document.getElementById('exportBtn');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    
    // Initialize functionality
    setupEventListeners();
    setupCardActions();
    setupNotifications();
    
    function setupEventListeners() {
        // Search and filter events
        searchInput.addEventListener('input', debounce(filterStaff, 300));
        departmentFilter.addEventListener('change', filterStaff);
        statusFilter.addEventListener('change', filterStaff);
        roleFilter.addEventListener('change', filterStaff);
        sortSelect.addEventListener('change', sortStaff);
        
        // View toggle events
        viewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const view = this.dataset.view;
                toggleView(view);
            });
        });
        
        // Modal events
        addStaffBtn.addEventListener('click', openAddStaffModal);
        closeModal.addEventListener('click', closeStaffModal);
        staffModal.addEventListener('click', function(e) {
            if (e.target === staffModal) closeStaffModal();
        });
        
        // Form events
        staffForm.addEventListener('submit', handleStaffSubmit);
        
        // Action button events
        bulkActionBtn.addEventListener('click', showBulkActions);
        exportBtn.addEventListener('click', exportStaffData);
        advancedFilterBtn.addEventListener('click', showAdvancedFilter);
        
        // Escape key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && staffModal.classList.contains('active')) {
                closeStaffModal();
            }
        });
    }
    
    function setupCardActions() {
        const staffCards = document.querySelectorAll('.staff-card');
        
        staffCards.forEach(card => {
            const editBtn = card.querySelector('.action-btn[title="Chỉnh sửa"]');
            const viewBtn = card.querySelector('.action-btn[title="Xem chi tiết"]');
            const toggleBtn = card.querySelector('.action-btn[title="Tạm khóa"], .action-btn[title="Kích hoạt"]');
            const approveBtn = card.querySelector('.action-btn[title="Phê duyệt"]');
            const rejectBtn = card.querySelector('.action-btn[title="Từ chối"]');
            
            if (editBtn) {
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    editStaff(card);
                });
            }
            
            if (viewBtn) {
                viewBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    viewStaffDetails(card);
                });
            }
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleStaffStatus(card);
                });
            }
            
            if (approveBtn) {
                approveBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    approveStaff(card);
                });
            }
            
            if (rejectBtn) {
                rejectBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    rejectStaff(card);
                });
            }
            
            // Click on card to view details
            card.addEventListener('click', function() {
                viewStaffDetails(card);
            });
        });
    }
    
    function filterStaff() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const departmentValue = departmentFilter.value;
        const statusValue = statusFilter.value;
        const roleValue = roleFilter.value;
        
        const staffCards = document.querySelectorAll('.staff-card');
        let visibleCount = 0;
        
        staffCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const position = card.querySelector('.staff-position').textContent.toLowerCase();
            const email = card.querySelector('.contact-link[href^="mailto:"]').textContent.toLowerCase();
            const department = card.dataset.department;
            const status = card.dataset.status;
            const role = card.dataset.role;
            
            const matchesSearch = name.includes(searchTerm) || 
                                position.includes(searchTerm) || 
                                email.includes(searchTerm);
            const matchesDepartment = !departmentValue || department === departmentValue;
            const matchesStatus = !statusValue || status === statusValue;
            const matchesRole = !roleValue || role === roleValue;
            
            if (matchesSearch && matchesDepartment && matchesStatus && matchesRole) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide empty state
        if (visibleCount === 0) {
            emptyState.style.display = 'block';
            staffGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            staffGrid.style.display = 'grid';
        }
        
        // Update results count
        updateResultsCount(visibleCount);
    }
    
    function sortStaff() {
        const sortValue = sortSelect.value;
        const staffCards = Array.from(document.querySelectorAll('.staff-card'));
        const container = staffGrid;
        
        staffCards.sort((a, b) => {
            const getStaffData = (card) => ({
                name: card.querySelector('h3').textContent,
                department: card.dataset.department,
                joinDate: card.querySelector('.stat-item .stat-value').textContent,
                performance: parseFloat(card.querySelector('.stat-value.excellent, .stat-value.good, .stat-value.average')?.textContent || '0')
            });
            
            const dataA = getStaffData(a);
            const dataB = getStaffData(b);
            
            switch (sortValue) {
                case 'name_asc':
                    return dataA.name.localeCompare(dataB.name);
                case 'name_desc':
                    return dataB.name.localeCompare(dataA.name);
                case 'department_asc':
                    return dataA.department.localeCompare(dataB.department);
                case 'performance_desc':
                    return dataB.performance - dataA.performance;
                case 'joined_desc':
                    return new Date(dataB.joinDate) - new Date(dataA.joinDate);
                case 'joined_asc':
                    return new Date(dataA.joinDate) - new Date(dataB.joinDate);
                default:
                    return 0;
            }
        });
        
        // Re-append sorted cards
        staffCards.forEach(card => container.appendChild(card));
        
        showNotification('Đã sắp xếp danh sách nhân viên', 'success');
    }
    
    function toggleView(view) {
        viewBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        if (view === 'list') {
            staffGrid.classList.add('list-view');
        } else {
            staffGrid.classList.remove('list-view');
        }
        
        showNotification(`Đã chuyển sang chế độ ${view === 'grid' ? 'lưới' : 'danh sách'}`, 'info');
    }
    
    function openAddStaffModal() {
        modalTitle.textContent = 'Thêm nhân viên mới';
        staffForm.reset();
        staffModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('staffName').focus();
        }, 100);
    }
    
    function closeStaffModal() {
        staffModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        staffForm.reset();
    }
    
    function editStaff(card) {
        const name = card.querySelector('h3').textContent;
        const position = card.querySelector('.staff-position').textContent.replace(/.*\s/, '');
        const email = card.querySelector('.contact-link[href^="mailto:"]').textContent;
        const phone = card.querySelector('.contact-link[href^="tel:"]').textContent;
        const department = card.dataset.department;
        const role = card.dataset.role;
        
        modalTitle.textContent = `Chỉnh sửa: ${name}`;
        
        // Populate form
        document.getElementById('staffName').value = name;
        document.getElementById('staffEmail').value = email;
        document.getElementById('staffPhone').value = phone;
        document.getElementById('staffPosition').value = position;
        document.getElementById('staffDepartment').value = department;
        document.getElementById('staffRole').value = role;
        
        staffModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        showNotification(`Đang chỉnh sửa thông tin ${name}`, 'info');
    }
    
    function viewStaffDetails(card) {
        const name = card.querySelector('h3').textContent;
        const position = card.querySelector('.staff-position').textContent;
        const department = card.dataset.department;
        const role = card.dataset.role;
        const status = card.dataset.status;
        
        // Create detailed view modal (simplified for demo)
        const detailsHTML = `
            <div class="staff-details-modal">
                <h3>${name}</h3>
                <p><strong>Vị trí:</strong> ${position}</p>
                <p><strong>Phòng ban:</strong> ${department}</p>
                <p><strong>Vai trò:</strong> ${role}</p>
                <p><strong>Trạng thái:</strong> ${status}</p>
            </div>
        `;
        
        showNotification(`Đang xem chi tiết ${name}`, 'info');
        // In real app, would show detailed modal or navigate to detail page
    }
    
    function toggleStaffStatus(card) {
        const name = card.querySelector('h3').textContent;
        const isActive = card.dataset.status === 'active';
        const statusIndicator = card.querySelector('.status-indicator');
        const toggleBtn = card.querySelector('.action-btn[title="Tạm khóa"], .action-btn[title="Kích hoạt"]');
        
        if (isActive) {
            card.dataset.status = 'inactive';
            card.classList.add('inactive');
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            toggleBtn.innerHTML = '<i class="fas fa-unlock"></i>';
            toggleBtn.title = 'Kích hoạt';
            showNotification(`Đã tạm khóa tài khoản ${name}`, 'warning');
        } else {
            card.dataset.status = 'active';
            card.classList.remove('inactive');
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            toggleBtn.innerHTML = '<i class="fas fa-lock"></i>';
            toggleBtn.title = 'Tạm khóa';
            showNotification(`Đã kích hoạt tài khoản ${name}`, 'success');
        }
    }
    
    function approveStaff(card) {
        const name = card.querySelector('h3').textContent;
        const statusIndicator = card.querySelector('.status-indicator');
        const statusBadge = card.querySelector('.status-badge');
        const actions = card.querySelector('.staff-actions');
        
        // Update status
        card.dataset.status = 'active';
        card.classList.remove('pending');
        statusIndicator.classList.remove('pending');
        statusIndicator.classList.add('active');
        
        if (statusBadge) {
            statusBadge.remove();
        }
        
        // Update action buttons
        actions.innerHTML = `
            <button class="action-btn" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
            </button>
            <button class="action-btn" title="Tạm khóa">
                <i class="fas fa-lock"></i>
            </button>
        `;
        
        // Re-setup action listeners for this card
        setupCardActions();
        
        showNotification(`Đã phê duyệt tài khoản ${name}`, 'success');
    }
    
    function rejectStaff(card) {
        const name = card.querySelector('h3').textContent;
        
        // Show confirmation
        if (confirm(`Bạn có chắc chắn muốn từ chối đơn ứng tuyển của ${name}?`)) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            
            setTimeout(() => {
                card.remove();
                showNotification(`Đã từ chối đơn ứng tuyển của ${name}`, 'error');
                filterStaff(); // Refresh display
            }, 300);
        }
    }
    
    function handleStaffSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(staffForm);
        const staffData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'position', 'department', 'role'];
        const missingFields = requiredFields.filter(field => !staffData[field]);
        
        if (missingFields.length > 0) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(staffData.email)) {
            showNotification('Email không hợp lệ', 'error');
            return;
        }
        
        // Simulate API call
        const submitBtn = e.target.querySelector('[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            if (modalTitle.textContent.includes('Thêm')) {
                createNewStaff(staffData);
            } else {
                updateExistingStaff(staffData);
            }
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            closeStaffModal();
        }, 1500);
    }
    
    function createNewStaff(data) {
        // In real app, this would make an API call
        const newStaffHTML = generateStaffCardHTML(data);
        staffGrid.insertAdjacentHTML('afterbegin', newStaffHTML);
        
        // Setup actions for new card
        setTimeout(() => {
            setupCardActions();
            showNotification(`Đã thêm nhân viên ${data.name} thành công`, 'success');
        }, 100);
    }
    
    function updateExistingStaff(data) {
        // In real app, this would update via API
        showNotification(`Đã cập nhật thông tin ${data.name} thành công`, 'success');
    }
    
    function generateStaffCardHTML(data) {
        const roleClasses = {
            'admin': 'admin',
            'manager': 'manager',
            'staff': 'staff',
            'intern': 'intern'
        };
        
        const departmentColors = {
            'sales': 'sales',
            'support': 'support',
            'admin': 'admin',
            'it': 'it',
            'hr': 'hr'
        };
        
        const roleClass = roleClasses[data.role] || 'staff';
        const departmentClass = departmentColors[data.department] || 'sales';
        
        return `
            <div class="staff-card ${roleClass}" data-department="${data.department}" data-status="active" data-role="${data.role}">
                <div class="staff-header">
                    <div class="staff-avatar">
                        <img src="https://via.placeholder.com/80x80/dc2626/ffffff?text=${data.name.charAt(0)}" alt="${data.name} Avatar">
                        <div class="status-indicator active"></div>
                    </div>
                    <div class="staff-actions">
                        <button class="action-btn" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" title="Tạm khóa">
                            <i class="fas fa-lock"></i>
                        </button>
                    </div>
                </div>
                <div class="staff-info">
                    <h3>${data.name}</h3>
                    <p class="staff-position">
                        <i class="fas fa-user"></i>
                        ${data.position}
                    </p>
                    <div class="staff-details">
                        <span class="department ${departmentClass}">
                            <i class="fas fa-building"></i>
                            ${data.department}
                        </span>
                        <span class="role ${roleClass}">
                            <i class="fas fa-user"></i>
                            ${data.role}
                        </span>
                    </div>
                </div>
                <div class="staff-stats">
                    <div class="stat-item">
                        <span class="stat-label">Gia nhập:</span>
                        <span class="stat-value">${new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Hiệu suất:</span>
                        <span class="stat-value">Chưa đánh giá</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Trạng thái:</span>
                        <span class="stat-value">Mới tham gia</span>
                    </div>
                </div>
                <div class="staff-contact">
                    <a href="mailto:${data.email}" class="contact-link">
                        <i class="fas fa-envelope"></i>
                        ${data.email}
                    </a>
                    ${data.phone ? `<a href="tel:${data.phone}" class="contact-link">
                        <i class="fas fa-phone"></i>
                        ${data.phone}
                    </a>` : ''}
                </div>
            </div>
        `;
    }
    
    function showBulkActions() {
        const checkedStaff = document.querySelectorAll('.staff-card input[type="checkbox"]:checked');
        
        if (checkedStaff.length === 0) {
            showNotification('Vui lòng chọn ít nhất một nhân viên', 'warning');
            return;
        }
        
        const actions = ['Xóa đã chọn', 'Gửi email hàng loạt', 'Xuất danh sách đã chọn', 'Cập nhật phòng ban'];
        const selectedAction = prompt(`Chọn thao tác cho ${checkedStaff.length} nhân viên:\n${actions.map((action, i) => `${i + 1}. ${action}`).join('\n')}`);
        
        if (selectedAction) {
            showNotification(`Đã thực hiện thao tác hàng loạt cho ${checkedStaff.length} nhân viên`, 'success');
        }
    }
    
    function exportStaffData() {
        const visibleStaff = document.querySelectorAll('.staff-card[style*="display: block"], .staff-card:not([style*="display: none"])');
        
        showNotification(`Đang xuất dữ liệu ${visibleStaff.length} nhân viên...`, 'info');
        
        // Simulate export process
        setTimeout(() => {
            showNotification('Đã xuất báo cáo thành công!', 'success');
        }, 2000);
    }
    
    function showAdvancedFilter() {
        const filters = [
            'Lương từ - đến',
            'Ngày gia nhập từ - đến', 
            'Hiệu suất từ - đến',
            'Tuổi từ - đến',
            'Kinh nghiệm từ - đến'
        ];
        
        showNotification('Đang mở bộ lọc nâng cao...', 'info');
        // In real app, would show advanced filter modal
    }
    
    function updateResultsCount(count) {
        const existingCount = document.querySelector('.results-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        if (count > 0) {
            const countEl = document.createElement('div');
            countEl.className = 'results-count';
            countEl.innerHTML = `<small>Hiển thị ${count} nhân viên</small>`;
            countEl.style.cssText = 'color: #6b7280; font-size: 0.8rem; margin-top: 8px; text-align: center;';
            document.querySelector('.toolbar').appendChild(countEl);
        }
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
