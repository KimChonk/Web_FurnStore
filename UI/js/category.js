// Category Management JavaScript
class CategoryManager {
    constructor() {
        this.categories = this.generateSampleData();
        this.currentView = 'card';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            search: '',
            status: 'all',
            parent: 'all'
        };
        this.sortBy = 'name';
        this.selectedCategories = new Set();
        this.editingCategory = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.renderCategoryTree();
        this.updateStatistics();
        this.populateParentSelect();
        this.setupFormValidation();
    }

    generateSampleData() {
        const categories = [
            // Root categories
            {
                id: 1,
                name: 'Ghế sofa',
                slug: 'ghe-sofa',
                description: 'Các loại ghế sofa cho phòng khách',
                parentId: null,
                icon: 'fas fa-couch',
                color: '#dc2626',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: true,
                sortOrder: 1,
                productCount: 25,
                createdAt: new Date('2024-01-15'),
                metaTitle: 'Ghế Sofa Cao Cấp',
                metaDescription: 'Bộ sưu tập ghế sofa đẹp và chất lượng',
                metaKeywords: 'sofa, ghế sofa, nội thất'
            },
            {
                id: 2,
                name: 'Bàn ghế',
                slug: 'ban-ghe',
                description: 'Bàn ghế ăn, bàn làm việc',
                parentId: null,
                icon: 'fas fa-table',
                color: '#2563eb',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: true,
                sortOrder: 2,
                productCount: 18,
                createdAt: new Date('2024-01-20'),
                metaTitle: 'Bàn Ghế Cao Cấp',
                metaDescription: 'Bàn ghế đẹp cho mọi không gian',
                metaKeywords: 'bàn ghế, bàn ăn, bàn làm việc'
            },
            {
                id: 3,
                name: 'Giường ngủ',
                slug: 'giuong-ngu',
                description: 'Giường ngủ các loại',
                parentId: null,
                icon: 'fas fa-bed',
                color: '#10b981',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: false,
                sortOrder: 3,
                productCount: 12,
                createdAt: new Date('2024-02-01'),
                metaTitle: 'Giường Ngủ Hiện Đại',
                metaDescription: 'Giường ngủ thoải mái và đẹp mắt',
                metaKeywords: 'giường ngủ, nội thất phòng ngủ'
            },
            {
                id: 4,
                name: 'Tủ kệ',
                slug: 'tu-ke',
                description: 'Tủ quần áo, kệ sách, tủ tivi',
                parentId: null,
                icon: 'fas fa-archive',
                color: '#f59e0b',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: false,
                sortOrder: 4,
                productCount: 22,
                createdAt: new Date('2024-02-10'),
                metaTitle: 'Tủ Kệ Đa Năng',
                metaDescription: 'Tủ kệ thông minh cho mọi không gian',
                metaKeywords: 'tủ kệ, tủ quần áo, kệ sách'
            },
            {
                id: 5,
                name: 'Đèn trang trí',
                slug: 'den-trang-tri',
                description: 'Đèn chùm, đèn bàn, đèn tường',
                parentId: null,
                icon: 'fas fa-lightbulb',
                color: '#8b5cf6',
                image: 'https://via.placeholder.com/300x200',
                isActive: false,
                showInMenu: false,
                isFeatured: false,
                sortOrder: 5,
                productCount: 8,
                createdAt: new Date('2024-02-15'),
                metaTitle: 'Đèn Trang Trí Cao Cấp',
                metaDescription: 'Đèn trang trí đẹp cho ngôi nhà',
                metaKeywords: 'đèn trang trí, đèn chùm, đèn bàn'
            },
            // Child categories
            {
                id: 6,
                name: 'Sofa da',
                slug: 'sofa-da',
                description: 'Sofa làm từ da thật cao cấp',
                parentId: 1,
                icon: 'fas fa-couch',
                color: '#dc2626',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: true,
                sortOrder: 1,
                productCount: 15,
                createdAt: new Date('2024-01-16'),
                metaTitle: 'Sofa Da Thật Cao Cấp',
                metaDescription: 'Sofa da thật sang trọng và bền đẹp',
                metaKeywords: 'sofa da, sofa da thật'
            },
            {
                id: 7,
                name: 'Sofa vải',
                slug: 'sofa-vai',
                description: 'Sofa vải mềm mại, thoải mái',
                parentId: 1,
                icon: 'fas fa-couch',
                color: '#dc2626',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: false,
                sortOrder: 2,
                productCount: 10,
                createdAt: new Date('2024-01-17'),
                metaTitle: 'Sofa Vải Cao Cấp',
                metaDescription: 'Sofa vải mềm mại và thoải mái',
                metaKeywords: 'sofa vải, sofa nỉ'
            },
            {
                id: 8,
                name: 'Bàn ăn',
                slug: 'ban-an',
                description: 'Bàn ăn gia đình các loại',
                parentId: 2,
                icon: 'fas fa-table',
                color: '#2563eb',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: true,
                isFeatured: true,
                sortOrder: 1,
                productCount: 12,
                createdAt: new Date('2024-01-21'),
                metaTitle: 'Bàn Ăn Gia Đình',
                metaDescription: 'Bàn ăn đẹp cho gia đình',
                metaKeywords: 'bàn ăn, bàn ăn gia đình'
            },
            {
                id: 9,
                name: 'Bàn làm việc',
                slug: 'ban-lam-viec',
                description: 'Bàn làm việc văn phòng',
                parentId: 2,
                icon: 'fas fa-desktop',
                color: '#2563eb',
                image: 'https://via.placeholder.com/300x200',
                isActive: true,
                showInMenu: false,
                isFeatured: false,
                sortOrder: 2,
                productCount: 6,
                createdAt: new Date('2024-01-22'),
                metaTitle: 'Bàn Làm Việc Văn Phòng',
                metaDescription: 'Bàn làm việc hiện đại và tiện dụng',
                metaKeywords: 'bàn làm việc, bàn văn phòng'
            }
        ];

        return categories;
    }

    setupEventListeners() {
        // Search
        document.getElementById('categorySearch').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.renderCategories();
        });

        // Filters
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.currentPage = 1;
            this.renderCategories();
        });

        document.getElementById('parentFilter').addEventListener('change', (e) => {
            this.filters.parent = e.target.value;
            this.currentPage = 1;
            this.renderCategories();
        });

        // Sort
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderCategories();
        });

        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.toggle-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Select all
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close-modal') || e.target.matches('.modal-overlay')) {
                this.closeModals();
            }
        });

        // Form submission
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Icon selection
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const icon = e.target.closest('.icon-btn').dataset.icon;
                this.selectIcon(icon);
            });
        });

        // Color presets
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('categoryColor').value = color;
            });
        });

        // Image upload
        document.getElementById('categoryImage').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Auto-generate slug
        document.getElementById('categoryName').addEventListener('input', (e) => {
            this.generateSlug(e.target.value);
        });

        // Icon preview
        document.getElementById('categoryIcon').addEventListener('input', (e) => {
            this.updateIconPreview(e.target.value);
        });

        // Delete confirmation
        document.getElementById('deleteConfirmText').addEventListener('input', (e) => {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.disabled = e.target.value.toUpperCase() !== 'XÓA';
        });

        // Meta character counter
        this.setupCharacterCounters();

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderCategories();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = this.getTotalPages();
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderCategories();
            }
        });
    }

    setupFormValidation() {
        const form = document.getElementById('categoryForm');
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(field.id) {
            case 'categoryName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Tên danh mục là bắt buộc';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Tên danh mục phải có ít nhất 2 ký tự';
                } else if (this.isDuplicateName(value, this.editingCategory?.id)) {
                    isValid = false;
                    errorMessage = 'Tên danh mục đã tồn tại';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        field.classList.toggle('error', !isValid);
        
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!isValid) {
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                field.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = errorMessage;
        } else if (errorDiv) {
            errorDiv.remove();
        }
    }

    isDuplicateName(name, excludeId = null) {
        return this.categories.some(cat => 
            cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId
        );
    }

    setupCharacterCounters() {
        const fields = [
            { id: 'metaTitle', max: 60 },
            { id: 'metaDescription', max: 160 }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const help = input.parentNode.querySelector('.form-help');
            
            input.addEventListener('input', () => {
                const length = input.value.length;
                help.textContent = `${length}/${field.max} ký tự`;
                help.style.color = length > field.max ? '#dc2626' : '#64748b';
            });
        });
    }

    getFilteredCategories() {
        let filtered = [...this.categories];

        // Search filter
        if (this.filters.search) {
            filtered = filtered.filter(cat =>
                cat.name.toLowerCase().includes(this.filters.search) ||
                cat.description.toLowerCase().includes(this.filters.search)
            );
        }

        // Status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(cat =>
                this.filters.status === 'active' ? cat.isActive : !cat.isActive
            );
        }

        // Parent filter
        if (this.filters.parent !== 'all') {
            if (this.filters.parent === 'root') {
                filtered = filtered.filter(cat => !cat.parentId);
            } else if (this.filters.parent === 'child') {
                filtered = filtered.filter(cat => cat.parentId);
            }
        }

        // Sort
        this.sortCategories(filtered);

        return filtered;
    }

    sortCategories(categories) {
        switch(this.sortBy) {
            case 'name':
                categories.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                categories.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'created':
                categories.sort((a, b) => b.createdAt - a.createdAt);
                break;
            case 'created_desc':
                categories.sort((a, b) => a.createdAt - b.createdAt);
                break;
            case 'products':
                categories.sort((a, b) => b.productCount - a.productCount);
                break;
            case 'order':
                categories.sort((a, b) => a.sortOrder - b.sortOrder);
                break;
        }
    }

    renderCategories() {
        const filteredCategories = this.getFilteredCategories();
        const totalPages = Math.ceil(filteredCategories.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageCategories = filteredCategories.slice(startIndex, endIndex);

        if (this.currentView === 'card') {
            this.renderCardView(pageCategories);
        } else if (this.currentView === 'table') {
            this.renderTableView(pageCategories);
        } else if (this.currentView === 'tree') {
            this.renderTreeView();
        }

        this.updatePagination(totalPages);
        this.updateBulkActions();
    }

    renderCardView(categories) {
        const container = document.getElementById('cardView');
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <h3>Không có danh mục nào</h3>
                    <p>Không tìm thấy danh mục nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => this.createCategoryCard(category)).join('');
    }

    createCategoryCard(category) {
        const parent = category.parentId ? 
            this.categories.find(c => c.id === category.parentId)?.name : 'Danh mục gốc';

        return `
            <div class="category-card ${!category.isActive ? 'inactive' : ''}" data-id="${category.id}">
                <div class="category-image">
                    ${category.image ? 
                        `<img src="${category.image}" alt="${category.name}">` :
                        `<div class="category-image-placeholder">
                            <i class="${category.icon}"></i>
                        </div>`
                    }
                    <div class="category-status-badge ${category.isActive ? 'active' : 'inactive'}">
                        ${category.isActive ? 'Hiển thị' : 'Ẩn'}
                    </div>
                </div>
                
                <div class="category-body">
                    <div class="category-header">
                        <div class="category-title">
                            <div class="category-icon" style="background: ${category.color}">
                                <i class="${category.icon}"></i>
                            </div>
                            <h3 class="category-name">${category.name}</h3>
                        </div>
                        
                        <div class="category-dropdown">
                            <button class="dropdown-toggle" onclick="toggleDropdown(this)">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu">
                                <a href="#" onclick="editCategory(${category.id})">
                                    <i class="fas fa-edit"></i> Chỉnh sửa
                                </a>
                                <a href="#" onclick="quickEdit(${category.id})">
                                    <i class="fas fa-bolt"></i> Chỉnh sửa nhanh
                                </a>
                                <a href="#" onclick="duplicateCategory(${category.id})">
                                    <i class="fas fa-copy"></i> Nhân bản
                                </a>
                                <a href="#" onclick="toggleCategoryStatus(${category.id})">
                                    <i class="fas fa-eye${category.isActive ? '-slash' : ''}"></i> 
                                    ${category.isActive ? 'Ẩn' : 'Hiển thị'}
                                </a>
                                <a href="#" onclick="deleteCategory(${category.id})" style="color: #dc2626;">
                                    <i class="fas fa-trash"></i> Xóa
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="category-meta">
                        <p class="category-description">${category.description}</p>
                        <div class="category-stats">
                            <div class="stat-item">
                                <i class="fas fa-layer-group"></i>
                                ${parent}
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-boxes"></i>
                                ${category.productCount} sản phẩm
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="category-footer">
                    <div class="category-actions">
                        <input type="checkbox" class="bulk-checkbox" value="${category.id}" 
                               onchange="toggleCategorySelection(${category.id})">
                        <button class="action-btn" onclick="viewProducts(${category.id})" title="Xem sản phẩm">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editCategory(${category.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="category-info">
                        Tạo: ${this.formatDate(category.createdAt)}
                    </div>
                </div>
            </div>
        `;
    }

    renderTableView(categories) {
        const tbody = document.getElementById('categoryTableBody');
        
        if (categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <i class="fas fa-list"></i>
                        <div>Không có danh mục nào</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = categories.map(category => this.createTableRow(category)).join('');
    }

    createTableRow(category) {
        const parent = category.parentId ? 
            this.categories.find(c => c.id === category.parentId)?.name : '--';

        return `
            <tr data-id="${category.id}">
                <td>
                    <input type="checkbox" class="bulk-checkbox" value="${category.id}" 
                           onchange="toggleCategorySelection(${category.id})">
                </td>
                <td>
                    ${category.image ? 
                        `<img src="${category.image}" alt="${category.name}" class="table-image">` :
                        `<div class="category-icon" style="background: ${category.color}; width: 40px; height: 40px;">
                            <i class="${category.icon}"></i>
                        </div>`
                    }
                </td>
                <td>
                    <div class="table-category-name">${category.name}</div>
                    <div class="table-slug">${category.slug}</div>
                </td>
                <td>
                    <div class="table-parent">${parent}</div>
                </td>
                <td>${category.productCount}</td>
                <td>${category.sortOrder}</td>
                <td>
                    <span class="status-badge ${category.isActive ? 'active' : 'inactive'}">
                        ${category.isActive ? 'Hiển thị' : 'Ẩn'}
                    </span>
                </td>
                <td>${this.formatDate(category.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn" onclick="editCategory(${category.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="duplicateCategory(${category.id})" title="Nhân bản">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" onclick="deleteCategory(${category.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderTreeView() {
        const container = document.getElementById('categoryTreeDetailed');
        const rootCategories = this.categories.filter(cat => !cat.parentId);
        
        container.innerHTML = rootCategories.map(category => 
            this.createTreeNode(category, 0)
        ).join('');
    }

    createTreeNode(category, level) {
        const children = this.categories.filter(cat => cat.parentId === category.id);
        const hasChildren = children.length > 0;
        
        let html = `
            <div class="tree-node" style="margin-left: ${level * 2}rem;">
                <div class="tree-item">
                    ${hasChildren ? 
                        `<button class="tree-toggle" onclick="toggleTreeNode(this)">
                            <i class="fas fa-chevron-right"></i>
                        </button>` : 
                        '<div style="width: 24px;"></div>'
                    }
                    <div class="tree-icon" style="background: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="tree-content">
                        <div class="tree-name">${category.name}</div>
                        <div class="tree-meta">
                            ${category.productCount} sản phẩm • 
                            ${category.isActive ? 'Hiển thị' : 'Ẩn'}
                        </div>
                    </div>
                    <div class="tree-actions">
                        <button class="action-btn" onclick="editCategory(${category.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
        `;
        
        if (hasChildren) {
            html += `<div class="tree-children" style="display: none;">`;
            children.forEach(child => {
                html += this.createTreeNode(child, level + 1);
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }

    renderCategoryTree() {
        const container = document.getElementById('categoryTree');
        const rootCategories = this.categories.filter(cat => !cat.parentId && cat.isActive);
        
        if (rootCategories.length === 0) {
            container.innerHTML = '<p>Chưa có danh mục nào.</p>';
            return;
        }
        
        container.innerHTML = rootCategories.map(category => 
            this.createSimpleTreeNode(category)
        ).join('');
    }

    createSimpleTreeNode(category) {
        const children = this.categories.filter(cat => cat.parentId === category.id && cat.isActive);
        
        let html = `
            <div class="tree-item">
                <div class="tree-icon" style="background: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <div class="tree-content">
                    <div class="tree-name">${category.name}</div>
                    <div class="tree-meta">${category.productCount} sản phẩm</div>
                </div>
            </div>
        `;
        
        if (children.length > 0) {
            html += `<div class="tree-children">`;
            children.forEach(child => {
                html += this.createSimpleTreeNode(child);
            });
            html += `</div>`;
        }
        
        return html;
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Show/hide views
        document.getElementById('cardView').style.display = view === 'card' ? 'grid' : 'none';
        document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
        document.getElementById('treeView').style.display = view === 'tree' ? 'block' : 'none';

        this.renderCategories();
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
                        onclick="window.categoryManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        pageNumbers.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderCategories();
    }

    getTotalPages() {
        const filteredCategories = this.getFilteredCategories();
        return Math.ceil(filteredCategories.length / this.itemsPerPage);
    }

    updateStatistics() {
        const totalCategories = this.categories.length;
        const activeCategories = this.categories.filter(cat => cat.isActive).length;
        const inactiveCategories = totalCategories - activeCategories;
        const totalProducts = this.categories.reduce((sum, cat) => sum + cat.productCount, 0);

        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('activeCategories').textContent = activeCategories;
        document.getElementById('inactiveCategories').textContent = inactiveCategories;
        document.getElementById('totalProducts').textContent = totalProducts;
    }

    populateParentSelect() {
        const select = document.getElementById('parentCategory');
        const rootCategories = this.categories.filter(cat => !cat.parentId);
        
        select.innerHTML = '<option value="">-- Danh mục gốc --</option>';
        rootCategories.forEach(category => {
            select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    }

    // Category operations
    openCategoryModal(categoryId = null) {
        this.editingCategory = categoryId ? this.categories.find(c => c.id === categoryId) : null;
        
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('modalTitle');
        
        if (this.editingCategory) {
            title.textContent = 'Chỉnh sửa danh mục';
            this.populateForm(this.editingCategory);
        } else {
            title.textContent = 'Thêm danh mục mới';
            this.resetForm();
        }
        
        modal.style.display = 'flex';
    }

    populateForm(category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categorySlug').value = category.slug;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('parentCategory').value = category.parentId || '';
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('sortOrder').value = category.sortOrder;
        document.getElementById('isActive').checked = category.isActive;
        document.getElementById('showInMenu').checked = category.showInMenu;
        document.getElementById('isFeatured').checked = category.isFeatured;
        document.getElementById('metaTitle').value = category.metaTitle || '';
        document.getElementById('metaDescription').value = category.metaDescription || '';
        document.getElementById('metaKeywords').value = category.metaKeywords || '';
        
        this.updateIconPreview(category.icon);
        
        if (category.image) {
            this.showImagePreview(category.image);
        }
    }

    resetForm() {
        document.getElementById('categoryForm').reset();
        document.getElementById('sortOrder').value = 0;
        document.getElementById('categoryColor').value = '#dc2626';
        document.getElementById('categoryIcon').value = 'fas fa-couch';
        this.updateIconPreview('fas fa-couch');
        this.resetImagePreview();
    }

    saveCategory() {
        if (!this.validateForm()) {
            return;
        }

        const formData = this.getFormData();
        
        if (this.editingCategory) {
            // Update existing category
            Object.assign(this.editingCategory, formData);
            this.showNotification('Danh mục đã được cập nhật thành công!', 'success');
        } else {
            // Create new category
            const newCategory = {
                id: Date.now(),
                ...formData,
                productCount: 0,
                createdAt: new Date()
            };
            this.categories.push(newCategory);
            this.showNotification('Danh mục mới đã được tạo thành công!', 'success');
        }

        this.closeModals();
        this.renderCategories();
        this.renderCategoryTree();
        this.updateStatistics();
        this.populateParentSelect();
    }

    validateForm() {
        const form = document.getElementById('categoryForm');
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormData() {
        return {
            name: document.getElementById('categoryName').value.trim(),
            slug: document.getElementById('categorySlug').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
            parentId: document.getElementById('parentCategory').value || null,
            icon: document.getElementById('categoryIcon').value.trim(),
            color: document.getElementById('categoryColor').value,
            sortOrder: parseInt(document.getElementById('sortOrder').value) || 0,
            isActive: document.getElementById('isActive').checked,
            showInMenu: document.getElementById('showInMenu').checked,
            isFeatured: document.getElementById('isFeatured').checked,
            metaTitle: document.getElementById('metaTitle').value.trim(),
            metaDescription: document.getElementById('metaDescription').value.trim(),
            metaKeywords: document.getElementById('metaKeywords').value.trim(),
            image: this.currentImageData || null
        };
    }

    generateSlug(name) {
        const slug = name.toLowerCase()
            .replace(/đ/g, 'd')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        
        document.getElementById('categorySlug').value = slug;
    }

    selectIcon(icon) {
        document.getElementById('categoryIcon').value = icon;
        this.updateIconPreview(icon);
    }

    updateIconPreview(icon) {
        const preview = document.getElementById('iconPreview');
        preview.innerHTML = `<i class="${icon}"></i>`;
    }

    handleImageUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Vui lòng chọn file hình ảnh!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImageData = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(imageSrc) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <img src="${imageSrc}" alt="Preview" class="image-preview">
            <button type="button" class="remove-image" onclick="window.categoryManager.removeImage()">
                <i class="fas fa-times"></i>
            </button>
        `;
    }

    resetImagePreview() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `
            <i class="fas fa-image"></i>
            <p>Click để chọn hình ảnh</p>
            <small>Khuyến nghị: 300x200px, định dạng JPG/PNG</small>
        `;
        this.currentImageData = null;
    }

    removeImage() {
        this.resetImagePreview();
    }

    // Bulk operations
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.category-card .bulk-checkbox, .data-table .bulk-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const categoryId = parseInt(checkbox.value);
            if (checked) {
                this.selectedCategories.add(categoryId);
            } else {
                this.selectedCategories.delete(categoryId);
            }
        });
        this.updateBulkActions();
    }

    toggleCategorySelection(categoryId) {
        if (this.selectedCategories.has(categoryId)) {
            this.selectedCategories.delete(categoryId);
        } else {
            this.selectedCategories.add(categoryId);
        }
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkButtons = document.querySelector('.bulk-buttons');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (this.selectedCategories.size > 0) {
            bulkButtons.style.display = 'flex';
        } else {
            bulkButtons.style.display = 'none';
        }

        // Update select all checkbox state
        const totalVisible = document.querySelectorAll('.category-card, .data-table tbody tr').length;
        if (this.selectedCategories.size === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (this.selectedCategories.size === totalVisible) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
        }
    }

    bulkActivate() {
        this.selectedCategories.forEach(id => {
            const category = this.categories.find(c => c.id === id);
            if (category) category.isActive = true;
        });
        this.selectedCategories.clear();
        this.renderCategories();
        this.updateStatistics();
        this.showNotification('Đã kích hoạt các danh mục đã chọn!', 'success');
    }

    bulkDeactivate() {
        this.selectedCategories.forEach(id => {
            const category = this.categories.find(c => c.id === id);
            if (category) category.isActive = false;
        });
        this.selectedCategories.clear();
        this.renderCategories();
        this.updateStatistics();
        this.showNotification('Đã ẩn các danh mục đã chọn!', 'success');
    }

    bulkDelete() {
        if (confirm(`Bạn có chắc chắn muốn xóa ${this.selectedCategories.size} danh mục đã chọn?`)) {
            this.categories = this.categories.filter(cat => !this.selectedCategories.has(cat.id));
            this.selectedCategories.clear();
            this.renderCategories();
            this.renderCategoryTree();
            this.updateStatistics();
            this.populateParentSelect();
            this.showNotification('Đã xóa các danh mục đã chọn!', 'success');
        }
    }

    // Individual operations
    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    quickEdit(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        document.getElementById('quickEditName').value = category.name;
        document.getElementById('quickEditStatus').value = category.isActive ? 'active' : 'inactive';
        document.getElementById('quickEditOrder').value = category.sortOrder;
        
        this.editingCategory = category;
        document.getElementById('quickEditModal').style.display = 'flex';
    }

    saveQuickEdit() {
        if (!this.editingCategory) return;

        this.editingCategory.name = document.getElementById('quickEditName').value.trim();
        this.editingCategory.isActive = document.getElementById('quickEditStatus').value === 'active';
        this.editingCategory.sortOrder = parseInt(document.getElementById('quickEditOrder').value) || 0;

        this.closeModals();
        this.renderCategories();
        this.renderCategoryTree();
        this.updateStatistics();
        this.showNotification('Danh mục đã được cập nhật!', 'success');
    }

    duplicateCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        const duplicated = {
            ...category,
            id: Date.now(),
            name: category.name + ' (Copy)',
            slug: category.slug + '-copy',
            createdAt: new Date(),
            productCount: 0
        };

        this.categories.push(duplicated);
        this.renderCategories();
        this.renderCategoryTree();
        this.updateStatistics();
        this.populateParentSelect();
        this.showNotification('Đã nhân bản danh mục thành công!', 'success');
    }

    toggleCategoryStatus(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            category.isActive = !category.isActive;
            this.renderCategories();
            this.renderCategoryTree();
            this.updateStatistics();
            this.showNotification(
                `Danh mục đã được ${category.isActive ? 'kích hoạt' : 'ẩn'}!`, 
                'success'
            );
        }
    }

    deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        document.getElementById('deleteCategoryName').textContent = category.name;
        document.getElementById('deleteConfirmText').value = '';
        document.getElementById('confirmDeleteBtn').disabled = true;
        
        this.deletingCategoryId = categoryId;
        document.getElementById('deleteModal').style.display = 'flex';
    }

    confirmDelete() {
        if (!this.deletingCategoryId) return;

        // Remove category and its children
        this.categories = this.categories.filter(cat => 
            cat.id !== this.deletingCategoryId && cat.parentId !== this.deletingCategoryId
        );

        this.closeModals();
        this.renderCategories();
        this.renderCategoryTree();
        this.updateStatistics();
        this.populateParentSelect();
        this.showNotification('Danh mục đã được xóa thành công!', 'success');
    }

    // Utility functions
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.editingCategory = null;
        this.deletingCategoryId = null;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN').format(date);
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
}

