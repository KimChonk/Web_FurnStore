# Inventory Management API Documentation

## 📊 Inventory Management System

Hệ thống quản lý kho hàng toàn diện với các chức năng:

- ✅ **Stock Check** - Kiểm tra hàng tồn kho chi tiết
- ✅ **Stock Update** - Cập nhật số lượng tồn kho
- ✅ **Product Search in Warehouse** - Tìm kiếm hàng trong kho
- ✅ **Damaged Product Report** - Ghi nhận sản phẩm lỗi/hỏng
- ✅ **Stock Alerts** - Cảnh báo tồn kho
- ✅ **Inventory Analytics** - Thống kê và báo cáo kho

## 🔐 Authorization

### Roles và Permissions:
- **Admin**: Toàn quyền quản lý inventory, xem analytics
- **Warehouse**: Quản lý stock, báo cáo damaged, xem alerts
- **Staff**: Xem inventory, tìm kiếm sản phẩm, báo cáo damaged
- **Delivery**: Tìm kiếm sản phẩm trong kho

## 📋 API Endpoints

### 1. GET INVENTORY OVERVIEW - Tổng quan kho hàng
```http
GET /api/inventory?page=1&limit=20&search=sofa&stockStatus=low_stock
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số items per page (1-100, default: 20)
- `search`: Tìm kiếm theo tên sản phẩm hoặc SKU
- `category`: Filter theo category ID
- `location`: Filter theo warehouse location
- `stockStatus`: low_stock, out_of_stock, overstock, in_stock
- `sortBy`: updatedAt, createdAt, currentStock, totalValue, sku
- `sortOrder`: asc, desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "_id": "60d5f6a5f8b4c12345678901",
        "productId": {
          "_id": "60d5f6a5f8b4c12345678902",
          "name": "Sofa da thật cao cấp",
          "sku": "SF-001",
          "category": {
            "name": "Sofa"
          },
          "images": ["image1.jpg"],
          "price": 15000000
        },
        "sku": "SF-001",
        "currentStock": 15,
        "reservedStock": 3,
        "availableStock": 12,
        "minStockLevel": 10,
        "maxStockLevel": 50,
        "reorderPoint": 15,
        "warehouseLocation": {
          "section": "A",
          "row": "1",
          "shelf": "2",
          "bin": "B"
        },
        "lastRestocked": "2025-06-20T10:00:00.000Z",
        "lastSold": "2025-06-23T14:30:00.000Z",
        "costPrice": 12000000,
        "totalValue": 180000000,
        "stockAlerts": [
          {
            "type": "low_stock",
            "message": "Stock level (15) is at or below reorder point (15)",
            "isActive": true,
            "createdAt": "2025-06-23T15:00:00.000Z"
          }
        ],
        "turnoverRate": 2.5,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-06-23T15:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalProducts": 95,
      "totalStock": 2450,
      "totalValue": 4500000000,
      "lowStockItems": 8,
      "outOfStockItems": 2,
      "overstockItems": 1
    }
  }
}
```

### 2. GET PRODUCT INVENTORY - Chi tiết inventory sản phẩm
```http
GET /api/inventory/product/{productId}
Authorization: Bearer {warehouse_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f6a5f8b4c12345678901",
    "productId": {
      "_id": "60d5f6a5f8b4c12345678902",
      "name": "Sofa da thật cao cấp",
      "sku": "SF-001"
    },
    "currentStock": 15,
    "reservedStock": 3,
    "availableStock": 12,
    "warehouseLocation": {
      "section": "A",
      "row": "1", 
      "shelf": "2",
      "bin": "B"
    },
    "transactions": [
      {
        "type": "out",
        "quantity": 2,
        "reason": "Sale order ORD-2025-06-001",
        "orderId": "60d5f6a5f8b4c12345678910",
        "staffId": "60d5f6a5f8b4c12345678920",
        "notes": "Regular sale",
        "createdAt": "2025-06-23T14:30:00.000Z"
      }
    ],
    "damagedReports": [
      {
        "reportId": "DMG-ABC123-XYZ",
        "damageType": "shipping_damage",
        "severity": "minor",
        "description": "Scratch on surface",
        "status": "reported",
        "reportedBy": "60d5f6a5f8b4c12345678930",
        "createdAt": "2025-06-22T10:00:00.000Z"
      }
    ],
    "stockAlerts": [
      {
        "type": "low_stock",
        "message": "Stock level is at reorder point",
        "isActive": true,
        "createdAt": "2025-06-23T15:00:00.000Z"
      }
    ]
  }
}
```

### 3. UPDATE STOCK - Cập nhật số lượng tồn kho
```http
PUT /api/inventory/product/{productId}/stock
Authorization: Bearer {warehouse_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 50,
  "type": "in",
  "reason": "New stock arrival from supplier",
  "orderId": null,
  "notes": "Batch No: BT2025060001",
  "warehouseLocation": {
    "section": "A",
    "row": "1",
    "shelf": "2", 
    "bin": "B"
  }
}
```

