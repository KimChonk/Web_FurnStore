# Furniture Store API - Complete Backend System

## Overview
Complete backend system for furniture store with authentication, user management, product management, category management, and order management.

## Features Implemented

### 🔐 Authentication & Authorization
- **User Registration** - Register with email/password
- **User Login** - Login with email/password
- **Google OAuth Login** - Quick login with Google account
- **JWT Token Authentication** - Secure token-based auth
- **Password Reset** - Forgot password functionality
- **Email Verification** - Verify email addresses

### 👤 User Management
- **User Profile Management** - Complete profile system with personal info, addresses, preferences
- **Staff Account Management** - Admin can create and manage staff accounts
- **Customer History** - Complete purchase history tracking and analytics
- **Role-based Access Control** - 5 different user roles with specific permissions
- **Membership System** - Bronze, Silver, Gold, Platinum levels based on spending
- **User Statistics** - Purchase analytics, engagement scoring, activity reports

### 🛍️ Product Management
- **Product CRUD** - Complete product management with images
- **Product Search & Filter** - Advanced search, filtering, sorting
- **Product Categories** - Hierarchical category system
- **Stock Management** - Inventory tracking and management
- **Product Analytics** - Featured products, bestsellers, new arrivals
- **Image Upload** - Multiple image support per product

### 📂 Category Management
- **Category CRUD** - Complete category management system
- **Hierarchical Categories** - Parent-child category relationships
- **Category Images** - Image support for categories
- **SEO Optimization** - Meta tags, descriptions, keywords
- **Category Analytics** - Usage statistics and analytics

### 📊 Inventory Management
- **Stock Check** - Real-time inventory monitoring and tracking
- **Stock Update** - Comprehensive stock level management with transaction history
- **Product Search in Warehouse** - Advanced warehouse product search with location mapping
- **Damaged Product Report** - Complete damage reporting system with photo evidence
- **Stock Alerts** - Automated low stock, overstock, and reorder alerts
- **Inventory Analytics** - Detailed inventory performance and turnover analytics
- **Warehouse Location Management** - Section, row, shelf, and bin tracking
- **Transaction History** - Complete audit trail of all stock movements

### 🎯 Promotion Management
- **Promotion CRUD** - Complete promotion creation and management system
- **Advanced Targeting** - Customer segmentation and precise targeting options
- **Multiple Promotion Types** - Percentage, fixed amount, free shipping, buy X get Y, bundle deals
- **Code Validation** - Real-time promotion code validation and application
- **Usage Limits** - Total and per-customer usage restrictions
- **Time-based Conditions** - Day of week, time of day, and date range restrictions
- **Performance Analytics** - View tracking, conversion rates, and revenue analytics
- **Staff Integration** - Quick promotion lookup and application for staff
- **Display Management** - Featured promotions, banners, and visual customization

### 🛒 Order Management
- **Order Creation** - Complete order placement system
- **Order Status Management** - Full order lifecycle tracking
- **Warehouse Integration** - Order preparation and fulfillment
- **Delivery Management** - Delivery person assignment and tracking
- **Payment Processing** - Multiple payment method support
- **Order Reports** - Comprehensive order analytics and reporting
- **Order Slip Generation** - Printable order slips for warehouse

### 🚚 Delivery Management
- **Delivery Assignment** - Smart delivery person assignment system
- **Real-time Status Updates** - Live delivery status tracking
- **Delivery Confirmation** - Digital proof of delivery with photos
- **Failure Reporting** - Comprehensive delivery failure handling
- **Emergency Incidents** - Emergency situation reporting and management
- **Delivery History** - Complete delivery performance tracking
- **Photo Evidence** - Upload delivery proof photos with categorization
- **Bulk Operations** - Efficient bulk delivery assignment for admins

### 📞 Communication Features
- **Customer Contact Info** - Access customer contact details for order
- **Delivery Address Navigation** - Get delivery address with navigation link
- **Call Customer** - Initiate call to customer from order
- **Send SMS to Customer** - Send SMS notifications to customer
- **Log Communication** - Log any communication with the customer
- **Communication History** - View communication history for an order
- **SMS Templates** - Predefined SMS templates for common notifications

### 🏪 Store Management
- **Store CRUD** - Complete store location management system
- **Multi-store Support** - Manage multiple store locations with individual profiles
- **Staff Assignment** - Assign and manage staff across different store locations
- **Store Performance Tracking** - Revenue, customer satisfaction, and efficiency metrics
- **Geographic Search** - Find nearby stores based on location coordinates
- **Operating Hours Management** - Flexible scheduling for each store location
- **Inventory Integration** - Store-specific inventory tracking and management
- **Revenue Analytics** - Detailed financial performance per store location

