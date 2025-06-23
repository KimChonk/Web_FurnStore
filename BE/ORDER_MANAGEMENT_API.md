# Order Management API Documentation

## 📦 Order Management System

Hệ thống quản lý đơn hàng đầy đủ cho cửa hàng nội thất với các chức năng:

- ✅ Tạo đơn hàng (Order Creation)
- ✅ Cập nhật trạng thái đơn hàng (Order Status Update)
- ✅ Danh sách đơn hàng cho kho (Order List for Warehouse)
- ✅ Chi tiết đơn hàng (Order Details)
- ✅ Xác nhận đơn hàng (Order Confirmation)
- ✅ Báo cáo đơn hàng (Order Reports)
- ✅ In phiếu xuất kho (Print Order Slip)

## 🔐 Authorization

### Roles và Permissions:
- **Customer**: Tạo đơn hàng, xem đơn hàng của mình
- **Warehouse**: Xem danh sách đơn hàng cần chuẩn bị, cập nhật trạng thái, in phiếu xuất kho
- **Delivery**: Xem đơn hàng được giao, cập nhật trạng thái giao hàng
- **Admin**: Toàn quyền quản lý đơn hàng, thống kê, báo cáo

## 📋 API Endpoints

### 1. CREATE ORDER - Tạo đơn hàng
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderItems": [
    {
      "product": "60d5f6a5f8b4c12345678901",
      "quantity": 2
    },
    {
      "product": "60d5f6a5f8b4c12345678902", 
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "postalCode": "70000",
    "country": "Vietnam",
    "phone": "0901234567"
  },
  "paymentMethod": "cash_on_delivery",
  "taxPrice": 0,
  "shippingPrice": 50000,
  "notes": "Ghi chú đặc biệt"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "customer": {
      "_id": "60d5f6a5f8b4c12345678900",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com"
    },
    "orderItems": [...],
    "totalPrice": 2550000,
    "status": "pending",
    "createdAt": "2025-06-23T10:30:00.000Z"
  }
}
```

### 2. GET MY ORDERS - Xem đơn hàng của khách hàng
```http
GET /api/orders/my-orders?page=1&limit=10&status=pending
Authorization: Bearer {customer_token}
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số đơn hàng mỗi trang (default: 10)
- `status`: Lọc theo trạng thái (pending, confirmed, processing, shipped, delivered, cancelled)

### 3. GET ALL ORDERS - Danh sách tất cả đơn hàng (Admin)
```http
GET /api/orders?page=1&limit=20&status=confirmed&startDate=2025-06-01&endDate=2025-06-30
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page`, `limit`: Phân trang
- `status`: Lọc theo trạng thái
- `startDate`, `endDate`: Lọc theo khoảng thời gian
- `isPaid`: Lọc theo trạng thái thanh toán (true/false)
- `isDelivered`: Lọc theo trạng thái giao hàng (true/false)
- `search`: Tìm kiếm theo tên khách hàng

### 4. GET WAREHOUSE ORDERS - Danh sách đơn hàng cho kho
```http
GET /api/orders/warehouse?page=1&limit=20
Authorization: Bearer {warehouse_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderNumber": "ORD-2025-06-ABC123",
      "customer": {
        "name": "Nguyễn Văn A",
        "phone": "0901234567"
      },
      "status": "confirmed",
      "createdAt": "2025-06-23T10:30:00.000Z",
      "itemsByCategory": {
        "Ghế": [
          {
            "name": "Ghế Sofa Da",
            "quantity": 2,
            "product": {...}
          }
        ],
        "Bàn": [...]
      }
    }
  ],
  "pagination": {...}
}
```

### 5. UPDATE ORDER STATUS - Cập nhật trạng thái đơn hàng
```http
PUT /api/orders/{orderId}/status
Authorization: Bearer {warehouse_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Đang chuẩn bị hàng"
}
```

**Valid Status Transitions:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `processing`, `cancelled`
- `processing` → `shipped`, `cancelled`
- `shipped` → `delivered`
- `delivered` → (final state)
- `cancelled` → (final state)

### 6. ASSIGN DELIVERY PERSON - Gán người giao hàng
```http
PUT /api/orders/{orderId}/assign-delivery
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "deliveryPersonId": "60d5f6a5f8b4c12345678905"
}
```

### 7. MARK ORDER AS PAID - Đánh dấu đã thanh toán
```http
PUT /api/orders/{orderId}/pay
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentResult": {
    "id": "PAY_12345",
    "status": "completed",
    "updateTime": "2025-06-23T10:30:00.000Z",
    "emailAddress": "customer@email.com"
  }
}
```

### 8. UPDATE TRACKING INFORMATION - Cập nhật thông tin vận chuyển
```http
PUT /api/orders/{orderId}/tracking
Authorization: Bearer {warehouse_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tracking": {
    "trackingNumber": "VN123456789",
    "carrier": "Giao Hàng Nhanh",
    "trackingUrl": "https://ghn.vn/tracking/VN123456789"
  }
}
```