// Global functions for inline event handlers
function openCategoryModal() {
    window.categoryManager.openCategoryModal();
}

function editCategory(categoryId) {
    window.categoryManager.editCategory(categoryId);
}

function quickEdit(categoryId) {
    window.categoryManager.quickEdit(categoryId);
}

function saveQuickEdit() {
    window.categoryManager.saveQuickEdit();
}

function duplicateCategory(categoryId) {
    window.categoryManager.duplicateCategory(categoryId);
}

function toggleCategoryStatus(categoryId) {
    window.categoryManager.toggleCategoryStatus(categoryId);
}

function deleteCategory(categoryId) {
    window.categoryManager.deleteCategory(categoryId);
}

function confirmDelete() {
    window.categoryManager.confirmDelete();
}

function toggleCategorySelection(categoryId) {
    window.categoryManager.toggleCategorySelection(categoryId);
}

function toggleSelectAll() {
    const checkbox = document.getElementById('selectAll');
    window.categoryManager.toggleSelectAll(checkbox.checked);
}

function bulkActivate() {
    window.categoryManager.bulkActivate();
}

function bulkDeactivate() {
    window.categoryManager.bulkDeactivate();
}

function bulkDelete() {
    window.categoryManager.bulkDelete();
}

function toggleDropdown(btn) {
    const dropdown = btn.nextElementSibling;
    dropdown.classList.toggle('show');
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        if (menu !== dropdown) {
            menu.classList.remove('show');
        }
    });
}

