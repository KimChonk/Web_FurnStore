# Communication Features API Documentation

## 📱 Communication Management System

Hệ thống quản lý liên lạc toàn diện giữa nhân viên giao hàng và khách hàng với các chức năng:

- ✅ **Customer Contact Info** - Thông tin liên hệ khách hàng chi tiết
- ✅ **Delivery Address** - Địa chỉ giao hàng với tích hợp navigation
- ✅ **Call/SMS Integration** - Tích hợp gọi điện và nhắn tin
- ✅ **Communication History** - Lịch sử liên lạc đầy đủ
- ✅ **SMS Templates** - Mẫu tin nhắn sẵn có
- ✅ **Rate Limiting** - Giới hạn tần suất liên lạc
- ✅ **Vietnamese Phone Support** - Hỗ trợ định dạng số điện thoại Việt Nam

## 🔐 Authorization

### Roles và Permissions:
- **Delivery**: Xem thông tin liên lạc đơn hàng được giao, gọi điện, gửi SMS
- **Support**: Toàn quyền liên lạc với khách hàng, quản lý communication history
- **Warehouse**: Xem thông tin liên lạc để hỗ trợ giao hàng
- **Admin**: Toàn quyền quản lý tất cả communication features

## 📋 API Endpoints

### 1. GET CUSTOMER CONTACT INFO - Thông tin liên hệ khách hàng
```http
GET /api/communication/order/{orderId}/contact
Authorization: Bearer {staff_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "customer": {
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phone": "0901234567",
      "alternatePhone": "0909876543",
      "preferredContactMethod": "phone"
    },
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "address": "123 Đường ABC, Phường XYZ",
      "city": "Hồ Chí Minh",
      "postalCode": "70000",
      "country": "Vietnam",
      "phone": "0901234567"
    },
    "orderStatus": "shipped",
    "deliveryAttempts": 1,
    "lastAttempt": {
      "attemptDate": "2025-06-23T10:30:00.000Z",
      "status": "delivery_attempted",
      "notes": "Khách hàng không có mặt",
      "failureReason": "customer_not_available"
    },
    "estimatedDelivery": "2025-06-23T16:00:00.000Z",
    "specialInstructions": "Gọi trước 15 phút",
    "communicationHistory": [
      {
        "type": "call",
        "message": "Gọi thông báo đang giao hàng",
        "timestamp": "2025-06-23T09:45:00.000Z",
        "initiatedBy": "delivery_person_id"
      }
    ]
  }
}
```

### 2. GET DELIVERY ADDRESS - Địa chỉ giao hàng với navigation
```http
GET /api/communication/order/{orderId}/address?includeNavigation=true
Authorization: Bearer {delivery_token}
```

