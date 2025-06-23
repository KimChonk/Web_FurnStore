# Delivery Management API Documentation

## 🚚 Delivery Management System

Hệ thống quản lý giao hàng toàn diện cho nhân viên giao hàng và quản lý với các chức năng:

- ✅ **Delivery Assignment** - Phân công giao hàng
- ✅ **Delivery List** - Danh sách đơn hàng cần giao  
- ✅ **Delivery Status Update** - Cập nhật trạng thái giao hàng
- ✅ **Delivery Success Confirmation** - Xác nhận giao hàng thành công
- ✅ **Delivery Failure Report** - Báo cáo giao hàng thất bại
- ✅ **Delivery History** - Lịch sử giao hàng
- ✅ **Emergency Incident Report** - Báo cáo sự cố khẩn cấp
- ✅ **Delivery Photo Upload** - Upload ảnh bằng chứng giao hàng

## 🔐 Authorization

### Roles và Permissions:
- **Delivery**: Xem đơn hàng được giao, cập nhật trạng thái, báo cáo sự cố
- **Admin**: Phân công đơn hàng, xem báo cáo, quản lý toàn bộ hệ thống giao hàng
- **Warehouse**: Xem trạng thái giao hàng, hỗ trợ phân công

## 📋 API Endpoints

### 1. GET MY DELIVERY ASSIGNMENTS - Danh sách đơn hàng được giao
```http
GET /api/delivery/assignments?page=1&limit=10&status=shipped
Authorization: Bearer {delivery_token}
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số đơn hàng mỗi trang (default: 10)
- `status`: Lọc theo trạng thái (shipped, out_for_delivery, delivered, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5f6a5f8b4c12345678903",
      "orderNumber": "ORD-2025-06-ABC123",
      "customer": {
        "name": "Nguyễn Văn A",
        "phone": "0901234567",
        "email": "nguyenvana@email.com"
      },
      "shippingAddress": {
        "fullName": "Nguyễn Văn A",
        "address": "123 Đường ABC",
        "city": "Hồ Chí Minh",
        "phone": "0901234567"
      },
      "orderItems": [...],
      "status": "shipped",
      "totalPrice": 2550000,
      "deliveryInfo": {
        "totalWeight": 25.5,
        "totalVolume": 0.8,
        "itemCount": 3
      },
      "tracking": {
        "trackingNumber": "VN123456789",
        "carrier": "Internal Delivery"
      },
      "createdAt": "2025-06-23T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalOrders": 47,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. GET AVAILABLE FOR DELIVERY - Đơn hàng chưa có người giao (Admin)
```http
GET /api/delivery/available?city=Hồ Chí Minh&urgency=urgent
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `city`: Lọc theo thành phố
- `urgency`: urgent (>24h), normal
- `page`, `limit`: Phân trang

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "ordersByCity": {
      "Hồ Chí Minh": [
        {
          "orderNumber": "ORD-2025-06-DEF456",
          "customer": {...},
          "isUrgent": true,
          "createdAt": "2025-06-22T08:00:00.000Z"
        }
      ],
      "Hà Nội": [...]
    },
    "pagination": {...}
  }
}
```

### 3. UPDATE DELIVERY STATUS - Cập nhật trạng thái giao hàng
```http
PUT /api/delivery/{orderId}/status
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "out_for_delivery",
  "notes": "Đang trên đường giao hàng",
  "deliveryAttempts": 1,
  "failureReason": null,
  "estimatedRetry": null
}
```

**Valid Status Values:**
- `shipped` - Đã xuất kho
- `out_for_delivery` - Đang giao hàng
- `delivery_attempted` - Đã thử giao hàng
- `delivered` - Đã giao thành công
- `delivery_failed` - Giao hàng thất bại
- `delivery_refused` - Khách hàng từ chối nhận
- `address_verification_needed` - Cần xác minh địa chỉ

### 4. CONFIRM DELIVERY SUCCESS - Xác nhận giao hàng thành công
```http
POST /api/delivery/{orderId}/confirm
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "receiverName": "Nguyễn Văn A",
  "receiverPhone": "0901234567",
  "deliveryNotes": "Giao hàng thành công, khách hàng hài lòng",
  "signatureRequired": false,
  "proofPhotos": ["photo1.jpg", "photo2.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery confirmed successfully",
  "data": {
    "_id": "60d5f6a5f8b4c12345678903",
    "status": "delivered",
    "isDelivered": true,
    "deliveredAt": "2025-06-23T14:30:00.000Z",
    "deliveryConfirmation": {
      "confirmedAt": "2025-06-23T14:30:00.000Z",
      "confirmedBy": "60d5f6a5f8b4c12345678905",
      "receiverName": "Nguyễn Văn A",
      "receiverPhone": "0901234567",
      "deliveryNotes": "Giao hàng thành công",
      "signatureRequired": false,
      "proofPhotos": ["photo1.jpg", "photo2.jpg"]
    }
  }
}
```

### 5. REPORT DELIVERY FAILURE - Báo cáo giao hàng thất bại
```http
POST /api/delivery/{orderId}/failure
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "failureReason": "customer_not_available",
  "failureDetails": "Khách hàng không có mặt tại địa chỉ, hàng xóm cho biết đi công tác",
  "customerNotAvailable": true,
  "incorrectAddress": false,
  "refusedDelivery": false,
  "estimatedRetry": "2025-06-24T09:00:00.000Z",
  "requiresAction": true
}
```

**Valid Failure Reasons:**
- `customer_not_available` - Khách hàng không có mặt
- `incorrect_address` - Địa chỉ sai
- `refused_delivery` - Từ chối nhận hàng
- `access_denied` - Không vào được khu vực
- `weather_conditions` - Thời tiết xấu
- `vehicle_breakdown` - Xe hỏng
- `security_concerns` - Vấn đề an ninh
- `other` - Lý do khác

### 6. GET DELIVERY HISTORY - Lịch sử giao hàng
```http
GET /api/delivery/history?page=1&limit=20&startDate=2025-06-01&includeFailures=true
Authorization: Bearer {delivery_token}
```

**Query Parameters:**
- `startDate`, `endDate`: Khoảng thời gian
- `status`: Lọc theo trạng thái
- `includeFailures`: Bao gồm cả giao hàng thất bại (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "statistics": [
      {
        "_id": "delivered",
        "count": 145,
        "totalValue": 580000000
      },
      {
        "_id": "delivery_failed",
        "count": 8,
        "totalValue": 32000000
      }
    ],
    "pagination": {...}
  }
}
```