function toggleTreeNode(btn) {
    const icon = btn.querySelector('i');
    const children = btn.closest('.tree-node').querySelector('.tree-children');
    
    if (children) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            icon.className = 'fas fa-chevron-down';
        } else {
            children.style.display = 'none';
            icon.className = 'fas fa-chevron-right';
        }
    }
}

function expandAllCategories() {
    document.querySelectorAll('.tree-children').forEach(children => {
        children.style.display = 'block';
    });
    document.querySelectorAll('.tree-toggle i').forEach(icon => {
        icon.className = 'fas fa-chevron-down';
    });
}

function collapseAllCategories() {
    document.querySelectorAll('.tree-children').forEach(children => {
        children.style.display = 'none';
    });
    document.querySelectorAll('.tree-toggle i').forEach(icon => {
        icon.className = 'fas fa-chevron-right';
    });
}

function exportCategories() {
    const categories = window.categoryManager.getFilteredCategories();
    
    // Create CSV content
    const headers = ['Tên danh mục', 'Slug', 'Danh mục cha', 'Mô tả', 'Số sản phẩm', 'Trạng thái', 'Ngày tạo'];
    const csvContent = [
        headers.join(','),
        ...categories.map(cat => [
            `"${cat.name}"`,
            cat.slug,
            cat.parentId ? `"${window.categoryManager.categories.find(c => c.id === cat.parentId)?.name || ''}"` : '',
            `"${cat.description}"`,
            cat.productCount,
            cat.isActive ? 'Hiển thị' : 'Ẩn',
            window.categoryManager.formatDate(cat.createdAt)
        ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh-muc-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function viewProducts(categoryId) {
    // In a real application, this would navigate to products page with category filter
    window.categoryManager.showNotification('Chức năng xem sản phẩm sẽ được triển khai!', 'info');
}

function saveDraft() {
    const formData = window.categoryManager.getFormData();
    localStorage.setItem('categoryDraft', JSON.stringify(formData));
    window.categoryManager.showNotification('Đã lưu nháp!', 'success');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.category-dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.categoryManager = new CategoryManager();
});
