# SPEC API - ECOMMERCE MINIMART

## 1. TỔNG QUAN

Tài liệu này mô tả các API endpoints cần thiết cho hệ thống E-commerce Minimart, bao gồm:
- **Admin APIs**: Dành cho hệ thống quản trị
- **Public APIs**: Dành cho frontend/website công khai

**Base URL:**
- Development: `http://localhost:3001/api`
- Production: `https://api.store.vn/api`

**Authentication:**
- Admin APIs: JWT Bearer Token
- Public APIs: Không cần authentication (trừ một số endpoint đặc biệt)

**Response Format:**
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "errors": []
}
```

---

## 2. ADMIN APIs

### 2.1. AUTHENTICATION

#### POST `/admin/auth/login`
Đăng nhập admin

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@store.vn",
      "role": "super_admin"
    }
  }
}
```

#### POST `/admin/auth/logout`
Đăng xuất

#### POST `/admin/auth/refresh`
Refresh token

#### GET `/admin/auth/me`
Lấy thông tin admin hiện tại

---

### 2.2. DASHBOARD

#### GET `/admin/dashboard/stats`
Thống kê tổng quan

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "today": 5000000,
      "thisMonth": 150000000,
      "thisYear": 2000000000
    },
    "orders": {
      "total": 1250,
      "pending": 15,
      "processing": 8,
      "completed": 1200,
      "cancelled": 27
    },
    "products": {
      "total": 500,
      "lowStock": 12,
      "outOfStock": 3
    },
    "customers": {
      "total": 3500,
      "newThisMonth": 120
    }
  }
}
```

#### GET `/admin/dashboard/revenue-chart`
Biểu đồ doanh thu

**Query Params:**
- `period`: `day|week|month|year`
- `startDate`: `YYYY-MM-DD`
- `endDate`: `YYYY-MM-DD`

#### GET `/admin/dashboard/top-products`
Top sản phẩm bán chạy

**Query Params:**
- `limit`: `10` (default)

#### GET `/admin/dashboard/recent-orders`
Đơn hàng mới nhất

**Query Params:**
- `limit`: `10` (default)

---

### 2.3. PRODUCTS

#### GET `/admin/products`
Danh sách sản phẩm

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"tai nghe"`
- `category`: `"1"`
- `brand`: `"Sony"`
- `status`: `"active|inactive|out_of_stock"`
- `sortBy`: `"name|price|created_at|sold"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### GET `/admin/products/:id`
Chi tiết sản phẩm

#### POST `/admin/products`
Tạo sản phẩm mới

**Request:**
```json
{
  "name": "Tai nghe Bluetooth Premium",
  "description": "Mô tả sản phẩm",
  "categoryId": "1",
  "subcategory": "Tai nghe",
  "brand": "Sony",
  "sku": "SP001",
  "price": 1890000,
  "discount": 0,
  "stock": 25,
  "status": "active",
  "featured": false,
  "isOfficial": true,
  "warrantyPeriod": "12 tháng",
  "images": [
    "https://cdn.store.vn/images/product1.jpg",
    "https://cdn.store.vn/images/product1-2.jpg"
  ]
}
```

**Note:** 
- Hình ảnh được upload qua `/upload/images` trước, sau đó dùng URL trả về
- `images[0]` sẽ là ảnh chính
- `discount` là phần trăm giảm giá (0-100)

#### PUT `/admin/products/:id`
Cập nhật sản phẩm

#### DELETE `/admin/products/:id`
Xóa sản phẩm

#### POST `/admin/products/bulk-delete`
Xóa nhiều sản phẩm

**Request:**
```json
{
  "ids": ["1", "2", "3"]
}
```

#### POST `/admin/products/export`
Export sản phẩm ra Excel/CSV

#### POST `/admin/products/import`
Import sản phẩm từ Excel/CSV

---

### 2.4. CATEGORIES

#### GET `/admin/categories`
Danh sách danh mục (tree structure)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Âm thanh",
      "slug": "am-thanh",
      "icon": "Headphones",
      "parentId": null,
      "description": "...",
      "image": "https://...",
      "status": "active",
      "sortOrder": 1,
      "productCount": 25,
      "subcategories": [
        {
          "id": "1-1",
          "name": "Tai nghe",
          "parentId": "1",
          ...
        }
      ]
    }
  ]
}
```