**Query Parameters:**
- `includeNavigation`: true/false - Bao gồm links navigation (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "deliveryAddress": {
      "fullName": "Nguyễn Văn A",
      "address": "123 Đường ABC, Phường XYZ",
      "city": "Hồ Chí Minh",
      "postalCode": "70000",
      "country": "Vietnam",
      "phone": "0901234567"
    },
    "customerContact": {
      "name": "Nguyễn Văn A",
      "phone": "0901234567"
    },
    "orderValue": 2550000,
    "paymentMethod": "cash_on_delivery",
    "isPaid": false,
    "deliveryInstructions": "Gọi trước 15 phút",
    "navigation": {
      "googleMaps": "https://www.google.com/maps/search/?api=1&query=123%20%C4%90%C6%B0%E1%BB%9Dng%20ABC%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh",
      "googleMapsDirection": "https://www.google.com/maps/dir/?api=1&destination=123%20%C4%90%C6%B0%E1%BB%9Dng%20ABC%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh",
      "appleMaps": "http://maps.apple.com/?q=123%20%C4%90%C6%B0%E1%BB%9Dng%20ABC%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh",
      "waze": "https://waze.com/ul?q=123%20%C4%90%C6%B0%E1%BB%9Dng%20ABC%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh",
      "formattedAddress": "123 Đường ABC, Phường XYZ, Hồ Chí Minh, Vietnam"
    },
    "previousAttempts": [
      {
        "date": "2025-06-22T14:00:00.000Z",
        "status": "delivery_attempted",
        "notes": "Khách hàng không có mặt",
        "failureReason": "customer_not_available"
      }
    ]
  }
}
```

### 3. INITIATE CALL - Bắt đầu cuộc gọi
```http
POST /api/communication/order/{orderId}/call
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phoneType": "primary",
  "reason": "Thông báo đang giao hàng"
}
```

**Valid Phone Types:**
- `primary` - Số điện thoại chính của khách hàng
- `alternate` - Số điện thoại phụ
- `shipping` - Số điện thoại trong địa chỉ giao hàng

**Response:**
```json
{
  "success": true,
  "message": "Call initiated",
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "customerName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "phoneType": "primary",
    "callId": "call_log_id_here",
    "instructions": {
      "manual": "Please call 0901234567 to contact Nguyễn Văn A",
      "autoDialUrl": "tel:0901234567"
    }
  }
}
```

### 4. SEND SMS - Gửi tin nhắn SMS
```http
POST /api/communication/order/{orderId}/sms
Authorization: Bearer {delivery_token}
Content-Type: application/json
```

**Request Body (Custom Message):**
```json
{
  "phoneType": "primary",
  "message": "Xin chào anh/chị, chúng tôi đang trên đường giao đơn hàng ORD-2025-06-ABC123"
}
```

**Request Body (Using Template):**
```json
{
  "phoneType": "primary",
  "template": "on_the_way"
}
```

**Available SMS Templates:**
- `on_the_way` - Đang trên đường giao hàng
- `arrival_soon` - Sắp đến nơi giao hàng (15-30 phút)
- `failed_delivery` - Giao hàng thất bại
- `delivery_complete` - Giao hàng thành công
- `contact_request` - Yêu cầu liên hệ lại
- `address_verification` - Xác minh địa chỉ
- `schedule_delivery` - Hẹn lịch giao hàng

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "customerName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "message": "Xin chào Nguyễn Văn A, đơn hàng ORD-2025-06-ABC123 đang được giao đến địa chỉ của bạn...",
    "smsId": "sms_log_id_here",
    "status": "sent"
  }
}
```

### 5. LOG COMMUNICATION - Ghi nhận liên lạc
```http
POST /api/communication/order/{orderId}/log
Authorization: Bearer {staff_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "call",
  "method": "outgoing",
  "message": "Gọi thông báo đang giao hàng",
  "duration": 120,
  "outcome": "connected",
  "followUpRequired": false,
  "followUpDate": null
}
```

**Valid Communication Types:**
- `call` - Cuộc gọi điện thoại
- `sms` - Tin nhắn SMS  
- `email` - Email
- `chat` - Chat/Messaging
- `whatsapp` - WhatsApp

**Valid Methods:**
- `outgoing` - Gửi đi
- `incoming` - Nhận về

**Valid Outcomes:**
- `connected` - Kết nối thành công
- `no_answer` - Không trả lời
- `busy` - Máy bận
- `voicemail` - Để lại voice mail
- `delivered` - Đã gửi thành công
- `failed` - Thất bại
- `read` - Đã đọc
- `sent` - Đã gửi
- `initiated` - Đã khởi tạo
- `completed` - Hoàn thành

### 6. GET COMMUNICATION HISTORY - Lịch sử liên lạc
```http
GET /api/communication/order/{orderId}/history?limit=20&type=call
Authorization: Bearer {staff_token}
```

