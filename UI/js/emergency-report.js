// Emergency Report Management JavaScript
class EmergencyReport {
    constructor() {
        this.reports = this.loadReports();
        this.currentDraft = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDateTime();
        this.renderRecentReports();
        this.loadDraftIfExists();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('emergencyForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Photo upload
        const photoInput = document.getElementById('evidencePhotos');
        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });

        // Drag and drop for photos
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handlePhotoUpload(e.dataTransfer.files);
        });

        uploadArea.addEventListener('click', () => {
            photoInput.click();
        });

        // Auto-save draft every 30 seconds
        setInterval(() => {
            this.autoSaveDraft();
        }, 30000);

        // Form change detection for draft saving
        form.addEventListener('input', () => {
            clearTimeout(this.draftTimer);
            this.draftTimer = setTimeout(() => {
                this.autoSaveDraft();
            }, 5000);
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                this.closeModals();
            }
        });
    }

    setCurrentDateTime() {
        const now = new Date();
        // Set to current time minus 1 minute (assuming incident just happened)
        now.setMinutes(now.getMinutes() - 1);
        
        const datetime = now.toISOString().slice(0, 16);
        document.getElementById('incidentTime').value = datetime;
    }

    quickReport(type) {
        // Auto-fill form based on incident type
        const typeSelect = document.getElementById('incidentType');
        const severitySelect = document.getElementById('severity');
        const descriptionTextarea = document.getElementById('incidentDescription');

        typeSelect.value = type;

        // Set default severity and description based on type
        const configs = {
            accident: {
                severity: 'critical',
                description: 'Xảy ra tai nạn giao thông trong quá trình giao hàng. ',
                support: ['police', 'medical', 'insurance']
            },
            theft: {
                severity: 'critical',
                description: 'Bị cướp/trộm hàng hóa và/hoặc phương tiện. ',
                support: ['police', 'replacement']
            },
            damaged: {
                severity: 'medium',
                description: 'Hàng hóa bị hỏng trong quá trình vận chuyển. ',
                support: ['replacement']
            },
            vehicle: {
                severity: 'high',
                description: 'Phương tiện giao hàng gặp sự cố kỹ thuật. ',
                support: ['vehicle', 'replacement']
            },
            weather: {
                severity: 'medium',
                description: 'Gặp điều kiện thời tiết bất lợi ảnh hưởng đến việc giao hàng. ',
                support: ['replacement']
            },
            health: {
                severity: 'critical',
                description: 'Người giao hàng gặp vấn đề sức khỏe trong quá trình làm việc. ',
                support: ['medical', 'replacement']
            },
            security: {
                severity: 'critical',
                description: 'Gặp tình huống an ninh hoặc bạo lực. ',
                support: ['police', 'medical']
            },
            other: {
                severity: 'medium',
                description: 'Sự cố khác trong quá trình giao hàng. ',
                support: []
            }
        };

        const config = configs[type];
        if (config) {
            severitySelect.value = config.severity;
            descriptionTextarea.value = config.description;
            
            // Auto-check relevant support options
            config.support.forEach(support => {
                const checkbox = document.querySelector(`input[name="supportNeeded"][value="${support}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Scroll to form
        document.querySelector('.emergency-form-section').scrollIntoView({
            behavior: 'smooth'
        });

        // Focus on description to continue
        setTimeout(() => {
            descriptionTextarea.focus();
            descriptionTextarea.setSelectionRange(descriptionTextarea.value.length, descriptionTextarea.value.length);
        }, 500);
    }

    getCurrentLocation() {
        const gpsInput = document.getElementById('gpsLocation');
        
        if (navigator.geolocation) {
            gpsInput.value = 'Đang lấy vị trí...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    gpsInput.value = `${lat}, ${lng}`;
                    
                    this.showNotification('Đã lấy vị trí GPS thành công!', 'success');
                },
                (error) => {
                    gpsInput.value = '';
                    let message = 'Không thể lấy vị trí GPS. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message += 'Vui lòng cho phép truy cập vị trí.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message += 'Thông tin vị trí không khả dụng.';
                            break;
                        case error.TIMEOUT:
                            message += 'Yêu cầu lấy vị trí đã hết thời gian.';
                            break;
                        default:
                            message += 'Đã xảy ra lỗi không xác định.';
                            break;
                    }
                    
                    this.showNotification(message, 'error');
                }
            );
        } else {
            this.showNotification('Trình duyệt không hỗ trợ GPS.', 'error');
        }
    }

    handlePhotoUpload(files) {
        const preview = document.getElementById('photoPreview');
        const maxFiles = 10;
        
        if (files.length > maxFiles) {
            this.showNotification(`Chỉ có thể tải lên tối đa ${maxFiles} ảnh.`, 'warning');
            return;
        }

        // Clear existing preview
        preview.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-image-container';
                    imgContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Evidence ${index + 1}" class="preview-image">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="image-info">
                            <small>${file.name}</small>
                        </div>
                    `;
                    preview.appendChild(imgContainer);
                };
                reader.readAsDataURL(file);
            }
        });

        this.showNotification(`Đã tải lên ${files.length} ảnh.`, 'success');
    }

    saveDraft() {
        const formData = this.getFormData();
        localStorage.setItem('emergencyReportDraft', JSON.stringify({
            data: formData,
            timestamp: new Date().toISOString()
        }));
        this.showNotification('Đã lưu nháp báo cáo.', 'success');
    }

    autoSaveDraft() {
        const formData = this.getFormData();
        if (this.hasFormData(formData)) {
            this.saveDraft();
        }
    }

    loadDraftIfExists() {
        const draft = localStorage.getItem('emergencyReportDraft');
        if (draft) {
            try {
                const parsedDraft = JSON.parse(draft);
                const draftAge = (new Date() - new Date(parsedDraft.timestamp)) / (1000 * 60); // minutes
                
                if (draftAge < 1440) { // Less than 24 hours
                    if (confirm('Có bản nháp báo cáo từ trước. Bạn có muốn khôi phục không?')) {
                        this.loadFormData(parsedDraft.data);
                        this.showNotification('Đã khôi phục bản nháp.', 'info');
                    }
                } else {
                    localStorage.removeItem('emergencyReportDraft');
                }
            } catch (e) {
                localStorage.removeItem('emergencyReportDraft');
            }
        }
    }

    getFormData() {
        const form = document.getElementById('emergencyForm');
        const formData = new FormData(form);
        const data = {};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Get individual fields that might not be in FormData
        const fields = [
            'incidentType', 'severity', 'deliveryId', 'incidentLocation', 
            'gpsLocation', 'incidentTime', 'incidentDescription', 
            'damageDescription', 'actionsTaken', 'urgencyNote',
            'reporterName', 'reporterPhone', 'alternateContact'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                data[field] = element.value;
            }
        });

        // Get support needed checkboxes
        const supportCheckboxes = document.querySelectorAll('input[name="supportNeeded"]:checked');
        data.supportNeeded = Array.from(supportCheckboxes).map(cb => cb.value);

        return data;
    }

    loadFormData(data) {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
            }
        });

        // Load support needed checkboxes
        if (data.supportNeeded) {
            data.supportNeeded.forEach(support => {
                const checkbox = document.querySelector(`input[name="supportNeeded"][value="${support}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    hasFormData(data) {
        const requiredFields = ['incidentType', 'incidentDescription', 'incidentLocation'];
        return requiredFields.some(field => data[field] && data[field].trim() !== '');
    }

    validateForm() {
        const errors = [];
        
        // Required fields
        const requiredFields = {
            'incidentType': 'Loại sự cố',
            'severity': 'Mức độ nghiêm trọng',
            'incidentLocation': 'Địa điểm sự cố',
            'incidentTime': 'Thời gian xảy ra',
            'incidentDescription': 'Mô tả chi tiết',
            'reporterName': 'Người báo cáo',
            'reporterPhone': 'Số điện thoại'
        };

        Object.keys(requiredFields).forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                errors.push(`${requiredFields[field]} là bắt buộc.`);
                element.classList.add('error');
            } else {
                element.classList.remove('error');
            }
        });

        // Phone number validation
        const phone = document.getElementById('reporterPhone').value;
        const phoneRegex = /^[0-9]{10,11}$/;
        if (phone && !phoneRegex.test(phone)) {
            errors.push('Số điện thoại không hợp lệ.');
            document.getElementById('reporterPhone').classList.add('error');
        }

        // Support needed validation
        const supportNeeded = document.querySelectorAll('input[name="supportNeeded"]:checked');
        if (supportNeeded.length === 0) {
            errors.push('Vui lòng chọn ít nhất một loại hỗ trợ cần thiết.');
        }

        return errors;
    }

    submitReport() {
        const errors = this.validateForm();
        
        if (errors.length > 0) {
            this.showNotification(errors.join('\n'), 'error');
            return;
        }

        const formData = this.getFormData();
        const reportId = this.generateReportId();
        const timestamp = new Date();

        const report = {
            id: reportId,
            timestamp: timestamp,
            data: formData,
            status: 'processing',
            priority: this.getPriorityFromSeverity(formData.severity)
        };

        // Save report
        this.reports.unshift(report);
        this.saveReports();

        // Clear draft
        localStorage.removeItem('emergencyReportDraft');

        // Show success modal
        this.showSuccessModal(reportId, timestamp);

        // Reset form
        document.getElementById('emergencyForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        this.setCurrentDateTime();

        // Render updated reports
        this.renderRecentReports();

        // Simulate sending notification to management
        this.notifyManagement(report);
    }

    generateReportId() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ER${timestamp.slice(-6)}${random}`;
    }

    getPriorityFromSeverity(severity) {
        const priorityMap = {
            'critical': 1,
            'high': 2,
            'medium': 3,
            'low': 4
        };
        return priorityMap[severity] || 3;
    }

    showSuccessModal(reportId, timestamp) {
        const modal = document.getElementById('successModal');
        document.getElementById('reportId').textContent = reportId;
        document.getElementById('reportTime').textContent = this.formatDateTime(timestamp);
        modal.style.display = 'flex';
    }

    notifyManagement(report) {
        // Simulate API call to notify management
        console.log('Emergency report submitted:', report);
        
        // In a real application, this would send notifications via:
        // - SMS to emergency contacts
        // - Email to supervisors
        // - Push notifications to management app
        // - Integration with emergency response systems
    }

    renderRecentReports() {
        const container = document.getElementById('recentReportsList');
        const recentReports = this.reports.slice(0, 5); // Show last 5 reports

        if (recentReports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Chưa có báo cáo nào gần đây.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentReports.map(report => this.createReportCard(report)).join('');
    }

    createReportCard(report) {
        const statusConfig = this.getStatusConfig(report.status);
        const severityConfig = this.getSeverityConfig(report.data.severity);

        return `
            <div class="report-card ${report.status}">
                <div class="report-header">
                    <div class="report-id">
                        <span class="id-label">#${report.id}</span>
                        <span class="status-badge ${report.status}">${statusConfig.label}</span>
                    </div>
                    <div class="report-time">
                        ${this.formatDateTime(report.timestamp)}
                    </div>
                </div>
                
                <div class="report-body">
                    <div class="report-type">
                        <i class="${this.getIncidentIcon(report.data.incidentType)}"></i>
                        <span>${this.getIncidentTypeLabel(report.data.incidentType)}</span>
                    </div>
                    
                    <div class="report-severity">
                        <span class="severity-badge ${report.data.severity}">
                            ${severityConfig.label}
                        </span>
                    </div>
                    
                    <div class="report-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${this.truncateText(report.data.incidentLocation, 50)}</span>
                    </div>
                    
                    <div class="report-description">
                        ${this.truncateText(report.data.incidentDescription, 100)}
                    </div>
                </div>
                
                <div class="report-footer">
                    <button class="btn btn-sm btn-outline" onclick="window.emergencyReport.viewReportDetails('${report.id}')">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                </div>
            </div>
        `;
    }

    getStatusConfig(status) {
        const configs = {
            processing: { label: 'Đang xử lý', color: '#f59e0b' },
            investigating: { label: 'Đang điều tra', color: '#2563eb' },
            resolved: { label: 'Đã giải quyết', color: '#10b981' },
            closed: { label: 'Đã đóng', color: '#6b7280' }
        };
        return configs[status] || configs.processing;
    }

    getSeverityConfig(severity) {
        const configs = {
            critical: { label: 'Nghiêm trọng', color: '#dc2626' },
            high: { label: 'Cao', color: '#ea580c' },
            medium: { label: 'Trung bình', color: '#d97706' },
            low: { label: 'Thấp', color: '#65a30d' }
        };
        return configs[severity] || configs.medium;
    }

    getIncidentIcon(type) {
        const icons = {
            accident: 'fas fa-car-crash',
            theft: 'fas fa-user-ninja',
            damaged: 'fas fa-box-open',
            vehicle: 'fas fa-tools',
            weather: 'fas fa-cloud-rain',
            health: 'fas fa-heartbeat',
            security: 'fas fa-shield-alt',
            customer: 'fas fa-user-times',
            other: 'fas fa-question-circle'
        };
        return icons[type] || icons.other;
    }

    getIncidentTypeLabel(type) {
        const labels = {
            accident: 'Tai nạn giao thông',
            theft: 'Bị cướp/trộm',
            damaged: 'Hàng hóa bị hỏng',
            vehicle: 'Xe bị hỏng',
            weather: 'Thời tiết xấu',
            health: 'Sự cố sức khỏe',
            security: 'An ninh/Bạo lực',
            customer: 'Sự cố với khách hàng',
            other: 'Sự cố khác'
        };
        return labels[type] || labels.other;
    }

    viewReportDetails(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            // In a real application, this would open a detailed view modal
            console.log('View report details:', report);
            alert(`Chi tiết báo cáo #${reportId}\n\nTrạng thái: ${this.getStatusConfig(report.status).label}\nLoại: ${this.getIncidentTypeLabel(report.data.incidentType)}\nMô tả: ${report.data.incidentDescription}`);
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

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

    // Storage methods
    saveReports() {
        localStorage.setItem('emergencyReports', JSON.stringify(this.reports));
    }

    loadReports() {
        const stored = localStorage.getItem('emergencyReports');
        if (stored) {
            try {
                return JSON.parse(stored).map(report => ({
                    ...report,
                    timestamp: new Date(report.timestamp)
                }));
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    // Utility methods
    formatDateTime(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Global functions
function quickReport(type) {
    window.emergencyReport.quickReport(type);
}

function getCurrentLocation() {
    window.emergencyReport.getCurrentLocation();
}

function saveDraft() {
    window.emergencyReport.saveDraft();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.emergencyReport = new EmergencyReport();
});
