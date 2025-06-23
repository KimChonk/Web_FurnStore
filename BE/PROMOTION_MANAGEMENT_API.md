# Promotion Management API Documentation

## 🎯 Promotion Management System

Hệ thống quản lý chương trình khuyến mãi toàn diện với các chức năng:

- ✅ **Promotion CRUD** - Tạo, sửa, xóa chương trình khuyến mãi
- ✅ **Promotion Display** - Hiển thị khuyến mãi cho khách hàng
- ✅ **Promotion List for Staff** - Danh sách khuyến mãi cho nhân viên
- ✅ **Code Validation** - Kiểm tra mã khuyến mãi
- ✅ **Analytics & Tracking** - Thống kê hiệu quả khuyến mãi
- ✅ **Advanced Targeting** - Nhắm đúng đối tượng khách hàng

## 🔐 Authorization

### Roles và Permissions:
- **Admin**: Toàn quyền tạo, sửa, xóa, phê duyệt promotions, xem analytics
- **Staff**: Xem danh sách promotions, validate codes, áp dụng cho đơn hàng
- **Warehouse**: Xem promotions để hỗ trợ đóng gói đơn hàng
- **Public**: Xem active promotions, validate codes

## 📋 API Endpoints

### 1. CREATE PROMOTION - Tạo chương trình khuyến mãi
```http
POST /api/promotions
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Khuyến mãi mùa hè 2025",
  "description": "Giảm giá đến 30% cho tất cả sản phẩm sofa trong tháng 6",
  "code": "SUMMER2025",
  "type": "percentage",
  "discountValue": 30,
  "maxDiscountAmount": 5000000,
  "minOrderAmount": 10000000,
  "applicableProducts": [
    {
      "categoryId": "60d5f6a5f8b4c12345678903"
    },
    {
      "productId": "60d5f6a5f8b4c12345678902"
    }
  ],
  "targetCustomers": {
    "type": "all",
    "customerTiers": ["gold", "platinum"]
  },
  "usageLimit": {
    "totalLimit": 1000,
    "perCustomerLimit": 1
  },
  "validity": {
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-06-30T23:59:59.000Z",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "conditions": {
    "dayOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "timeOfDay": {
      "startTime": "09:00",
      "endTime": "22:00"
    },
    "combinableWithOtherPromotions": false
  },
  "display": {
    "isVisible": true,
    "featuredPromotion": true,
    "displayOrder": 1,
    "bannerImage": "https://example.com/summer2025-banner.jpg",
    "badgeText": "HOT DEAL",
    "highlightColor": "#ff6b6b"
  },
  "notes": "Promotion for summer season targeting sofa categories"
}
```

**Promotion Types:**
- `percentage` - Giảm theo phần trăm
- `fixed_amount` - Giảm số tiền cố định
- `free_shipping` - Miễn phí vận chuyển
- `buy_x_get_y` - Mua X tặng Y
- `bundle` - Gói sản phẩm combo

**Response:**
```json
{
  "success": true,
  "message": "Promotion created successfully",
  "data": {
    "_id": "60d5f6a5f8b4c12345678950",
    "name": "Khuyến mãi mùa hè 2025",
    "code": "SUMMER2025",
    "type": "percentage",
    "discountValue": 30,
    "status": "draft",
    "createdBy": {
      "_id": "60d5f6a5f8b4c12345678920",
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "validity": {
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-06-30T23:59:59.000Z"
    },
    "isCurrentlyValid": false,
    "remainingUsage": 1000,
    "createdAt": "2025-06-23T17:00:00.000Z"
  }
}
```

### 2. GET ALL PROMOTIONS - Danh sách khuyến mãi (Admin/Staff)
```http
GET /api/promotions?page=1&limit=20&status=active&type=percentage&search=summer
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page`, `limit`: Phân trang
- `status`: draft, active, paused, expired, cancelled
- `type`: percentage, fixed_amount, free_shipping, buy_x_get_y, bundle
- `search`: Tìm kiếm theo tên, mô tả, code
- `startDate`, `endDate`: Lọc theo thời gian hiệu lực
- `featuredOnly`: true/false - chỉ promotions nổi bật
- `activeOnly`: true/false - chỉ promotions đang active
- `sortBy`: createdAt, updatedAt, name, validity.startDate
- `sortOrder`: asc, desc