### 🎧 Customer Support System
- **Support Ticketing** - Complete customer support ticket management system
- **Multi-channel Support** - Email, phone, chat, and in-person support channels
- **Ticket Lifecycle Management** - From creation to resolution with status tracking
- **Auto-assignment Logic** - Smart ticket assignment based on category and workload
- **Escalation Management** - Multi-level escalation with SLA tracking
- **Customer Feedback** - Post-resolution feedback and rating system
- **SLA Compliance** - Service level agreement tracking and reporting
- **Support Analytics** - Performance metrics, response times, and satisfaction scores
- **Internal Communication** - Staff-only notes and communication threads
- **Emergency Ticket Handling** - Priority routing for urgent customer issues

### 🛡️ Security Features
- **Password Hashing** - bcrypt with salt rounds
- **Account Lockout** - Lock accounts after failed attempts
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Validate all user inputs
- **JWT Secure Tokens** - Secure token generation
- **Data Sanitization** - Filter sensitive data in responses

### 👥 User Roles
1. **customer** - Regular customers with purchase history access
2. **delivery** - Delivery staff
3. **warehouse_manager** - Warehouse management
4. **customer_service** - Customer support with customer data access
5. **admin** - System administrators with full access

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Change password
- `POST /api/auth/logout` - User logout

### User Management Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/history` - Get customer purchase history (customers only)
- `GET /api/users/statistics` - Get customer statistics (customers only)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `POST /api/users/staff` - Create staff account (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Deactivate user (admin only)

### 🛒 Order Management API
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get customer's orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/warehouse` - Get warehouse orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/assign-delivery` - Assign delivery person
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/tracking` - Update tracking info
- `GET /api/orders/:id/slip` - Generate order slip
- `GET /api/orders/stats` - Order statistics

### 🚚 Delivery Management API
- `GET /api/delivery/assignments` - Get delivery assignments
- `GET /api/delivery/available` - Get available orders for assignment (Admin)
- `GET /api/delivery/history` - Get delivery history
- `PUT /api/delivery/:orderId/status` - Update delivery status
- `POST /api/delivery/:orderId/confirm` - Confirm successful delivery
- `POST /api/delivery/:orderId/failure` - Report delivery failure
- `POST /api/delivery/:orderId/photos` - Upload delivery proof photos
- `POST /api/delivery/incident` - Report emergency incident
- `POST /api/delivery/bulk-assign` - Bulk assign orders (Admin)

### 📞 Communication Features API
- `GET /api/communication/order/:orderId/contact` - Get customer contact info
- `GET /api/communication/order/:orderId/address` - Get delivery address with navigation
- `POST /api/communication/order/:orderId/call` - Initiate customer call
- `POST /api/communication/order/:orderId/sms` - Send SMS to customer
- `POST /api/communication/order/:orderId/log` - Log communication activity
- `GET /api/communication/order/:orderId/history` - Get communication history
- `GET /api/communication/sms-templates` - Get SMS templates

### 📊 Inventory Management API
- `GET /api/inventory` - Get inventory overview with filtering and pagination
- `GET /api/inventory/product/:productId` - Get specific product inventory details
- `PUT /api/inventory/product/:productId/stock` - Update stock levels
- `GET /api/inventory/search` - Search products in warehouse with location mapping
- `POST /api/inventory/product/:productId/damaged` - Report damaged products
- `GET /api/inventory/damaged` - Get damaged products report
- `GET /api/inventory/alerts` - Get stock alerts (low stock, overstock, etc.)
- `GET /api/inventory/analytics` - Get inventory analytics and performance metrics

### 🎯 Promotion Management API
- `GET /api/promotions` - Get all promotions (Admin/Staff)
- `POST /api/promotions` - Create new promotion (Admin)
- `GET /api/promotions/active` - Get active promotions for public display
- `GET /api/promotions/staff` - Get promotions for staff use
- `GET /api/promotions/:id` - Get single promotion details
- `PUT /api/promotions/:id` - Update promotion (Admin)
- `POST /api/promotions/:id/approve` - Approve promotion (Admin)
- `DELETE /api/promotions/:id` - Delete promotion (Admin)
- `POST /api/promotions/validate/:code` - Validate promotion code
- `POST /api/promotions/:id/view` - Track promotion view
- `GET /api/promotions/analytics` - Get promotion analytics

## Rate Limits
- **Registration**: 3 attempts per hour
- **Login**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour

## Account Security
- **Account Lockout**: After 5 failed login attempts, account is locked for 2 hours
- **Password Requirements**: Minimum 6 characters
- **JWT Expiration**: 7 days default

## Environment Variables Required
```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRE=7
DB_URL=mongodb://localhost:27017/furnstore
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "avatar": "avatar_url",
    "isEmailVerified": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["validation error 1", "validation error 2"]
}
```

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm run dev
```

