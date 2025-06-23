# Furniture Store API - Authentication & Authorization

## Overview
Complete authentication and authorization system with role-based access control for the Furniture Store application.

## Features Implemented

### 🔐 Authentication
- **User Registration** - Register with email/password
- **User Login** - Login with email/password
- **Google OAuth Login** - Quick login with Google account
- **JWT Token Authentication** - Secure token-based auth
- **Password Reset** - Forgot password functionality
- **Email Verification** - Verify email addresses

### 🛡️ Security Features
- **Password Hashing** - bcrypt with salt rounds
- **Account Lockout** - Lock accounts after failed attempts
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Validate all user inputs
- **JWT Secure Tokens** - Secure token generation
- **Role-based Access Control** - 5 different user roles

### 👥 User Roles
1. **customer** - Regular customers
2. **delivery** - Delivery staff
3. **warehouse_manager** - Warehouse management
4. **customer_service** - Customer support
5. **admin** - System administrators

## API Endpoints

### Public Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0123456789",
  "role": "customer"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "googleId": "google_user_id",
  "email": "john@gmail.com",
  "name": "John Doe",
  "avatar": "https://avatar-url.com"
}
```

#### Forgot Password
```http
POST /api/auth/forgotpassword
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PUT /api/auth/resetpassword/:resettoken
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### Verify Email
```http
GET /api/auth/verifyemail/:verifytoken
```

### Protected Endpoints (Require Authentication)

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update User Details
```http
PUT /api/auth/updatedetails
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "0987654321",
  "address": {
    "street": "123 Main St",
    "city": "Ho Chi Minh City",
    "district": "District 1",
    "ward": "Ward 1",
    "zipCode": "70000"
  }
}
```

#### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

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

## Testing the API

You can test the API using tools like Postman, Thunder Client, or curl. The authentication endpoints are now fully functional and ready for integration with the frontend.

## Next Steps

The authentication system is complete and ready. Next modules to implement:
1. Product Management
2. Order Management
3. Inventory Management
4. Customer Support System
5. Delivery Management