**Response:**
```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "_id": "60d5f6a5f8b4c12345678950",
        "name": "Khuyến mãi mùa hè 2025",
        "code": "SUMMER2025",
        "type": "percentage",
        "discountValue": 30,
        "maxDiscountAmount": 5000000,
        "minOrderAmount": 10000000,
        "status": "active",
        "validity": {
          "startDate": "2025-06-01T00:00:00.000Z",
          "endDate": "2025-06-30T23:59:59.000Z"
        },
        "currentUsage": {
          "totalUsed": 45
        },
        "display": {
          "isVisible": true,
          "featuredPromotion": true,
          "displayOrder": 1,
          "badgeText": "HOT DEAL"
        },
        "performance": {
          "views": 1250,
          "clicks": 89,
          "conversions": 45,
          "revenue": 125000000,
          "conversionRate": 50.56
        },
        "isCurrentlyValid": true,
        "remainingUsage": 955,
        "createdAt": "2025-06-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 58,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. GET ACTIVE PROMOTIONS - Khuyến mãi đang hoạt động (Public)
```http
GET /api/promotions/active?featuredOnly=true&categoryId=60d5f6a5f8b4c12345678903
```

**Query Parameters:**
- `featuredOnly`: true/false - chỉ promotions nổi bật
- `customerId`: Filter promotions applicable to specific customer
- `categoryId`: Filter promotions applicable to category
- `productId`: Filter promotions applicable to product

**Response:**
```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "_id": "60d5f6a5f8b4c12345678950",
        "name": "Khuyến mãi mùa hè 2025",
        "description": "Giảm giá đến 30% cho tất cả sản phẩm sofa trong tháng 6",
        "code": "SUMMER2025",
        "type": "percentage",
        "discountValue": 30,
        "maxDiscountAmount": 5000000,
        "minOrderAmount": 10000000,
        "validity": {
          "startDate": "2025-06-01T00:00:00.000Z",
          "endDate": "2025-06-30T23:59:59.000Z"
        },
        "display": {
          "isVisible": true,
          "featuredPromotion": true,
          "displayOrder": 1,
          "bannerImage": "https://example.com/summer2025-banner.jpg",
          "badgeText": "HOT DEAL",
          "highlightColor": "#ff6b6b"
        },
        "isCurrentlyValid": true,
        "remainingUsage": 955
      }
    ],
    "total": 3
  }
}
```

### 4. GET STAFF PROMOTIONS - Danh sách cho nhân viên
```http
GET /api/promotions/staff?page=1&limit=10&status=active&search=summer
Authorization: Bearer {staff_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "_id": "60d5f6a5f8b4c12345678950",
        "name": "Khuyến mãi mùa hè 2025",
        "code": "SUMMER2025",
        "type": "percentage",
        "discountValue": 30,
        "maxDiscountAmount": 5000000,
        "minOrderAmount": 10000000,
        "validity": {
          "startDate": "2025-06-01T00:00:00.000Z",
          "endDate": "2025-06-30T23:59:59.000Z"
        },
        "display": {
          "featuredPromotion": true,
          "badgeText": "HOT DEAL"
        },
        "isCurrentlyValid": true,
        "remainingUsage": 955,
        "quickInfo": {
          "discountText": "30% off",
          "validUntil": "2025-06-30T23:59:59.000Z",
          "applicableItems": "Sofa category + 1 specific product"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 12,
      "itemsPerPage": 10
    }
  }
}
```

### 5. VALIDATE PROMOTION CODE - Kiểm tra mã khuyến mãi
```http
POST /api/promotions/validate/SUMMER2025
Content-Type: application/json
```

**Request Body:**
```json
{
  "customerId": "60d5f6a5f8b4c12345678930",
  "orderAmount": 15000000,
  "items": [
    {
      "productId": "60d5f6a5f8b4c12345678902",
      "quantity": 1,
      "price": 15000000
    }
  ]
}
```

**Response (Valid):**
```json
{
  "success": true,
  "message": "Promotion code is valid",
  "data": {
    "promotion": {
      "_id": "60d5f6a5f8b4c12345678950",
      "name": "Khuyến mãi mùa hè 2025",
      "code": "SUMMER2025",
      "type": "percentage",
      "discountValue": 30
    },
    "discount": {
      "amount": 4500000,
      "formatted": "₫4,500,000",
      "newTotal": 10500000
    },
    "remainingUsage": 955
  }
}
```

**Response (Invalid):**
```json
{
  "success": false,
  "message": "Minimum order amount of ₫10,000,000 required"
}
```

### 6. UPDATE PROMOTION - Cập nhật khuyến mãi
```http
PUT /api/promotions/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Khuyến mãi mùa hè 2025 - Extended",
  "description": "Extended summer promotion with better deals",
  "validity": {
    "endDate": "2025-07-15T23:59:59.000Z"
  },
  "display": {
    "featuredPromotion": false,
    "displayOrder": 5
  },
  "notes": "Extended promotion due to high demand"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion updated successfully",
  "data": {
    "_id": "60d5f6a5f8b4c12345678950",
    "name": "Khuyến mãi mùa hè 2025 - Extended",
    "code": "SUMMER2025",
    "validity": {
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-07-15T23:59:59.000Z"
    },
    "updatedAt": "2025-06-23T18:00:00.000Z"
  }
}
```

### 7. APPROVE PROMOTION - Phê duyệt khuyến mãi
```http
POST /api/promotions/{id}/approve
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion approved and activated successfully",
  "data": {
    "_id": "60d5f6a5f8b4c12345678950",
    "name": "Khuyến mãi mùa hè 2025",
    "status": "active",
    "approvedBy": {
      "_id": "60d5f6a5f8b4c12345678920",
      "name": "Admin User",
      "email": "admin@company.com"
    },
    "approvedAt": "2025-06-23T18:15:00.000Z"
  }
}
```

### 8. DELETE PROMOTION - Xóa khuyến mãi
```http
DELETE /api/promotions/{id}
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion deleted successfully"
}
```

### 9. TRACK PROMOTION VIEW - Theo dõi lượt xem
```http
POST /api/promotions/{id}/view
```

**Response:**
```json
{
  "success": true,
  "message": "Promotion view tracked"
}
```

### 10. GET PROMOTION ANALYTICS - Thống kê khuyến mãi
```http
GET /api/promotions/analytics?period=30days
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPromotions": 15,
      "activePromotions": 8,
      "totalViews": 45000,
      "totalClicks": 2500,
      "totalConversions": 890,
      "totalRevenue": 2250000000,
      "averageConversionRate": 35.6
    },
    "topPromotions": [
      {
        "_id": "60d5f6a5f8b4c12345678950",
        "name": "Khuyến mãi mùa hè 2025",
        "code": "SUMMER2025",
        "performance": {
          "views": 12000,
          "clicks": 890,
          "conversions": 445,
          "revenue": 1125000000,
          "conversionRate": 50.0
        },
        "currentUsage": {
          "totalUsed": 445
        }
      }
    ],
    "period": {
      "startDate": "2025-05-24T00:00:00.000Z",
      "endDate": "2025-06-23T23:59:59.000Z",
      "days": 30
    }
  }
}
```

## 🎯 Advanced Promotion Types

### 1. Buy X Get Y Promotion
```json
{
  "name": "Mua 2 Tặng 1",
  "type": "buy_x_get_y",
  "buyXGetY": {
    "buyQuantity": 2,
    "getQuantity": 1,
    "getFreeProduct": "60d5f6a5f8b4c12345678902"
  },
  "applicableProducts": [
    {"categoryId": "60d5f6a5f8b4c12345678903"}
  ]
}
```

### 2. Bundle Promotion
```json
{
  "name": "Combo Phòng Khách Hoàn Hảo",
  "type": "bundle",
  "bundleProducts": [
    {
      "productId": "60d5f6a5f8b4c12345678902",
      "quantity": 1,
      "discountedPrice": 12000000
    },
    {
      "productId": "60d5f6a5f8b4c12345678904",
      "quantity": 1,
      "discountedPrice": 3000000
    }
  ]
}
```

### 3. Free Shipping Promotion
```json
{
  "name": "Miễn Phí Vận Chuyển",
  "type": "free_shipping",
  "minOrderAmount": 5000000,
  "targetCustomers": {
    "type": "new_customers"
  }
}
```

## 🎯 Customer Targeting

### Target Customer Types:
- `all` - Tất cả khách hàng
- `new_customers` - Khách hàng mới
- `returning_customers` - Khách hàng quay lại
- `vip_customers` - Khách hàng VIP
- `specific_customers` - Khách hàng cụ thể

### Customer Tiers:
- `bronze` - Đồng
- `silver` - Bạc
- `gold` - Vàng
- `platinum` - Bạch kim

## 🔄 Complete Promotion Workflow

### Promotion Lifecycle:

**1. Create & Draft:**
```bash
# Admin creates promotion
POST /api/promotions
# Status: draft
```

**2. Review & Approve:**
```bash
# Admin reviews and approves
POST /api/promotions/{id}/approve
# Status: draft → active
```

**3. Customer Discovery:**
```bash
# Customer sees active promotions
GET /api/promotions/active?featuredOnly=true

