# Store Management API Documentation

## Overview
The Store Management API provides endpoints for managing furniture store locations, staff, inventory, revenue tracking, and performance analytics in a multi-store environment.

## Base URL
```
/api/stores
```

## Authentication
All endpoints marked as "Private" require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Stores

**GET** `/api/stores`

Get a paginated list of all stores with optional filtering.

**Access:** Public (basic info) / Private (detailed info)

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `status` (string, optional): Filter by status ('active', 'inactive', 'maintenance', 'closed')
- `city` (string, optional): Filter by city
- `country` (string, optional): Filter by country
- `search` (string, optional): Search in name, address, or description
- `sortBy` (string, optional): Sort field ('name', 'createdAt', 'revenue')
- `sortOrder` (string, optional): Sort order ('asc', 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "_id": "store_id",
        "name": "Downtown Furniture Store",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "postalCode": "10001",
          "coordinates": {
            "latitude": 40.7128,
            "longitude": -74.0060
          }
        },
        "phoneNumber": "+1-555-0123",
        "email": "downtown@furnstore.com",
        "manager": {
          "_id": "manager_id",
          "firstName": "John",
          "lastName": "Smith"
        },
        "status": "active",
        "operatingHours": {
          "monday": { "open": "09:00", "close": "18:00", "isClosed": false },
          "tuesday": { "open": "09:00", "close": "18:00", "isClosed": false }
        },
        "totalRevenue": 125000,
        "staffCount": 15,
        "inventoryValue": 75000,
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "totalDocs": 25,
    "limit": 10,
    "page": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Find Nearby Stores

**GET** `/api/stores/nearby`

Find stores near a specific location.

**Access:** Public

**Query Parameters:**
- `latitude` (number, required): Latitude coordinate
- `longitude` (number, required): Longitude coordinate
- `radius` (number, optional): Search radius in kilometers (default: 10, max: 1000)
- `limit` (number, optional): Maximum results (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "store_id",
      "name": "Downtown Furniture Store",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "distance": 2.5,
      "phoneNumber": "+1-555-0123",
      "operatingHours": { /* ... */ },
      "status": "active"
    }
  ]
}
```

### 3. Get Store by ID

**GET** `/api/stores/:id`

Get detailed information about a specific store.

**Access:** Public (basic info) / Private (detailed info)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "store_id",
    "name": "Downtown Furniture Store",
    "description": "Premium furniture store in downtown area",
    "address": { /* full address object */ },
    "phoneNumber": "+1-555-0123",
    "email": "downtown@furnstore.com",
    "website": "https://downtown.furnstore.com",
    "manager": {
      "_id": "manager_id",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@furnstore.com"
    },
    "status": "active",
    "operatingHours": { /* full schedule */ },
    "staff": [
      {
        "_id": "staff_id",
        "firstName": "Jane",
        "lastName": "Doe",
        "role": "sales_associate",
        "department": "sales"
      }
    ],
    "performance": {
      "monthlyRevenue": 25000,
      "customerSatisfaction": 4.5,
      "salesTarget": 30000,
      "achievementRate": 83.3
    },
    "createdAt": "2024-01-15T00:00:00.000Z",
    "lastUpdated": "2024-01-20T10:30:00.000Z"
  }
}
```

### 4. Create Store

**POST** `/api/stores`

Create a new store location.

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "name": "New Store Location",
  "description": "Description of the store",
  "address": {
    "street": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "postalCode": "90210",
    "coordinates": {
      "latitude": 34.0522,
      "longitude": -118.2437
    }
  },
  "phoneNumber": "+1-555-0456",
  "email": "newstore@furnstore.com",
  "website": "https://newstore.furnstore.com",
  "manager": "manager_user_id",
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "thursday": { "open": "09:00", "close": "18:00", "isClosed": false },
    "friday": { "open": "09:00", "close": "20:00", "isClosed": false },
    "saturday": { "open": "10:00", "close": "18:00", "isClosed": false },
    "sunday": { "isClosed": true }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store created successfully",
  "data": {
    "_id": "new_store_id",
    "name": "New Store Location",
    /* ... full store object ... */
  }
}
```

### 5. Update Store

**PUT** `/api/stores/:id`

Update store information.

**Access:** Private (Admin/Manager only)

**Request Body:**
```json
{
  "name": "Updated Store Name",
  "description": "Updated description",
  "phoneNumber": "+1-555-0789",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "19:00", "isClosed": false }
  }
}
```

### 6. Get Store Revenue

**GET** `/api/stores/:id/revenue`

Get revenue data for a specific store.

**Access:** Private (Admin/Manager only)

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)
- `period` (string, optional): 'daily', 'weekly', 'monthly', 'yearly'

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000,
    "periodRevenue": [
      {
        "period": "2024-01",
        "revenue": 25000,
        "orderCount": 150,
        "averageOrderValue": 166.67
      }
    ],
    "revenueGrowth": 15.5,
    "topProducts": [
      {
        "productId": "product_id",
        "name": "Leather Sofa",
        "revenue": 15000,
        "quantity": 30
      }
    ]
  }
}
```