#### GET `/admin/categories/:id`
Chi tiết danh mục

#### POST `/admin/categories`
Tạo danh mục mới

**Request:**
```json
{
  "name": "Âm thanh",
  "slug": "am-thanh",
  "icon": "Headphones",
  "parentId": null,
  "description": "Danh mục sản phẩm âm thanh",
  "image": "https://...",
  "status": "active",
  "sortOrder": 1,
  "subcategories": [
    "Tai nghe",
    "Loa",
    "Micro"
  ]
}
```

**Note:** 
- Nếu `parentId` là `null` hoặc không có → tạo danh mục cấp 1
- Nếu có `parentId` → tạo danh mục con
- `subcategories` là mảng string (tên subcategory)

#### PUT `/admin/categories/:id`
Cập nhật danh mục

#### DELETE `/admin/categories/:id`
Xóa danh mục

#### PUT `/admin/categories/reorder`
Sắp xếp lại thứ tự danh mục

**Request:**
```json
{
  "categories": [
    { "id": "1", "sortOrder": 1 },
    { "id": "2", "sortOrder": 2 }
  ]
}
```

---

### 2.5. BANNERS

#### GET `/admin/banners`
Danh sách banner

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"FLASH SALE"`
- `status`: `"active|inactive"`
- `sortBy`: `"sortOrder|created_at"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "1",
        "title": "FLASH SALE 12.12",
        "description": "Giảm đến 50%...",
        "image": "https://...",
        "link": "/products",
        "status": "active",
        "sortOrder": 1,
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/admin/banners/:id`
Chi tiết banner

#### POST `/admin/banners`
Tạo banner mới

**Request:**
```json
{
  "title": "FLASH SALE 12.12",
  "description": "Giảm đến 50% cho tất cả sản phẩm - Mua ngay kẻo lỡ!",
  "image": "https://...",
  "link": "/products",
  "status": "active",
  "sortOrder": 1
}
```

**Note:** Hình ảnh được upload qua endpoint `/upload/images` trước, sau đó dùng URL trả về

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "FLASH SALE 12.12",
    ...
  }
}
```

#### PUT `/admin/banners/:id`
Cập nhật banner

**Request:** (tương tự POST)

#### DELETE `/admin/banners/:id`
Xóa banner

---

### 2.6. FLASH SALES

