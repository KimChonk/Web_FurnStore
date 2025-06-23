# FurniStore - User Management System

## Tổng quan dự án
FurniStore là một hệ thống quản lý cửa hàng nội thất với giao diện web hiện đại, tông màu trắng-đỏ. Hệ thống bao gồm các module quản lý hoàn trả, khuyến mãi, nhân viên, và lịch sử khách hàng.

## Cấu trúc thư mục
```
UI/
├── index.html                  # Trang chủ chính
├── refund.html                 # Quản lý hoàn trả/hoàn tiền
├── promotion.html              # Quản lý khuyến mãi
├── user-profile.html           # Hồ sơ người dùng
├── staff-management.html       # Quản lý nhân viên (Admin)
├── customer-history.html       # Lịch sử khách hàng
├── css/
│   ├── style.css              # CSS chính (theme trắng-đỏ)
│   ├── refund.css             # CSS cho module hoàn trả
│   ├── promotion.css          # CSS cho module khuyến mãi
│   ├── user-profile.css       # CSS cho profile user
│   ├── staff-management.css   # CSS cho quản lý nhân viên
│   └── customer-history.css   # CSS cho lịch sử khách hàng
├── js/
│   ├── script.js              # JavaScript chính
│   ├── refund.js              # JS cho module hoàn trả
│   ├── promotion.js           # JS cho module khuyến mãi
│   ├── user-profile.js        # JS cho profile user
│   ├── staff-management.js    # JS cho quản lý nhân viên
│   └── customer-history.js    # JS cho lịch sử khách hàng
└── images/                     # Thư mục hình ảnh
```

## Các tính năng chính

### 1. Trang chủ (index.html)
- Giao diện hiện đại với tông màu trắng-đỏ
- Navigation menu với dropdown user
- Hero section, product showcase
- Responsive design
- Smooth scrolling và animations

### 2. Quản lý hoàn trả (refund.html)
- Form yêu cầu hoàn trả sản phẩm
- Tra cứu trạng thái hoàn tiền
- Hiển thị chính sách hoàn trả
- FAQ section
- Validation và notifications

### 3. Quản lý khuyến mãi (promotion.html)
- Dashboard thống kê khuyến mãi
- CRUD operations cho khuyến mãi
- Filter và search promotion
- Modal tạo/sửa khuyến mãi
- Danh sách khuyến mãi với status

### 4. Hồ sơ người dùng (user-profile.html)
- Sidebar navigation với tabs
- Quản lý thông tin cá nhân
- Cài đặt tài khoản và bảo mật
- Lịch sử hoạt động
- Modal đổi mật khẩu

### 5. Quản lý nhân viên (staff-management.html)
- Dashboard thống kê nhân viên
- CRUD operations cho staff
- Filter theo phòng ban, role, status
- View grid/list switchable
- Modal thêm/sửa nhân viên
- Bulk actions và export

### 6. Lịch sử khách hàng (customer-history.html)
- Analytics dashboard
- Danh sách khách hàng với purchase history
- Expandable order history
- Filter theo thời gian, status, amount
- Export customer data
- Order tracking và management

## Thiết kế và UX/UI

### Theme màu sắc
- **Primary Red**: #dc2626 (đỏ chính)
- **Secondary Red**: #991b1b (đỏ đậm)
- **White**: #ffffff (trắng chính)
- **Gray shades**: #f8fafc, #e5e7eb, #6b7280 (xám nhạt đến đậm)
- **Success**: #10b981 (xanh lá)
- **Warning**: #f59e0b (cam)
- **Info**: #2563eb (xanh dương)

### Components được sử dụng
- **Cards**: Box shadow, border-radius 12px
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Forms**: Validation, real-time feedback
- **Modals**: Overlay với backdrop blur
- **Tables**: Responsive, sortable, filterable
- **Charts**: Mini charts, progress bars
- **Notifications**: Toast notifications với icons
- **Dropdowns**: Smooth animations
- **Tabs**: Sidebar và horizontal tabs

### Responsive Design
- **Desktop**: Grid layouts, multiple columns
- **Tablet**: Adapted grids, collapsible sidebars
- **Mobile**: Single column, hamburger menu, touch-friendly

## JavaScript Functionality

### Các tính năng JS chính:
1. **Navigation**: Smooth scrolling, active states, dropdown toggle
2. **Forms**: Validation, submission handling, dynamic content
3. **Modals**: Open/close animations, backdrop click handling
4. **Filters**: Real-time search, multiple filter criteria
5. **Sorting**: Table/grid sorting, custom sort functions
6. **CRUD**: Create, read, update, delete operations (simulated)
7. **Notifications**: Toast system with auto-dismiss
8. **Animations**: CSS transitions, entrance animations
9. **Responsive**: Mobile menu toggle, adaptive layouts

### Pattern được sử dụng:
- **Event delegation**: Efficient event handling
- **Debouncing**: Search input optimization
- **Module pattern**: Organized code structure
- **Observer pattern**: State management
- **Template literals**: Dynamic HTML generation

## Cách sử dụng

### 1. Setup
```bash
# Chỉ cần serve các file HTML tĩnh
# Có thể dùng Live Server hoặc bất kỳ web server nào
```

### 2. Navigation
- Truy cập các module qua menu chính hoặc user dropdown
- Breadcrumb navigation cho easy navigation
- Responsive hamburger menu trên mobile

### 3. Development
```bash
# Các file CSS và JS đã được tách riêng cho từng module
# Dễ dàng maintain và extend
# Theme variables được centralized trong style.css
```

## Browser Support
- **Chrome**: ✅ Latest
- **Firefox**: ✅ Latest  
- **Safari**: ✅ Latest
- **Edge**: ✅ Latest
- **IE**: ❌ Not supported

## Dependencies
- **Font Awesome 6**: Icons
- **Google Fonts**: Typography (có thể thêm)
- **No frameworks**: Vanilla HTML/CSS/JS

## Features by Role

### Admin
- Full access to staff management
- Customer history và analytics
- Promotion management
- System settings

### Manager  
- Limited staff management
- Customer support tools
- Promotion oversight
- Department analytics

### Staff
- Basic customer service
- Order processing
- Refund handling
- Personal profile

### Customer
- Profile management
- Order history
- Refund requests
- Promotion viewing

## Security Considerations
- Input validation on all forms
- XSS prevention
- CSRF protection (cần implement backend)
- Role-based access control
- Secure password handling

## Performance Optimizations
- Lazy loading cho large datasets
- Debounced search inputs
- Efficient DOM manipulation
- CSS animations over JS
- Optimized images và assets

## Future Enhancements
1. **Backend Integration**: API connections
2. **Real-time Updates**: WebSocket for live data
3. **Advanced Analytics**: Charts và reporting
4. **Mobile App**: React Native/Flutter
5. **Payment Gateway**: Stripe/PayPal integration
6. **Inventory Management**: Stock tracking
7. **CRM Features**: Customer relationship tools
8. **Multi-language**: i18n support

## Maintenance
- Regular CSS/JS minification
- Image optimization
- Performance monitoring
- Browser compatibility testing
- Security updates

---

**Version**: 1.0  
**Created**: January 2025  
**Framework**: Vanilla HTML/CSS/JavaScript  
**License**: MIT