4. API will be available at `http://localhost:3000`

## Documentation
- [Authentication API](README.md#authentication-endpoints) - Complete auth system documentation
- [User Management API](USER_MANAGEMENT_API.md) - Detailed user management documentation
- [Order Management API](ORDER_MANAGEMENT_API.md) - Complete order management documentation
- [Delivery Management API](DELIVERY_MANAGEMENT_API.md) - Complete delivery management documentation
- [Communication Features API](COMMUNICATION_FEATURES_API.md) - Customer communication and contact management
- [Inventory Management API](INVENTORY_MANAGEMENT_API.md) - Complete warehouse and stock management documentation
- [Promotion Management API](PROMOTION_MANAGEMENT_API.md) - Comprehensive promotion and discount management
- [Store Management API](STORE_MANAGEMENT_API.md) - Multi-store location and staff management
- [Customer Support API](CUSTOMER_SUPPORT_API.md) - Support ticketing and customer service system

## Quick Start Examples

### Authentication
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### User Management
```bash
# Get user profile
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create staff account (admin only)
curl -X POST http://localhost:3000/api/users/staff \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Staff Member","email":"staff@company.com","password":"password123","role":"warehouse_manager"}'
```

### Order Management
```bash
# Create new order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"product_id","quantity":2}],"deliveryAddress":"123 Main St","paymentMethod":"credit_card"}'

# Get customer's orders
curl -X GET http://localhost:3000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update order status (admin only)
curl -X PUT http://localhost:3000/api/orders/order_id/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped"}'
```

### Delivery Management
```bash
# Get delivery assignments
curl -X GET http://localhost:3000/api/delivery/assignments \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get available orders for assignment (admin only)
curl -X GET http://localhost:3000/api/delivery/available \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Update delivery status
curl -X PUT http://localhost:3000/api/delivery/order_id/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# Confirm successful delivery
curl -X POST http://localhost:3000/api/delivery/order_id/confirm \
  -H "Authorization: Bearer DELIVERY_JWT_TOKEN"

# Report delivery failure
curl -X POST http://localhost:3000/api/delivery/order_id/failure \
  -H "Authorization: Bearer DELIVERY_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"customer_not_available"}'
```

### Communication Features
```bash
# Get customer contact info
curl -X GET http://localhost:3000/api/communication/order/order_id/contact \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get delivery address with navigation
curl -X GET http://localhost:3000/api/communication/order/order_id/address \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Initiate customer call
curl -X POST http://localhost:3000/api/communication/order/order_id/call \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Send SMS to customer
curl -X POST http://localhost:3000/api/communication/order/order_id/sms \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Your order has been shipped!"}'

# Log communication activity
curl -X POST http://localhost:3000/api/communication/order/order_id/log \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"call","notes":"Called customer to confirm order details"}'

# Get communication history
curl -X GET http://localhost:3000/api/communication/order/order_id/history \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get SMS templates
curl -X GET http://localhost:3000/api/communication/sms-templates \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Inventory Management
```bash
# Get inventory overview
curl -X GET http://localhost:3000/api/inventory \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get specific product inventory details
curl -X GET http://localhost:3000/api/inventory/product/product_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Update stock levels
curl -X PUT http://localhost:3000/api/inventory/product/product_id/stock \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":100}'

# Search products in warehouse
curl -X GET http://localhost:3000/api/inventory/search?query=chair \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Report damaged products
curl -X POST http://localhost:3000/api/inventory/product/product_id/damaged \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":1,"description":"Broken leg"}'

# Get damaged products report
curl -X GET http://localhost:3000/api/inventory/damaged \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get stock alerts
curl -X GET http://localhost:3000/api/inventory/alerts \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Get inventory analytics
curl -X GET http://localhost:3000/api/inventory/analytics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Promotion Management
```bash
# Get all promotions
curl -X GET http://localhost:3000/api/promotions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Create new promotion
curl -X POST http://localhost:3000/api/promotions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Summer Sale","discountType":"percentage","discountValue":20,"startDate":"2023-06-01","endDate":"2023-06-30"}'

# Get active promotions for public display
curl -X GET http://localhost:3000/api/promotions/active

# Get promotions for staff use
curl -X GET http://localhost:3000/api/promotions/staff \
  -H "Authorization: Bearer STAFF_JWT_TOKEN"

# Get single promotion details
curl -X GET http://localhost:3000/api/promotions/promotion_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Update promotion
curl -X PUT http://localhost:3000/api/promotions/promotion_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"discountValue":25}'

# Approve promotion
curl -X POST http://localhost:3000/api/promotions/promotion_id/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Delete promotion
curl -X DELETE http://localhost:3000/api/promotions/promotion_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Validate promotion code
curl -X POST http://localhost:3000/api/promotions/validate/PROMO2023 \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# Track promotion view
curl -X POST http://localhost:3000/api/promotions/promotion_id/view \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# Get promotion analytics
curl -X GET http://localhost:3000/api/promotions/analytics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Store Management
```bash
# Get all stores
curl -X GET http://localhost:3000/api/stores

# Get stores with filters
curl -X GET "http://localhost:3000/api/stores?status=active&city=New%20York"

# Find nearby stores
curl -X GET "http://localhost:3000/api/stores/nearby?latitude=40.7128&longitude=-74.0060&radius=10"

# Get specific store
curl -X GET http://localhost:3000/api/stores/store_id

# Create new store
curl -X POST http://localhost:3000/api/stores \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Downtown Store","address":{"street":"123 Main St","city":"New York","country":"USA"},"phoneNumber":"+1-555-0123","email":"downtown@furnstore.com","manager":"manager_user_id"}'

# Update store
curl -X PUT http://localhost:3000/api/stores/store_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Store Name"}'

# Get store revenue
curl -X GET "http://localhost:3000/api/stores/store_id/revenue?period=monthly" \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"

# Get store staff
curl -X GET http://localhost:3000/api/stores/store_id/staff \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"

# Manage store staff
curl -X POST http://localhost:3000/api/stores/store_id/staff \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"staffId":"user_id","action":"add","role":"sales_associate"}'

# Get store inventory
curl -X GET http://localhost:3000/api/stores/store_id/inventory \
  -H "Authorization: Bearer STAFF_JWT_TOKEN"

# Get store performance
curl -X GET http://localhost:3000/api/stores/store_id/performance \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"

# Get store statistics
curl -X GET http://localhost:3000/api/stores/statistics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Update store status
curl -X PATCH http://localhost:3000/api/stores/store_id/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"maintenance","reason":"Equipment upgrade"}'

# Delete store
curl -X DELETE http://localhost:3000/api/stores/store_id \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Customer Support
```bash
# Get all support tickets
curl -X GET http://localhost:3000/api/support/tickets \
  -H "Authorization: Bearer STAFF_JWT_TOKEN"

# Get tickets with filters
curl -X GET "http://localhost:3000/api/support/tickets?status=open&category=technical&priority=high" \
  -H "Authorization: Bearer STAFF_JWT_TOKEN"

# Get specific ticket
curl -X GET http://localhost:3000/api/support/tickets/ticket_id \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN"

# Create support ticket (authenticated)
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Product delivery issue","description":"My order hasnt arrived yet","category":"delivery","priority":"medium"}'

# Create support ticket (guest)
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Content-Type: application/json" \
  -d '{"subject":"Product inquiry","description":"Question about warranty","category":"product","customerInfo":{"name":"John Doe","email":"john@email.com","phone":"+1-555-0123"}}'

# Update ticket
curl -X PUT http://localhost:3000/api/support/tickets/ticket_id \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress","priority":"high"}'

# Add response to ticket
curl -X POST http://localhost:3000/api/support/tickets/ticket_id/responses \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Thank you for contacting us. Im looking into your issue now.","isInternal":false}'

# Escalate ticket
curl -X POST http://localhost:3000/api/support/tickets/ticket_id/escalate \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"escalateTo":"senior_agent_id","reason":"Customer requesting manager involvement","level":2}'

# Submit customer feedback
curl -X POST http://localhost:3000/api/support/tickets/ticket_id/feedback \
  -H "Authorization: Bearer CUSTOMER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"feedback":"Excellent service! Very helpful agent."}'

# Update ticket status only
curl -X PATCH http://localhost:3000/api/support/tickets/ticket_id/status \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}'

# Assign ticket to agent
curl -X PATCH http://localhost:3000/api/support/tickets/ticket_id/assign \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assignedTo":"agent_user_id"}'

# Update ticket priority
curl -X PATCH http://localhost:3000/api/support/tickets/ticket_id/priority \
  -H "Authorization: Bearer STAFF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority":"urgent"}'

# Get support analytics
curl -X GET "http://localhost:3000/api/support/analytics?period=30" \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```
