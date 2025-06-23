# User Management API Documentation

## Overview
Complete user management system with profile management, staff account management, and customer purchase history tracking.

## Features

### 👤 User Profile Management
- View and update personal profile
- Manage multiple addresses
- Set preferences and notifications
- Track statistics and membership level

### 👥 Staff Account Management (Admin Only)
- Create staff accounts for different roles
- Manage user accounts (view, update, deactivate)
- View user statistics and reports
- Role-based access control

### 📊 Customer History & Analytics
- Complete purchase history tracking
- Customer statistics and insights
- Activity reports and engagement scoring
- Membership level calculation

## API Endpoints

### User Profile Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "avatar": "avatar_url",
      "phone": "0123456789",
      "isActive": true,
      "isEmailVerified": true,
      "lastLogin": "2025-06-23T10:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "profile": {
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01",
        "gender": "male"
      },
      "addresses": [...],
      "preferences": {...},
      "statistics": {...}
    }
  }
}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "0987654321",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Updated",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "occupation": "Engineer"
  },
  "contactInfo": {
    "primaryPhone": "0987654321",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "0123456789",
      "relationship": "spouse"
    }
  },
  "addresses": [
    {
      "type": "home",
      "isDefault": true,
      "street": "123 Main St",
      "city": "Ho Chi Minh City",
      "district": "District 1",
      "ward": "Ward 1",
      "zipCode": "70000"
    }
  ],
  "preferences": {
    "language": "vi",
    "currency": "VND",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### Customer History Endpoints

#### Get Customer Purchase History
```http
GET /api/users/history?page=1&limit=10&status=delivered&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by order status
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `sortBy` (optional): Sort field (default: orderDate)
- `sortOrder` (optional): asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "order_id",
        "orderId": "order_object_id",
        "orderDate": "2025-06-23T10:00:00.000Z",
        "totalAmount": 1500000,
        "status": "delivered",
        "paymentMethod": "credit_card",
        "items": [
          {
            "productId": "product_id",
            "productName": "Sofa",
            "quantity": 1,
            "price": 1500000,
            "totalPrice": 1500000
          }
        ],
        "shippingAddress": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    },
    "statistics": {
      "totalOrders": 25,
      "totalSpent": 37500000,
      "averageOrderValue": 1500000
    }
  }
}
```

#### Get Customer Statistics
```http
GET /api/users/statistics?year=2025
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyStats": [
      {
        "_id": 1,
        "totalAmount": 3000000,
        "orderCount": 2
      }
    ],
    "statusStats": [
      {
        "_id": "delivered",
        "count": 20
      },
      {
        "_id": "cancelled",
        "count": 2
      }
    ],
    "categoryStats": [
      {
        "_id": "furniture",
        "totalSpent": 25000000,
        "itemCount": 15
      }
    ]
  }
}
```

### Admin User Management Endpoints

#### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=20&role=customer&isActive=true&search=john
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by user role
- `isActive` (optional): Filter by active status
- `search` (optional): Search by name or email
- `sortBy` (optional): Sort field
- `sortOrder` (optional): asc/desc

#### Get User by ID (Admin Only)
```http
GET /api/users/:id
Authorization: Bearer <admin_jwt_token>
```

#### Create Staff Account (Admin Only)
```http
POST /api/users/staff
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Staff Member",
  "email": "staff@company.com",
  "password": "password123",
  "role": "warehouse_manager",
  "phone": "0123456789",
  "employmentInfo": {
    "department": "Warehouse",
    "position": "Manager",
    "employeeId": "EMP001",
    "startDate": "2025-06-23",
    "workSchedule": "full_time",
    "salary": {
      "amount": 15000000,
      "currency": "VND"
    }
  }
}
```

#### Update User (Admin Only)
```http
PUT /api/users/:id
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "customer_service",
  "isActive": true,
  "employmentInfo": {
    "department": "Customer Service",
    "position": "Senior Agent"
  }
}
```

#### Deactivate User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin_jwt_token>
```

## User Roles & Permissions

### Customer (`customer`)
- ✅ View/update own profile
- ✅ View own purchase history
- ✅ View own statistics
- ❌ Access other users' data
- ❌ Admin functions

### Delivery Staff (`delivery`)
- ✅ View/update own profile
- ❌ Customer history access
- ❌ Admin functions

### Warehouse Manager (`warehouse_manager`)
- ✅ View/update own profile
- ❌ Customer history access
- ❌ Admin functions

### Customer Service (`customer_service`)
- ✅ View/update own profile
- ✅ View customer profiles (limited)
- ✅ View customer history
- ❌ Admin functions

### Admin (`admin`)
- ✅ Full access to all endpoints
- ✅ Create/manage staff accounts
- ✅ View all user data
- ✅ System administration

## Data Models

### User Profile Structure
```json
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "gender": "male|female|other",
    "nationalId": "string",
    "occupation": "string"
  },
  "contactInfo": {
    "primaryPhone": "string",
    "secondaryPhone": "string",
    "emergencyContact": {
      "name": "string",
      "phone": "string",
      "relationship": "string"
    }
  },
  "addresses": [
    {
      "type": "home|work|shipping|billing",
      "isDefault": "boolean",
      "street": "string",
      "city": "string",
      "district": "string",
      "ward": "string",
      "zipCode": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      }
    }
  ],
  "preferences": {
    "language": "vi|en",
    "currency": "VND|USD",
    "notifications": {
      "email": "boolean",
      "sms": "boolean",
      "push": "boolean"
    },
    "newsletter": "boolean"
  },
  "statistics": {
    "totalOrders": "number",
    "totalSpent": "number",
    "averageOrderValue": "number",
    "lastOrderDate": "date",
    "favoriteCategories": ["string"],
    "loyaltyPoints": "number",
    "membershipLevel": "bronze|silver|gold|platinum"
  }
}
```

### Customer History Structure
```json
{
  "customerId": "ObjectId",
  "orderId": "ObjectId",
  "orderDate": "date",
  "totalAmount": "number",
  "status": "pending|confirmed|processing|shipped|delivered|cancelled|returned",
  "paymentMethod": "cash|credit_card|bank_transfer|e_wallet",
  "items": [
    {
      "productId": "ObjectId",
      "productName": "string",
      "quantity": "number",
      "price": "number",
      "totalPrice": "number"
    }
  ],
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "district": "string",
    "ward": "string",
    "zipCode": "string",
    "phone": "string",
    "recipientName": "string"
  }
}
```

## Membership Levels

Based on total spending (VND):
- **Bronze**: 0 - 19,999,999 VND
- **Silver**: 20,000,000 - 49,999,999 VND  
- **Gold**: 50,000,000 - 99,999,999 VND
- **Platinum**: 100,000,000+ VND

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    "Name is required",
    "Invalid email format"
  ]
}
```

### Permission Error
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "User not found"
}
```

## Security Features

- **Role-based Access Control**: Different permissions for each user role
- **Data Validation**: Comprehensive input validation
- **Data Sanitization**: Sensitive data filtering in responses
- **Rate Limiting**: API rate limiting for security
- **Audit Trail**: User activity tracking and logging

The User Management system is now complete and ready for integration!