### 7. REPORT EMERGENCY INCIDENT - Báo cáo sự cố khẩn cấp
```http
POST /api/delivery/incident
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "incidentType": "accident",
  "description": "Tai nạn giao thông nhẹ khi đang giao hàng, xe bị hư hỏng nhẹ",
  "location": "Đường Nguyễn Văn Cừ, Q5, TP.HCM",
  "severity": "medium",
  "requiresImmediateResponse": true,
  "affectedOrderIds": ["60d5f6a5f8b4c12345678903", "60d5f6a5f8b4c12345678904"],
  "contactNumber": "0901234567"
}
```

**Valid Incident Types:**
- `accident` - Tai nạn
- `vehicle_breakdown` - Xe hỏng
- `theft` - Trộm cắp
- `security_threat` - Đe dọa an ninh
- `natural_disaster` - Thiên tai
- `medical_emergency` - Cấp cứu y tế
- `customer_complaint` - Khiếu nại khách hàng
- `delivery_dispute` - Tranh chấp giao hàng
- `other` - Khác

**Severity Levels:**
- `low` - Thấp
- `medium` - Trung bình
- `high` - Cao
- `critical` - Nghiêm trọng

### 8. UPLOAD DELIVERY PHOTOS - Upload ảnh bằng chứng giao hàng
```http
POST /api/delivery/{orderId}/photos
Authorization: Bearer {delivery_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `photos`: File[] (Max 10 files, each max 5MB)
- `photoType`: delivery_proof | package_condition | address_verification | incident_evidence
- `description`: Mô tả ảnh (optional)

**Response:**
```json
{
  "success": true,
  "message": "3 photo(s) uploaded successfully",
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "photosUploaded": 3,
    "photos": [
      {
        "filename": "delivery_proof_1687524600123.jpg",
        "originalName": "giao_hang_thanh_cong.jpg",
        "path": "/uploads/delivery/delivery_proof_1687524600123.jpg",
        "size": 245760,
        "uploadedAt": "2025-06-23T14:30:00.000Z",
        "uploadedBy": "60d5f6a5f8b4c12345678905",
        "photoType": "delivery_proof",
        "description": "Ảnh xác nhận giao hàng thành công"
      }
    ]
  }
}
```

### 9. BULK ASSIGN DELIVERY - Phân công hàng loạt (Admin)
```http
POST /api/delivery/bulk-assign
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderIds": [
    "60d5f6a5f8b4c12345678903",
    "60d5f6a5f8b4c12345678904",
    "60d5f6a5f8b4c12345678905"
  ],
  "deliveryPersonId": "60d5f6a5f8b4c12345678910"
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 orders assigned to Nguyễn Văn B",
  "data": {
    "assignedOrders": 3,
    "deliveryPerson": {
      "id": "60d5f6a5f8b4c12345678910",
      "name": "Nguyễn Văn B",
      "phone": "0909876543"
    }
  }
}
```

## 🔄 Delivery Status Flow

```
SHIPPED (Đã xuất kho)
    ↓