**Valid Transaction Types:**
- `in` - Nhập kho (increase stock)
- `out` - Xuất kho (decrease stock)
- `adjustment` - Điều chỉnh (set to specific quantity)
- `damaged` - Hỏng hóc (decrease stock)
- `returned` - Trả hàng (increase stock)

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "productId": {
      "_id": "60d5f6a5f8b4c12345678902",
      "name": "Sofa da thật cao cấp",
      "sku": "SF-001"
    },
    "previousStock": 15,
    "newStock": 65,
    "transaction": {
      "type": "in",
      "quantity": 50,
      "reason": "New stock arrival from supplier",
      "staffId": "60d5f6a5f8b4c12345678920",
      "notes": "Batch No: BT2025060001",
      "createdAt": "2025-06-23T16:00:00.000Z"
    },
    "alerts": []
  }
}
```

### 4. SEARCH WAREHOUSE - Tìm kiếm hàng trong kho
```http
GET /api/inventory/search?query=sofa&location=A&category=60d5f6a5f8b4c12345678903&inStock=true
Authorization: Bearer {staff_token}
```

**Query Parameters:**
- `query`: Từ khóa tìm kiếm (tên sản phẩm, SKU, description) - Required
- `location`: Filter theo warehouse section
- `category`: Filter theo category ID
- `inStock`: true/false - chỉ hiển thị sản phẩm còn hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "60d5f6a5f8b4c12345678901",
        "productId": {
          "_id": "60d5f6a5f8b4c12345678902",
          "name": "Sofa da thật cao cấp",
          "sku": "SF-001",
          "images": ["image1.jpg"],
          "price": 15000000
        },
        "sku": "SF-001",
        "currentStock": 65,
        "availableStock": 62,
        "warehouseLocation": {
          "section": "A",
          "row": "1",
          "shelf": "2",
          "bin": "B"
        }
      }
    ],
    "groupedByLocation": {
      "A": [
        {
          "_id": "60d5f6a5f8b4c12345678901",
          "productId": {...},
          "currentStock": 65,
          "warehouseLocation": {...}
        }
      ],
      "B": [...]
    },
    "totalFound": 15,
    "searchQuery": "sofa"
  }
}
```

### 5. REPORT DAMAGED PRODUCT - Báo cáo sản phẩm hỏng
```http
POST /api/inventory/product/{productId}/damaged
Authorization: Bearer {staff_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 2,
  "damageType": "shipping_damage",
  "severity": "major",
  "description": "Deep scratches and dents from shipping",
  "photos": [
    {
      "url": "https://example.com/damage1.jpg",
      "description": "Front view damage"
    },
    {
      "url": "https://example.com/damage2.jpg", 
      "description": "Side view damage"
    }
  ],
  "estimatedLoss": 5000000
}
```

**Valid Damage Types:**
- `manufacturing_defect` - Lỗi sản xuất
- `shipping_damage` - Hỏng trong vận chuyển
- `warehouse_damage` - Hỏng trong kho
- `customer_return` - Khách trả hàng
- `wear_and_tear` - Hao mòn tự nhiên

**Valid Severities:**
- `minor` - Nhẹ (có thể sửa chữa)
- `major` - Nặng (khó sửa chữa)
- `total_loss` - Mất hoàn toàn

**Response:**
```json
{
  "success": true,
  "message": "Damaged product reported successfully",
  "data": {
    "reportId": "DMG-1H2J3K4L5M-ABC",
    "productId": "60d5f6a5f8b4c12345678902",
    "damagedQuantity": 2,
    "newStockLevel": 63,
    "report": {
      "reportId": "DMG-1H2J3K4L5M-ABC",
      "damageType": "shipping_damage",
      "severity": "major",
      "description": "Deep scratches and dents from shipping",
      "photos": [...],
      "reportedBy": "60d5f6a5f8b4c12345678920",
      "status": "reported",
      "financialImpact": {
        "estimatedLoss": 5000000,
        "recoveredAmount": 0
      },
      "createdAt": "2025-06-23T16:30:00.000Z"
    }
  }
}
```

### 6. GET DAMAGED PRODUCTS - Báo cáo sản phẩm hỏng
```http
GET /api/inventory/damaged?page=1&limit=20&status=reported&severity=major
Authorization: Bearer {warehouse_token}
```