#### GET `/admin/flash-sales`
Danh sách flash sale

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"Flash Sale"`
- `status`: `"upcoming|active|ended"`
- `sortBy`: `"startTime|endTime|name"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "flashSales": [
      {
        "id": "fs1",
        "name": "Flash Sale 12.12",
        "startTime": "2025-12-12T00:00:00Z",
        "endTime": "2025-12-12T23:59:59Z",
        "status": "upcoming",
        "productCount": 4,
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/admin/flash-sales/:id`
Chi tiết flash sale (bao gồm danh sách sản phẩm)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fs1",
    "name": "Flash Sale 12.12",
    "startTime": "2025-12-12T00:00:00Z",
    "endTime": "2025-12-12T23:59:59Z",
    "status": "upcoming",
    "products": [
      {
        "productId": "1",
        "productName": "Tai nghe Bluetooth Premium",
        "productImage": "https://...",
        "originalPrice": 1890000,
        "salePrice": 1490000,
        "discount": 21,
        "total": 100,
        "sold": 45
      }
    ]
  }
}
```

#### POST `/admin/flash-sales`
Tạo flash sale mới

**Request:**
```json
{
  "name": "Flash Sale 12.12",
  "startTime": "2025-12-12T00:00:00Z",
  "endTime": "2025-12-12T23:59:59Z",
  "status": "upcoming"
}
```

**Note:** Sản phẩm sẽ được thêm sau khi tạo flash sale

#### PUT `/admin/flash-sales/:id`
Cập nhật flash sale

**Request:**
```json
{
  "name": "Flash Sale 12.12",
  "startTime": "2025-12-12T00:00:00Z",
  "endTime": "2025-12-12T23:59:59Z",
  "status": "active"
}
```

#### DELETE `/admin/flash-sales/:id`
Xóa flash sale

#### POST `/admin/flash-sales/:id/products`
Thêm sản phẩm vào flash sale

**Request:**
```json
{
  "productId": "1",
  "originalPrice": 1890000,
  "salePrice": 1490000,
  "total": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "1",
    "productName": "Tai nghe Bluetooth Premium",
    "originalPrice": 1890000,
    "salePrice": 1490000,
    "discount": 21,
    "total": 100,
    "sold": 0
  }
}
```

#### PUT `/admin/flash-sales/:id/products/:productId`
Cập nhật sản phẩm trong flash sale

**Request:**
```json
{
  "originalPrice": 1890000,
  "salePrice": 1490000,
  "total": 100
}
```

#### DELETE `/admin/flash-sales/:id/products/:productId`
Xóa sản phẩm khỏi flash sale

---

### 2.7. VOUCHERS

#### GET `/admin/vouchers`
Danh sách voucher

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `status`: `"active|inactive|expired"`
- `search`: `"TECH50K"` (tìm theo mã hoặc tiêu đề)
- `type`: `"fixed|percentage"`
- `sortBy`: `"code|created_at|usedCount"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "vouchers": [
      {
        "id": "1",
        "code": "TECH50K",
        "title": "Giảm 50K",
        "description": "Cho đơn hàng từ 500K",
        "type": "fixed",
        "discount": 50000,
        "minPurchase": 500000,
        "maxUses": 1000,
        "usedCount": 45,
        "expiryDate": "2025-12-31",
        "status": "active",
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/admin/vouchers/:id`
Chi tiết voucher

#### POST `/admin/vouchers`
Tạo voucher mới

**Request:**
```json
{
  "code": "TECH50K",
  "title": "Giảm 50K",
  "description": "Cho đơn hàng từ 500K",
  "type": "fixed",
  "discount": 50000,
  "maxDiscount": null,
  "minPurchase": 500000,
  "maxUses": 1000,
  "expiryDate": "2025-12-31",
  "status": "active"
}
```

**Note:** `maxDiscount` chỉ cần khi `type` là `"percentage"`

#### PUT `/admin/vouchers/:id`
Cập nhật voucher

**Request:** (tương tự POST, không cần `usedCount`)

#### DELETE `/admin/vouchers/:id`
Xóa voucher

---

### 2.8. STORES

#### GET `/admin/stores`
Danh sách cửa hàng

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"Quận 1"` (tìm theo tên, địa chỉ, SĐT)
- `status`: `"active|inactive"`
- `allowPickup`: `true|false`
- `sortBy`: `"name|orderCount|created_at"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "id": "1",
        "name": "Chi nhánh Quận 1 - TP.HCM",
        "address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        "phone": "028 1234 5678",
        "email": "quan1@store.vn",
        "lat": 10.7769,
        "lng": 106.7009,
        "allowPickup": true,
        "preparationTime": "1-2 ngày",
        "orderCount": 15,
        "status": "active"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/admin/stores/:id`
Chi tiết cửa hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Chi nhánh Quận 1 - TP.HCM",
    "address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    "phone": "028 1234 5678",
    "email": "quan1@store.vn",
    "lat": 10.7769,
    "lng": 106.7009,
    "workingHours": {
      "weekdays": {
        "start": "08:00",
        "end": "21:00"
      },
      "weekends": {
        "start": "09:00",
        "end": "20:00"
      }
    },
    "services": [
      "Trải nghiệm sản phẩm trực tiếp",
      "Tư vấn chuyên sâu từ chuyên gia",
      "Hỗ trợ cài đặt và kích hoạt",
      "Bảo hành và sửa chữa nhanh",
      "Đổi trả trong 7 ngày",
      "Miễn phí gửi xe ô tô, xe máy"
    ],
    "allowPickup": true,
    "preparationTime": "1-2 ngày",
    "status": "active",
    "orderCount": 15,
    "stats": {
      "totalOrders": 1250,
      "pendingOrders": 5,
      "readyOrders": 10
    }
  }
}
```

#### POST `/admin/stores`
Tạo cửa hàng mới

**Request:**
```json
{
  "name": "Chi nhánh Quận 1 - TP.HCM",
  "address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  "phone": "028 1234 5678",
  "email": "quan1@store.vn",
  "lat": 10.7769,
  "lng": 106.7009,
  "workingHours": {
    "weekdays": {
      "start": "08:00",
      "end": "21:00"
    },
    "weekends": {
      "start": "09:00",
      "end": "20:00"
    }
  },
  "services": [
    "Trải nghiệm sản phẩm trực tiếp",
    "Tư vấn chuyên sâu từ chuyên gia",
    "Hỗ trợ cài đặt và kích hoạt"
  ],
  "allowPickup": true,
  "preparationTime": "1-2 ngày",
  "status": "active"
}
```

#### PUT `/admin/stores/:id`
Cập nhật cửa hàng

**Request:** (tương tự POST)

#### DELETE `/admin/stores/:id`
Xóa cửa hàng

**Note:** Chỉ cho phép xóa khi không có đơn hàng đang chờ tại cửa hàng

#### GET `/admin/stores/:id/orders`
Danh sách đơn hàng theo cửa hàng

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `status`: `"pending|confirmed|preparing|ready|received|cancelled"`

---

### 2.9. ORDERS

#### GET `/admin/orders`
Danh sách đơn hàng

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"ORD001"` (mã đơn, tên KH, SĐT)
- `status`: `"pending|confirmed|preparing|ready|received|cancelled"`
- `paymentMethod`: `"cod"`
- `startDate`: `"2025-01-01"`
- `endDate`: `"2025-01-31"`
- `sortBy`: `"created_at|total"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ORD001",
        "customerName": "Nguyễn Văn A",
        "customerPhone": "0912345678",
        "customerEmail": "nguyenvana@email.com",
        "total": 5490000,
        "status": "pending",
        "paymentMethod": "cod",
        "pickupStoreId": "1",
        "pickupStoreName": "Chi nhánh Quận 1 - TP.HCM",
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/admin/orders/:id`
Chi tiết đơn hàng

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD001",
    "orderNumber": "ORD001",
    "customer": {
      "name": "Nguyễn Văn A",
      "phone": "0912345678",
      "email": "nguyenvana@email.com",
      "notes": "Giao vào buổi sáng"
    },
    "pickupLocation": {
      "storeId": "1",
      "storeName": "Chi nhánh Quận 1 - TP.HCM",
      "storeAddress": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      "storePhone": "028 1234 5678",
      "storeEmail": "quan1@store.vn",
      "storeLat": 10.7769,
      "storeLng": 106.7009,
      "workingHours": {
        "weekdays": "8:00 - 21:00",
        "weekends": "9:00 - 20:00"
      }
    },
    "items": [
      {
        "productId": "2",
        "productName": "Đồng hồ thông minh Galaxy Watch",
        "productImage": "https://...",
        "quantity": 1,
        "price": 5490000,
        "subtotal": 5490000
      }
    ],
    "voucher": {
      "code": "TECH50K",
      "discount": 50000
    },
    "subtotal": 5490000,
    "discount": 50000,
    "total": 5440000,
    "status": "pending",
    "paymentMethod": "cod",
    "paymentStatus": "unpaid",
    "createdAt": "2025-01-27T10:00:00Z",
    "statusHistory": [
      {
        "status": "pending",
        "note": "Đơn hàng mới",
        "createdAt": "2025-01-27T10:00:00Z",
        "updatedBy": "system"
      }
    ],
    "contactHistory": [
      {
        "type": "call",
        "note": "Đã gọi xác nhận đơn hàng",
        "createdAt": "2025-01-27T10:30:00Z",
        "createdBy": "admin1"
      }
    ]
  }
}
```

#### PUT `/admin/orders/:id/status`
Cập nhật trạng thái đơn hàng

**Request:**
```json
{
  "status": "confirmed",
  "note": "Đã xác nhận đơn hàng với khách hàng"
}
```

#### PUT `/admin/orders/:id/payment`
Xác nhận thanh toán

**Request:**
```json
{
  "paymentStatus": "paid",
  "amount": 5440000,
  "note": "Khách thanh toán bằng tiền mặt",
  "receiptImage": "https://..."
}
```

#### POST `/admin/orders/:id/contact`
Ghi chú liên hệ với khách hàng

**Request:**
```json
{
  "type": "call|sms|email|zalo",
  "note": "Đã gọi xác nhận đơn hàng, khách sẽ đến nhận vào chiều nay"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contact1",
    "type": "call",
    "note": "Đã gọi xác nhận đơn hàng...",
    "createdAt": "2025-01-27T10:30:00Z",
    "createdBy": "admin1"
  }
}
```

#### GET `/admin/orders/:id/invoice`
Xuất hóa đơn PDF

---

### 2.10. REVIEWS

#### GET `/admin/reviews`
Danh sách đánh giá

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `productId`: `"1"`
- `rating`: `1|2|3|4|5`
- `status`: `"pending|approved|hidden"`

#### GET `/admin/reviews/:id`
Chi tiết đánh giá

#### PUT `/admin/reviews/:id/approve`
Duyệt đánh giá

#### PUT `/admin/reviews/:id/hide`
Ẩn đánh giá

#### DELETE `/admin/reviews/:id`
Xóa đánh giá

#### POST `/admin/reviews/:id/reply`
Phản hồi đánh giá

**Request:**
```json
{
  "reply": "Cảm ơn bạn đã đánh giá. Chúng tôi rất vui khi bạn hài lòng với sản phẩm!"
}
```

---

### 2.11. USERS / CUSTOMERS

#### GET `/admin/users`
Danh sách người dùng/khách hàng

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `search`: `"Nguyễn Văn A"`
- `role`: `"customer|admin"`
- `status`: `"active|locked"`

#### GET `/admin/users/:id`
Chi tiết người dùng

#### PUT `/admin/users/:id/status`
Khóa/Mở khóa tài khoản

**Request:**
```json
{
  "status": "locked"
}
```

#### POST `/admin/users/:id/reset-password`
Đặt lại mật khẩu

#### DELETE `/admin/users/:id`
Xóa tài khoản

---

### 2.12. ADMIN USERS

#### GET `/admin/admins`
Danh sách admin

#### GET `/admin/admins/:id`
Chi tiết admin

#### POST `/admin/admins`
Tạo admin mới

**Request:**
```json
{
  "username": "editor1",
  "email": "editor1@store.vn",
  "password": "password123",
  "role": "editor",
  "permissions": [
    "products:read",
    "products:write",
    "orders:read"
  ],
  "status": "active"
}
```

#### PUT `/admin/admins/:id`
Cập nhật admin

#### DELETE `/admin/admins/:id`
Xóa admin

---

### 2.13. SETTINGS

#### GET `/admin/settings`
Lấy tất cả cấu hình

**Response:**
```json
{
  "success": true,
  "data": {
    "storeInfo": {...},
    "pickupLocations": {...},
    "payment": {...},
    "policies": {...}
  }
}
```

#### GET `/admin/settings/:key`
Lấy cấu hình theo key

**Keys:**
- `store_info`
- `pickup_locations`
- `payment`
- `policies`

#### PUT `/admin/settings/:key`
Cập nhật cấu hình

**Store Info (`store_info`):**
```json
{
  "key": "store_info",
  "value": {
    "name": "M Tech Store",
    "logo": "https://...",
    "phone": "1900 xxxx",
    "email": "support@store.vn",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "description": "Cửa hàng công nghệ uy tín...",
    "socialMedia": {
      "facebook": "https://facebook.com/...",
      "instagram": "https://instagram.com/...",
      "telegram": "https://t.me/...",
      "youtube": "https://youtube.com/..."
    }
  }
}
```

**Pickup Locations (`pickup_locations`):**
```json
{
  "key": "pickup_locations",
  "value": {
    "preparationTime": "1-2 ngày làm việc",
    "autoNotify": true
  }
}
```

**Payment (`payment`):**
```json
{
  "key": "payment",
  "value": {
    "methods": ["cod"],
    "bankAccount": {
      "accountNumber": "1234567890",
      "accountName": "Công ty TNHH...",
      "bankName": "Vietcombank",
      "branch": "Chi nhánh HCM",
      "transferNote": "Nội dung: [Mã đơn hàng]"
    }
  }
}
```

**Policies (`policies`):**
```json
{
  "key": "policies",
  "value": {
    "warrantyPolicy": "Nội dung chính sách bảo hành...",
    "returnPolicy": "Nội dung chính sách đổi trả...",
    "shoppingGuide": "Hướng dẫn mua hàng...",
    "faq": "Câu hỏi thường gặp..."
  }
}
```

---

## 3. PUBLIC APIs (FRONTEND)

### 3.1. PRODUCTS

#### GET `/products`
Danh sách sản phẩm (public)

**Query Params:**
- `page`: `1`
- `limit`: `20`
- `category`: `"Âm thanh"`
- `brand`: `"Sony"`
- `search`: `"tai nghe"`
- `minPrice`: `100000`
- `maxPrice`: `5000000`
- `sortBy`: `"name|price|rating|sold"`
- `sortOrder`: `"asc|desc"`

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "1",
        "name": "Tai nghe Bluetooth Premium",
        "price": 1890000,
        "salePrice": null,
        "description": "...",
        "image": "https://...",
        "category": "Âm thanh",
        "brand": "Sony",
        "stock": 25,
        "rating": 4.8,
        "reviewCount": 127,
        "soldCount": 456,
        "featured": true,
        "isFlashSale": false
      }
    ],
    "pagination": {...}
  }
}
```

#### GET `/products/:id`
Chi tiết sản phẩm

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Tai nghe Bluetooth Premium",
    "price": 1890000,
    "salePrice": null,
    "fullDescription": "...",
    "images": [
      {
        "url": "https://...",
        "isPrimary": true,
        "order": 1
      }
    ],
    "category": {
      "id": "1",
      "name": "Âm thanh"
    },
    "brand": "Sony",
    "sku": "SP001",
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 127,
    "soldCount": 456,
    "specifications": {...}
  }
}
```

