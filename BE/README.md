# Furniture Store API - Authentication & User Management

## Overview
Complete backend system for furniture store with authentication, authorization, and comprehensive user management features.

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