### 9. GENERATE ORDER SLIP - Tạo phiếu xuất kho
```http
GET /api/orders/{orderId}/slip
Authorization: Bearer {warehouse_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-2025-06-ABC123",
    "orderDate": "2025-06-23T10:30:00.000Z",
    "customer": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@email.com"
    },
    "shippingAddress": {...},
    "items": [
      {
        "name": "Ghế Sofa Da",
        "sku": "SOF001",
        "quantity": 2,
        "price": 1200000,
        "total": 2400000,
        "category": "Ghế"
      }
    ],
    "summary": {
      "subtotal": 2500000,
      "taxPrice": 0,
      "shippingPrice": 50000,
      "totalPrice": 2550000
    },
    "paymentMethod": "cash_on_delivery",
    "status": "confirmed",
    "generatedAt": "2025-06-23T11:00:00.000Z",
    "generatedBy": "Warehouse Staff"
  }
}
```

### 10. GET ORDER STATISTICS - Thống kê đơn hàng
```http
GET /api/orders/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": [
      {
        "_id": "pending",
        "count": 15,
        "totalValue": 50000000
      },
      {
        "_id": "delivered",
        "count": 120,
        "totalValue": 500000000
      }
    ],
    "revenue": [
      {
        "_id": 1,
        "revenue": 100000000,
        "orderCount": 45
      },
      {
        "_id": 2,
        "revenue": 120000000,
        "orderCount": 52
      }
    ],
    "recent": [...],
    "topProducts": [
      {
        "_id": "60d5f6a5f8b4c12345678901",
        "totalQuantity": 156,
        "totalRevenue": 187200000,
        "productName": "Ghế Sofa Da"
      }
    ]
  }
}
```

## 🔍 Order Status Flow

```
PENDING (Chờ xác nhận)
    ↓ (confirm)
CONFIRMED (Đã xác nhận)
    ↓ (prepare)
PROCESSING (Đang chuẩn bị)
    ↓ (ship)
SHIPPED (Đã gửi hàng)
    ↓ (deliver)
DELIVERED (Đã giao hàng)

    ↓ (cancel - có thể từ bất kỳ trạng thái nào trước khi giao)
CANCELLED (Đã hủy)
```

## 🏢 Workflow cho các vai trò

### 👤 Customer (Khách hàng):
1. Tạo đơn hàng với `POST /api/orders`
2. Xem đơn hàng của mình với `GET /api/orders/my-orders`
3. Xem chi tiết đơn hàng với `GET /api/orders/{id}`

### 📦 Warehouse (Nhân viên kho):
1. Xem danh sách đơn hàng cần chuẩn bị: `GET /api/orders/warehouse`
2. Cập nhật trạng thái đơn hàng: `PUT /api/orders/{id}/status`
3. Cập nhật thông tin vận chuyển: `PUT /api/orders/{id}/tracking`
4. In phiếu xuất kho: `GET /api/orders/{id}/slip`

### 🚚 Delivery (Nhân viên giao hàng):
1. Xem đơn hàng được giao: `GET /api/orders` (filter by deliveryPerson)
2. Cập nhật trạng thái giao hàng: `PUT /api/orders/{id}/status`

### 👨‍💼 Admin (Quản trị viên):
1. Quản lý tất cả đơn hàng: `GET /api/orders`
2. Gán người giao hàng: `PUT /api/orders/{id}/assign-delivery`
3. Đánh dấu đã thanh toán: `PUT /api/orders/{id}/pay`
4. Xem thống kê: `GET /api/orders/stats`

## ⚠️ Error Handling

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    "Order items are required and must be a non-empty array",
    "Invalid phone number format"
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Token is not valid"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Warehouse access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

## 📊 Business Rules

### Stock Management:
- Khi tạo đơn hàng, hệ thống sẽ kiểm tra và trừ tồn kho tự động
- Khi hủy đơn hàng, hệ thống sẽ hoàn lại tồn kho

### Price Management:
- Giá sản phẩm trong đơn hàng sẽ lấy giá hiện tại tại thời điểm đặt hàng
- Sau khi tạo đơn hàng, giá không thay đổi dù giá gốc có thay đổi

### Order Number Generation:
- Format: `ORD-{YEAR}-{MONTH}-{LAST_6_CHARS_OF_ID}`
- Example: `ORD-2025-06-ABC123`

### Status Validation:
- Chỉ cho phép thay đổi trạng thái theo flow đã định
- Không thể hủy đơn hàng đã giao
- Không thể thay đổi đơn hàng đã hủy

## 🚀 Next Steps

Các chức năng có thể mở rộng thêm:
- [ ] Email notifications cho từng trạng thái đơn hàng
- [ ] SMS notifications cho khách hàng
- [ ] Integration với các đơn vị vận chuyển
- [ ] Automated status updates from delivery partners
- [ ] Return/Refund management
- [ ] Order analytics dashboard
- [ ] Bulk order operations