#### GET `/products/featured`
Sản phẩm nổi bật

**Query Params:**
- `limit`: `10`

---

### 3.2. CATEGORIES

#### GET `/categories`
Danh sách danh mục (public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Âm thanh",
      "slug": "am-thanh",
      "icon": "Headphones",
      "image": "https://...",
      "productCount": 25,
      "subcategories": [
        {
          "id": "1-1",
          "name": "Tai nghe",
          "slug": "tai-nghe"
        }
      ]
    }
  ]
}
```

#### GET `/categories/:id`
Chi tiết danh mục

#### GET `/categories/:id/products`
Sản phẩm theo danh mục

---

### 3.3. BANNERS

#### GET `/banners`
Danh sách banner đang active

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "FLASH SALE 12.12",
      "description": "Giảm đến 50%...",
      "image": "https://...",
      "link": "/products"
    }
  ]
}
```

---

### 3.4. FLASH SALES

#### GET `/flash-sales/active`
Flash sale đang diễn ra

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fs1",
    "name": "Flash Sale 12.12",
    "endTime": "2025-12-12T23:59:59Z",
    "products": [
      {
        "productId": "1",
        "product": {
          "id": "1",
          "name": "Tai nghe Bluetooth Premium",
          "image": "https://...",
          "originalPrice": 1890000,
          "salePrice": 1490000,
          "discount": 21,
          "sold": 45,
          "total": 100
        }
      }
    ]
  }
}
```

---

### 3.5. VOUCHERS

#### GET `/vouchers/available`
Danh sách voucher có thể sử dụng

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "code": "TECH50K",
      "title": "Giảm 50K",
      "description": "Cho đơn hàng từ 500K",
      "discount": 50000,
      "type": "fixed",
      "minPurchase": 500000
    }
  ]
}
```