# Customer views promotion (tracking)
POST /api/promotions/{id}/view
```

**4. Staff Application:**
```bash
# Staff validates code during checkout
POST /api/promotions/validate/{code}

# Apply discount to order
# (This would be in order creation API)
```

**5. Analytics & Optimization:**
```bash
# Review performance
GET /api/promotions/analytics

# Update based on performance
PUT /api/promotions/{id}
```

## 🛡️ Security & Validation

### Comprehensive Validation:
- ✅ Promotion code format validation (3-20 chars, alphanumeric + - _)
- ✅ Date range validation (start < end, reasonable time bounds)
- ✅ Discount value validation (percentage ≤ 100%, reasonable amounts)
- ✅ Usage limit validation (positive integers, reasonable bounds)
- ✅ Target customer validation (valid ObjectIds, tier names)
- ✅ Product/category validation (valid ObjectIds)

### Business Rules:
- ✅ Cannot modify core details of active promotions with usage
- ✅ Auto-expire promotions past end date
- ✅ Usage limit enforcement
- ✅ Customer eligibility validation
- ✅ Minimum order amount checking
- ✅ Time-based conditions (day of week, time of day)

### Performance Features:
- ✅ Database indexing on code, status, dates
- ✅ Efficient aggregation for analytics
- ✅ Pagination for large datasets
- ✅ Smart querying with populate optimization

## 📱 Frontend Integration Examples

### Customer Promotion Display:
```javascript
// Get featured promotions for homepage
const getFeaturedPromotions = async () => {
  const response = await fetch('/api/promotions/active?featuredOnly=true');
  const data = await response.json();
  return data.data.promotions;
};

// Validate promotion code at checkout
const validatePromoCode = async (code, orderData) => {
  const response = await fetch(`/api/promotions/validate/${code}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return await response.json();
};
```

### Staff Management Interface:
```javascript
// Get promotions for staff dashboard
const getStaffPromotions = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/promotions/staff?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Quick promotion lookup for order processing
const quickPromotionSearch = async (searchTerm) => {
  const response = await fetch(`/api/promotions/staff?search=${searchTerm}&limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

This comprehensive promotion management system enables sophisticated marketing campaigns with precise targeting, detailed analytics, and seamless integration across all customer touchpoints.
