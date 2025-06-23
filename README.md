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
├── delivery.html               # Dashboard giao hàng
├── delivery-history.html       # Lịch sử giao hàng
├── emergency-report.html       # Báo cáo sự cố khẩn cấp
├── category.html               # Quản lý danh mục sản phẩm
├── css/
│   ├── style.css              # CSS chính (theme trắng-đỏ)
│   ├── refund.css             # CSS cho module hoàn trả
│   ├── promotion.css          # CSS cho module khuyến mãi
│   ├── user-profile.css       # CSS cho profile user
│   ├── staff-management.css   # CSS cho quản lý nhân viên
│   ├── customer-history.css   # CSS cho lịch sử khách hàng
│   ├── delivery.css           # CSS cho hệ thống giao hàng
│   └── category.css           # CSS cho quản lý danh mục
├── js/
│   ├── script.js              # JavaScript chính
│   ├── refund.js              # JS cho module hoàn trả
│   ├── promotion.js           # JS cho module khuyến mãi
│   ├── user-profile.js        # JS cho profile user
│   ├── staff-management.js    # JS cho quản lý nhân viên
│   ├── customer-history.js    # JS cho lịch sử khách hàng
│   ├── delivery.js            # JS cho dashboard giao hàng
│   ├── delivery-history.js    # JS cho lịch sử giao hàng
│   ├── emergency-report.js    # JS cho báo cáo sự cố
│   └── category.js            # JS cho quản lý danh mục
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

### 7. Hệ thống quản lý giao hàng (Delivery Management)

#### 7.1. Dashboard giao hàng (delivery.html)
- **Status Bar**: Thống kê tổng quan (chờ xử lý, đang giao, hoàn thành, thất bại)
- **Quick Actions**: Các thao tác nhanh cho shipper
- **Delivery List**: Danh sách đơn hàng với filter theo trạng thái
- **Real-time Updates**: Cập nhật trạng thái đơn hàng theo thời gian thực
- **Modal xác nhận**: Giao thành công với upload ảnh minh chứng
- **Modal báo cáo sự cố**: Báo cáo lỗi với mô tả chi tiết

#### 7.2. Lịch sử giao hàng (delivery-history.html)
- **Statistics Cards**: Thống kê hiệu suất giao hàng
- **Advanced Filters**: Lọc theo thời gian, trạng thái, khách hàng
- **View Toggle**: Chuyển đổi giữa card view và table view
- **Performance Charts**: Biểu đồ hiệu suất với Chart.js
- **Export Functionality**: Xuất báo cáo CSV
- **Detailed View**: Modal chi tiết từng đơn hàng

#### 7.3. Báo cáo sự cố khẩn cấp (emergency-report.html)
- **Quick Emergency Buttons**: Các nút báo cáo sự cố nhanh
- **Comprehensive Form**: Form báo cáo chi tiết với validation
- **GPS Location**: Tự động lấy vị trí GPS hiện tại
- **Photo/Video Upload**: Upload bằng chứng đa phương tiện
- **Emergency Guidelines**: Hướng dẫn xử lý sự cố
- **Auto-save Draft**: Tự động lưu nháp báo cáo
- **Recent Reports**: Hiển thị các báo cáo gần đây

### 8. Quản lý danh mục sản phẩm (Category Management - category.html)

#### 8.1. Tính năng chính
- **Dashboard Statistics**: Thống kê tổng quan (tổng danh mục, đang hiển thị, đã ẩn, tổng sản phẩm)
- **Category Tree View**: Hiển thị cây danh mục với khả năng expand/collapse
- **Multi-view Display**: 3 chế độ xem (Card, Table, Tree) với toggle linh hoạt
- **Advanced CRUD**: Tạo, đọc, cập nhật, xóa danh mục với validation đầy đủ
- **Hierarchical Structure**: Hỗ trợ danh mục cha-con không giới hạn cấp độ
- **Bulk Operations**: Thao tác hàng loạt (hiển thị/ẩn/xóa nhiều danh mục)

#### 8.2. Tính năng nâng cao
- **Smart Search & Filter**: Tìm kiếm thông minh với filter theo trạng thái, danh mục cha
- **Flexible Sorting**: Sắp xếp theo tên, ngày tạo, số sản phẩm, thứ tự hiển thị
- **Rich Category Editor**: Form chi tiết với hình ảnh, icon, màu sắc, SEO
- **Quick Edit Modal**: Chỉnh sửa nhanh các thông tin cơ bản
- **Draft Auto-save**: Tự động lưu nháp khi soạn thảo
- **Export/Import**: Xuất dữ liệu CSV, nhập từ file

#### 8.3. UI/UX Features
- **Responsive Design**: Tối ưu cho mobile, tablet, desktop
- **Modern Interface**: Card-based design với hover effects
- **Color-coded Categories**: Mỗi danh mục có màu sắc riêng biệt
- **Icon Integration**: FontAwesome icons cho visual appeal
- **Smooth Animations**: Transition effects cho user experience
- **Toast Notifications**: Thông báo real-time cho các thao tác

#### 8.4. Technical Features
- **Form Validation**: Validation real-time với error handling
- **Image Upload**: Preview và upload hình ảnh danh mục
- **SEO Optimization**: Meta title, description, keywords cho mỗi danh mục
- **Pagination**: Phân trang cho large datasets
- **Local Storage**: Lưu draft và user preferences
- **Data Export**: Export CSV với full category data

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