#### POST `/vouchers/validate`
Kiểm tra voucher có hợp lệ không

**Request:**
```json
{
  "code": "TECH50K",
  "total": 600000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": 50000,
    "message": "Voucher hợp lệ"
  }
}
```

---

### 3.6. STORES

#### GET `/stores`
Danh sách cửa hàng

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Chi nhánh Quận 1 - TP.HCM",
      "address": "123 Nguyễn Huệ...",
      "phone": "028 1234 5678",
      "email": "quan1@store.vn",
      "lat": 10.7769,
      "lng": 106.7009,
      "workingHours": {
        "weekdays": "8:00 - 21:00",
        "weekends": "9:00 - 20:00"
      },
      "services": [...]
    }
  ]
}
```

#### GET `/stores/:id`
Chi tiết cửa hàng

---

### 3.7. ORDERS

#### POST `/orders`
Tạo đơn hàng mới

**Request:**
```json
{
  "customer": {
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "email": "nguyenvana@email.com",
    "notes": "Nhận vào buổi sáng"
  },
  "pickupStoreId": "1",
  "items": [
    {
      "productId": "2",
      "quantity": 1
    }
  ],
  "voucherCode": "TECH50K"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD001",
    "orderNumber": "ORD001",
    "total": 5440000,
    "message": "Đơn hàng đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất."
  }
}
```

#### GET `/orders/:orderNumber`
Tra cứu đơn hàng (không cần auth)

**Query Params:**
- `phone`: `"0912345678"` (để xác thực)

**Response:**
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD001",
    "customerName": "Nguyễn Văn A",
    "status": "pending",
    "total": 5440000,
    "pickupLocation": {
      "storeName": "Chi nhánh Quận 1 - TP.HCM",
      "storeAddress": "123 Nguyễn Huệ...",
      "storePhone": "028 1234 5678"
    },
    "orderDate": "2025-01-27T10:00:00Z"
  }
}
```