**Query Parameters:**
- `limit`: Số lượng records (1-100, default: 20)
- `type`: Lọc theo loại liên lạc (call, sms, email, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "60d5f6a5f8b4c12345678903",
    "orderNumber": "ORD-2025-06-ABC123",
    "history": [
      {
        "type": "call",
        "method": "outgoing",
        "message": "Gọi thông báo đang giao hàng",
        "duration": 120,
        "outcome": "connected",
        "timestamp": "2025-06-23T14:30:00.000Z",
        "initiatedBy": {
          "name": "Nguyễn Văn B",
          "role": "delivery"
        },
        "phoneNumber": "0901234567",
        "phoneType": "primary"
      },
      {
        "type": "sms",
        "method": "outgoing",
        "message": "Đang trên đường giao hàng",
        "outcome": "sent",
        "timestamp": "2025-06-23T13:45:00.000Z",
        "initiatedBy": {
          "name": "Nguyễn Văn B",
          "role": "delivery"
        },
        "template": "on_the_way"
      }
    ],
    "statistics": {
      "totalCommunications": 15,
      "callCount": 8,
      "smsCount": 6,
      "emailCount": 1,
      "lastCommunication": "2025-06-23T14:30:00.000Z"
    }
  }
}
```

### 7. GET SMS TEMPLATES - Danh sách mẫu SMS
```http
GET /api/communication/sms-templates
Authorization: Bearer {staff_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "on_the_way": {
      "name": "Đang trên đường giao hàng",
      "description": "Thông báo đang giao hàng đến khách",
      "variables": ["customerName", "orderNumber", "estimatedTime"]
    },
    "arrival_soon": {
      "name": "Sắp đến nơi giao hàng",
      "description": "Thông báo sẽ đến trong 15-30 phút",
      "variables": ["customerName", "orderNumber"]
    },
    "failed_delivery": {
      "name": "Giao hàng thất bại",
      "description": "Thông báo không thể giao hàng",
      "variables": ["customerName", "orderNumber", "contactPhone"]
    },
    "delivery_complete": {
      "name": "Giao hàng thành công",
      "description": "Xác nhận đã giao hàng thành công",
      "variables": ["customerName", "orderNumber"]
    },
    "contact_request": {
      "name": "Yêu cầu liên hệ",
      "description": "Yêu cầu khách hàng gọi lại",
      "variables": ["customerName", "orderNumber", "contactPhone"]
    },
    "address_verification": {
      "name": "Xác minh địa chỉ",
      "description": "Yêu cầu xác minh lại địa chỉ giao hàng",
      "variables": ["customerName", "orderNumber", "currentAddress"]
    },
    "schedule_delivery": {
      "name": "Hẹn lịch giao hàng",
      "description": "Hẹn lại thời gian giao hàng",
      "variables": ["customerName", "orderNumber", "proposedTime"]
    }
  }
}
```

## 📱 Mobile Integration Features

### Auto-Dial Integration
Khi gọi API `/call`, response sẽ có `autoDialUrl` với format `tel:number` để mobile app có thể tự động mở dialer:

```javascript
// JavaScript/React Native example
const initiateCall = async (orderId) => {
  const response = await fetch(`/api/communication/order/${orderId}/call`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ phoneType: 'primary', reason: 'Delivery coordination' })
  });
  
  const data = await response.json();
  
  // Auto-dial on mobile
  if (data.success) {
    window.open(data.data.instructions.autoDialUrl);
  }
};
```

### Navigation Integration
Khi gọi API `/address` với `includeNavigation=true`, sẽ có các links để mở navigation apps:

```javascript
// Open in preferred map app
const openNavigation = (navigationData) => {
  // Google Maps
  window.open(navigationData.googleMapsDirection);
  
  // Or Waze
  window.open(navigationData.waze);
  
  // Or Apple Maps (iOS)
  window.open(navigationData.appleMaps);
};
```

## 🔄 Workflow Integration

### Complete Delivery Communication Flow:

**Bước 1: Nhân viên giao hàng bắt đầu giao**
```bash
# Lấy thông tin liên lạc
GET /api/communication/order/{orderId}/contact

# Gửi SMS thông báo đang giao
POST /api/communication/order/{orderId}/sms
# Body: { "template": "on_the_way" }
```

**Bước 2: Khi đến gần địa chỉ**
```bash
# Gửi SMS sắp đến
POST /api/communication/order/{orderId}/sms
# Body: { "template": "arrival_soon" }