**Query Parameters:**
- `page`, `limit`: Phân trang
- `status`: reported, investigating, confirmed, resolved, disposed
- `severity`: minor, major, total_loss
- `damageType`: manufacturing_defect, shipping_damage, etc.
- `startDate`, `endDate`: Lọc theo ngày tạo báo cáo

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "_id": "60d5f6a5f8b4c12345678940",
        "reportId": "DMG-1H2J3K4L5M-ABC",
        "product": {
          "_id": "60d5f6a5f8b4c12345678902",
          "name": "Sofa da thật cao cấp",
          "sku": "SF-001"
        },
        "damageType": "shipping_damage",
        "severity": "major",
        "description": "Deep scratches and dents from shipping",
        "status": "reported",
        "financialImpact": {
          "estimatedLoss": 5000000,
          "recoveredAmount": 0
        },
        "reporter": {
          "name": "Nguyễn Văn A",
          "email": "nguyenvana@company.com"
        },
        "createdAt": "2025-06-23T16:30:00.000Z",
        "resolvedAt": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    }
  }
}
```

### 7. GET STOCK ALERTS - Cảnh báo tồn kho
```http
GET /api/inventory/alerts?type=low_stock&isActive=true
Authorization: Bearer {warehouse_token}
```

**Query Parameters:**
- `type`: low_stock, overstock, reorder_needed, damaged_stock
- `isActive`: true/false

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "60d5f6a5f8b4c12345678950",
        "type": "low_stock",
        "message": "Stock level (15) is at or below reorder point (15)",
        "isActive": true,
        "createdAt": "2025-06-23T15:00:00.000Z",
        "product": {
          "_id": "60d5f6a5f8b4c12345678902",
          "name": "Sofa da thật cao cấp",
          "sku": "SF-001"
        },
        "currentStock": 15,
        "reorderPoint": 15,
        "maxStockLevel": 50
      }
    ],
    "summary": {
      "total": 12,
      "lowStock": 8,
      "overstock": 1,
      "damaged": 2,
      "reorderNeeded": 1
    }
  }
}
```

### 8. GET INVENTORY ANALYTICS - Thống kê kho hàng
```http
GET /api/inventory/analytics?period=30days
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `period`: 7days, 30days, 90days

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalValue": 4500000000,
      "totalStock": 2450,
      "averageStockLevel": 25.8,
      "lowStockItems": 8,
      "outOfStockItems": 2
    },
    "transactions": [
      {
        "_id": "in",
        "count": 45,
        "totalQuantity": 1250
      },
      {
        "_id": "out", 
        "count": 89,
        "totalQuantity": 890
      },
      {
        "_id": "damaged",
        "count": 5,
        "totalQuantity": 12
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

## 🔄 Complete Inventory Workflow

### Daily Inventory Operations:

**1. Morning Stock Check:**
```bash
# Check stock alerts
GET /api/inventory/alerts

# Review low stock items
GET /api/inventory?stockStatus=low_stock
```

**2. Receiving New Stock:**
```bash
# Update stock when goods arrive
PUT /api/inventory/product/{productId}/stock
# Body: { "quantity": 100, "type": "in", "reason": "New stock arrival" }
```

**3. Processing Orders:**
```bash
# Reduce stock when order shipped
PUT /api/inventory/product/{productId}/stock
# Body: { "quantity": 5, "type": "out", "reason": "Order shipment", "orderId": "..." }
```

**4. Damage Reports:**
```bash
# Report damaged items
POST /api/inventory/product/{productId}/damaged
# Body: { "quantity": 1, "damageType": "warehouse_damage", "severity": "minor" }
```

**5. End of Day Analytics:**
```bash
# Review daily performance
GET /api/inventory/analytics?period=7days
```

## 🛡️ Security & Validation

### Input Validation:
- ✅ Quantity validation (0-10,000 units max)
- ✅ Transaction type validation
- ✅ Warehouse location format validation
- ✅ Damage report validation
- ✅ Search query length validation (2+ characters)
- ✅ Date range validation

### Business Rules:
- ✅ Cannot reduce stock below 0
- ✅ Cannot report more damaged items than current stock
- ✅ Automatic alert generation for low stock/overstock
- ✅ Transaction logging for audit trail
- ✅ Unique damage report ID generation

### Performance:
- ✅ Database indexing on key fields
- ✅ Pagination for large datasets
- ✅ Efficient aggregation queries
- ✅ Search result grouping by location

## 📱 Mobile App Integration

### Warehouse Staff Features:
- **Quick Stock Check**: Scan barcode to check inventory
- **Stock Update**: Update quantities with reason codes
- **Location Mapping**: Visual warehouse layout
- **Damage Reporting**: Camera integration for damage photos
- **Alert Notifications**: Real-time low stock alerts

### Integration Examples:

```javascript
// React Native - Stock Check
const checkStock = async (sku) => {
  const response = await fetch(`/api/inventory/search?query=${sku}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.results[0];
};

// React Native - Damage Report
const reportDamage = async (productId, damageData, photos) => {
  const formData = new FormData();
  formData.append('quantity', damageData.quantity);
  formData.append('damageType', damageData.type);
  formData.append('severity', damageData.severity);
  formData.append('description', damageData.description);
  
  photos.forEach((photo, index) => {
    formData.append(`photos[${index}]`, photo);
  });
  
  const response = await fetch(`/api/inventory/product/${productId}/damaged`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  return await response.json();
};
```

This comprehensive inventory management system provides full control over warehouse operations, stock tracking, damage reporting, and analytics for optimal inventory management.