**Note:** Chỉ hiển thị thông tin cơ bản, không hiển thị chi tiết đầy đủ như admin API

---

### 3.8. REVIEWS

#### GET `/products/:productId/reviews`
Đánh giá của sản phẩm

**Query Params:**
- `page`: `1`
- `limit`: `10`
- `rating`: `1|2|3|4|5`
- `sortBy`: `"newest|oldest|helpful"`

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "r1",
        "userName": "Nguyễn Văn A",
        "rating": 5,
        "comment": "Sản phẩm rất tốt!",
        "date": "2024-11-15",
        "helpful": 10,
        "reply": {
          "message": "Cảm ơn bạn đã đánh giá!",
          "date": "2024-11-16"
        }
      }
    ],
    "summary": {
      "averageRating": 4.8,
      "totalReviews": 127,
      "ratingDistribution": {
        "5": 100,
        "4": 20,
        "3": 5,
        "2": 1,
        "1": 1
      }
    },
    "pagination": {...}
  }
}
```

#### POST `/products/:productId/reviews`
Tạo đánh giá mới (cần xác thực hoặc xác thực bằng SĐT)

**Request:**
```json
{
  "orderNumber": "ORD001",
  "phone": "0912345678",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

---

### 3.9. SEARCH

#### GET `/search`
Tìm kiếm sản phẩm

**Query Params:**
- `q`: `"tai nghe"`
- `category`: `"Âm thanh"`
- `page`: `1`
- `limit`: `20`

---

### 3.10. SETTINGS (PUBLIC)

#### GET `/settings/store-info`
Thông tin cửa hàng (public)

#### GET `/settings/pickup-locations`
Danh sách địa điểm nhận hàng (public)

#### GET `/settings/payment`
Cấu hình thanh toán (public)

---

## 4. FILE UPLOAD

### 4.1. UPLOAD IMAGES

#### POST `/upload/images`
Upload hình ảnh

**Request:** `multipart/form-data`
- `file`: File image (bắt buộc)
- `type`: `"product|banner|category|store"` (bắt buộc)

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}` (cho admin APIs)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.store.vn/images/xxx.jpg",
    "thumbnail": "https://cdn.store.vn/images/thumbnails/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 1024000,
    "width": 1920,
    "height": 1080
  }
}
```