# Hoặc gọi điện
POST /api/communication/order/{orderId}/call
# Body: { "phoneType": "primary", "reason": "Sắp đến địa chỉ giao hàng" }
```

**Bước 3: Khi giao hàng thành công**
```bash
# Gửi SMS xác nhận
POST /api/communication/order/{orderId}/sms
# Body: { "template": "delivery_complete" }
```

**Bước 4: Khi giao hàng thất bại**
```bash
# Gửi SMS thông báo thất bại
POST /api/communication/order/{orderId}/sms
# Body: { "template": "failed_delivery" }

# Ghi nhận cuộc gọi (nếu có)
POST /api/communication/order/{orderId}/log
# Body: { "type": "call", "method": "outgoing", "outcome": "no_answer", ... }
```

## 🛡️ Security & Rate Limiting

### Rate Limits:
- **Communication actions**: 10 requests per minute per user
- **SMS sending**: 20 SMS per minute per user
- **Call initiation**: 60 calls per minute per user

### Security Features:
- ✅ Role-based access control
- ✅ Order assignment verification (delivery person can only contact customers for assigned orders)
- ✅ Phone number validation (Vietnamese format)
- ✅ Input sanitization
- ✅ Communication logging for audit

### Vietnamese Phone Number Support:
- **Mobile numbers**: Support all Vietnamese carriers (Viettel, Vinaphone, Mobifone, Vietnamobile, Gmobile)
- **Landline numbers**: Support area codes
- **International format**: +84, 84, or 0 prefix
- **Validation patterns**: Comprehensive regex validation

## ⚠️ Error Handling

### Common Error Responses:

**400 Bad Request - Invalid phone type:**
```json
{
  "success": false,
  "message": "SMS validation errors",
  "errors": [
    "Phone type must be one of: primary, alternate, shipping"
  ]
}
```

**403 Forbidden - Not assigned to order:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found - No phone number:**
```json
{
  "success": false,
  "message": "No primary phone number available for this customer"
}
```

**429 Rate Limited:**
```json
{
  "success": false,
  "message": "Communication rate limit exceeded. Please wait before making more requests."
}
```

## 🔌 Integration with External Services

### SMS Gateway Integration (Production Ready):

```javascript
// Example integration with Vietnamese SMS providers
const smsProviders = {
  vietguys: {
    url: 'https://cloudsms.vietguys.biz/api/send',
    apiKey: process.env.VIETGUYS_API_KEY
  },
  speedsms: {
    url: 'https://api.speedsms.vn/index.php/sms/send',
    apiKey: process.env.SPEEDSMS_API_KEY
  },
  esms: {
    url: 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post',
    apiKey: process.env.ESMS_API_KEY
  }
};
```

### Telephony Integration:
- Twilio API for international calls
- FPT Telecom API for domestic calls
- VoIP integration support
- Call recording capabilities

## 📊 Analytics & Reporting

### Communication Metrics:
- Response rates by communication type
- Delivery success correlation with communication
- Customer satisfaction scores
- Average resolution time
- Communication volume by time periods

### Dashboard Features:
- Real-time communication status
- Failed communication alerts
- Customer contact preferences
- Communication effectiveness reports

## 🚀 Advanced Features (Planned)

### AI-Powered Features:
- [ ] Smart SMS template suggestions
- [ ] Optimal contact time prediction
- [ ] Customer sentiment analysis
- [ ] Auto-translation for international customers

### Multi-Channel Support:
- [ ] WhatsApp Business API integration
- [ ] Zalo integration (popular in Vietnam)
- [ ] Facebook Messenger integration
- [ ] Voice message support

### Enhanced Mobile Features:
- [ ] Offline communication queue
- [ ] Voice-to-text for call logging
- [ ] GPS-based auto-notifications
- [ ] Customer callback scheduling

This communication system provides a comprehensive solution for maintaining effective customer contact during the delivery process, ensuring smooth coordination and excellent customer service.