OUT_FOR_DELIVERY (Đang giao hàng)
    ↓
DELIVERY_ATTEMPTED (Đã thử giao)
    ↓
┌─ DELIVERED (Giao thành công)
├─ DELIVERY_FAILED (Giao thất bại) → RETRY
├─ DELIVERY_REFUSED (Từ chối nhận)
└─ ADDRESS_VERIFICATION_NEEDED (Cần xác minh địa chỉ)
```

## 🏢 Workflow cho các vai trò

### 🚚 Delivery Person (Nhân viên giao hàng):

**Bước 1: Xem đơn hàng được giao**
```bash
GET /api/delivery/assignments
```

**Bước 2: Cập nhật trạng thái khi bắt đầu giao**
```bash
PUT /api/delivery/{orderId}/status
# Body: { "status": "out_for_delivery", "notes": "Bắt đầu giao hàng" }
```

**Bước 3a: Giao hàng thành công**
```bash
POST /api/delivery/{orderId}/photos  # Upload ảnh bằng chứng
POST /api/delivery/{orderId}/confirm # Xác nhận giao thành công
```

**Bước 3b: Giao hàng thất bại**
```bash
POST /api/delivery/{orderId}/failure # Báo cáo thất bại
```

**Bước 4: Báo cáo sự cố (nếu có)**
```bash
POST /api/delivery/incident
```

### 👨‍💼 Admin (Quản lý giao hàng):

**Bước 1: Xem đơn hàng chưa có người giao**
```bash
GET /api/delivery/available
```

**Bước 2: Phân công đơn hàng**
```bash
# Phân công từng đơn
PUT /api/orders/{orderId}/assign-delivery

# Hoặc phân công hàng loạt
POST /api/delivery/bulk-assign
```

**Bước 3: Theo dõi và quản lý**
```bash
GET /api/orders/stats           # Thống kê tổng quan
GET /api/delivery/history       # Lịch sử giao hàng
```

## 📊 Business Rules

### Delivery Assignment Rules:
- Chỉ đơn hàng có status `shipped` mới có thể giao
- Một đơn hàng chỉ có thể giao cho một delivery person
- Delivery person chỉ xem được đơn hàng được giao cho mình

### Photo Upload Rules:
- Tối đa 10 ảnh per đơn hàng
- Mỗi ảnh tối đa 5MB
- Chỉ chấp nhận: JPEG, PNG, GIF, WebP
- Ảnh được lưu theo orderId và timestamp

### Failure Handling:
- Tối đa 3 lần thử giao hàng
- Phải báo cáo lý do thất bại chi tiết
- Tự động schedule lại lần giao tiếp theo
- Notify customer về delivery failures

### Emergency Incidents:
- High/Critical severity tự động notify management
- Affected orders được hold tự động
- Require immediate contact number
- Track incident resolution status

## ⚠️ Error Handling

### Common Error Responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Delivery status validation errors",
  "errors": [
    "Status must be one of: shipped, out_for_delivery, delivered, delivery_failed",
    "Failure reason is required when status is delivery_failed"
  ]
}
```

**403 Forbidden - Not assigned to order:**
```json
{
  "success": false,
  "message": "You are not assigned to this order"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

## 📱 Mobile App Integration

### Recommended Mobile Features:
- GPS tracking during delivery
- Offline mode for remote areas
- Camera integration for proof photos
- Push notifications for new assignments
- Barcode scanning for order verification
- Digital signature capture
- Route optimization

### API Rate Limits:
- Status updates: 60 per minute
- Photo uploads: 20 per minute
- Assignment checks: 120 per minute

## 🚀 Advanced Features

### Planned Enhancements:
- [ ] Real-time GPS tracking
- [ ] Route optimization integration
- [ ] Customer delivery preferences
- [ ] Delivery time slots
- [ ] Proof of delivery signatures
- [ ] SMS/Email notifications to customers
- [ ] Delivery performance analytics
- [ ] Integration with external logistics partners
- [ ] AI-powered delivery time prediction
- [ ] Customer rating system for delivery

### Integration Points:
- Google Maps API for routing
- SMS gateways for notifications
- Payment gateways for COD
- Customer notification systems
- Fleet management systems