**Lưu ý:**
- Hỗ trợ các định dạng: JPG, PNG, WebP
- Kích thước tối đa: 5MB
- Tự động resize và tạo thumbnail
- Banner images được tối ưu cho slider (tỷ lệ 16:9 khuyến nghị)
- Product images: tự động tạo nhiều kích thước (thumbnail, medium, large)
- Category images: tự động crop về tỷ lệ vuông

**Error Response:**
```json
{
  "success": false,
  "message": "File too large",
  "errors": [
    {
      "field": "file",
      "message": "File size exceeds 5MB limit"
    }
  ]
}
```

---

## 5. ERROR CODES

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Không tìm thấy resource |
| 409 | Conflict | Dữ liệu đã tồn tại (ví dụ: SKU trùng) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Lỗi server |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

---

## 6. PAGINATION

Tất cả API trả về danh sách đều có pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 7. FILTERING & SORTING

Các API danh sách hỗ trợ:
- **Filtering**: Query params với prefix `filter_` hoặc trực tiếp
- **Sorting**: `sortBy` và `sortOrder`
- **Search**: `search` hoặc `q`

---

## 8. RATE LIMITING

- Public APIs: 100 requests/phút
- Admin APIs: 200 requests/phút

---

## 9. NOTES & BEST PRACTICES