### 7. Get Store Staff

**GET** `/api/stores/:id/staff`

Get list of staff members assigned to a store.

**Access:** Private (Admin/Manager only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "staff_id",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@furnstore.com",
      "role": "sales_associate",
      "department": "sales",
      "hireDate": "2024-01-10T00:00:00.000Z",
      "performance": {
        "salesThisMonth": 15000,
        "customerRating": 4.7
      }
    }
  ]
}
```

### 8. Manage Store Staff

**POST** `/api/stores/:id/staff`

Add, remove, or update staff assignments for a store.

**Access:** Private (Admin/Manager only)

**Request Body:**
```json
{
  "staffId": "user_id",
  "action": "add",  // 'add', 'remove', 'update'
  "role": "sales_associate",
  "department": "sales"
}
```

### 9. Get Store Inventory

**GET** `/api/stores/:id/inventory`

Get inventory overview for a store.

**Access:** Private (Admin/Manager/Staff only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 75000,
    "totalItems": 250,
    "lowStockItems": 15,
    "outOfStockItems": 3,
    "categories": [
      {
        "category": "Sofas",
        "itemCount": 45,
        "value": 25000
      }
    ],
    "recentTransactions": [
      {
        "productId": "product_id",
        "productName": "Dining Table",
        "type": "sale",
        "quantity": 2,
        "date": "2024-01-20T14:30:00.000Z"
      }
    ]
  }
}
```

### 10. Get Store Performance

**GET** `/api/stores/:id/performance`

Get performance metrics for a store.

**Access:** Private (Admin/Manager only)

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyMetrics": {
      "revenue": 25000,
      "salesTarget": 30000,
      "achievementRate": 83.3,
      "customerSatisfaction": 4.5,
      "footTraffic": 1200
    },
    "yearlyMetrics": {
      "revenue": 280000,
      "growth": 15.2,
      "customerRetention": 68.5
    },
    "rankings": {
      "revenueRank": 3,
      "satisfactionRank": 2,
      "efficiencyRank": 1
    },
    "trends": {
      "revenueGrowth": "increasing",
      "customerSatisfaction": "stable",
      "staffPerformance": "improving"
    }
  }
}
```

### 11. Get Store Statistics

**GET** `/api/stores/statistics`

Get overall statistics across all stores.

**Access:** Private (Admin/Manager only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStores": 25,
    "activeStores": 23,
    "totalRevenue": 2500000,
    "totalStaff": 350,
    "averageRevenue": 108695,
    "topPerformingStores": [
      {
        "storeId": "store_id",
        "name": "Downtown Store",
        "revenue": 150000,
        "growth": 25.5
      }
    ],
    "geographicDistribution": [
      {
        "region": "Northeast",
        "storeCount": 8,
        "revenue": 850000
      }
    ]
  }
}
```

### 12. Update Store Status

**PATCH** `/api/stores/:id/status`

Update the operational status of a store.

**Access:** Private (Admin only)

**Request Body:**
```json
{
  "status": "maintenance",
  "reason": "Renovation and equipment upgrade"
}
```

### 13. Delete Store

**DELETE** `/api/stores/:id`

Soft delete a store (marks as inactive).

**Access:** Private (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Store Object
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  phoneNumber: String,
  email: String,
  website: String,
  manager: ObjectId, // User reference
  staff: [ObjectId], // User references
  status: String, // 'active', 'inactive', 'maintenance', 'closed'
  operatingHours: {
    monday: { open: String, close: String, isClosed: Boolean },
    // ... other days
  },
  performance: {
    monthlyRevenue: Number,
    customerSatisfaction: Number,
    salesTarget: Number,
    achievementRate: Number
  },
  createdAt: Date,
  lastUpdated: Date
}
```

## Notes

- All monetary values are in the store's base currency
- Coordinates use WGS84 decimal degrees format
- Operating hours use 24-hour format (HH:MM)
- Performance metrics are calculated in real-time
- Staff assignments are tracked with full audit history
- Geographic search uses MongoDB's geospatial capabilities