### 9.1. Image Upload
- Luôn upload ảnh trước khi tạo/sửa sản phẩm, banner, category
- Sử dụng URL trả về từ `/upload/images` trong request body
- Hỗ trợ upload nhiều ảnh cùng lúc (sử dụng array trong form-data)

### 9.2. Order Status Flow
- `pending` → `confirmed` → `preparing` → `ready` → `received`
- Không thể chuyển ngược lại trạng thái đã qua
- Chỉ có thể hủy từ `pending` hoặc `confirmed`

### 9.3. Flash Sale Products
- Sản phẩm có thể tham gia nhiều flash sale khác nhau (nếu không trùng thời gian)
- Giá khuyến mãi trong flash sale không ảnh hưởng đến giá gốc của sản phẩm
- Khi flash sale kết thúc, giá sản phẩm trở về giá gốc

### 9.4. Voucher Validation
- Kiểm tra `minPurchase` trước khi áp dụng
- Kiểm tra `maxUses` và `usedCount`
- Kiểm tra `expiryDate`
- Tự động cập nhật `usedCount` khi voucher được sử dụng

### 9.5. Store Pickup
- Chỉ hiển thị các cửa hàng có `allowPickup: true` và `status: "active"` cho khách hàng
- Khi xóa cửa hàng, cần chuyển các đơn hàng đang chờ sang cửa hàng khác

---

**Ngày tạo:** 2025-01-27  
**Ngày cập nhật:** 2025-01-27  
**Phiên bản:** 1.1

