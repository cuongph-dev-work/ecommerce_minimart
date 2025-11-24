# Kế hoạch Implement API cho Web Application

## 1. Tổng quan

Dựa trên các API/module hiện có trong admin, tài liệu này mô tả kế hoạch implement API cho web application.

### 1.1. Cấu trúc hiện tại
- **Admin**: Sử dụng các service trong `apps/admin/src/services/` gọi API với prefix `/admin/*`
- **API Backend**: Các controller trong `apps/api/src/modules/` với 2 loại:
  - Admin routes: `/admin/*` (yêu cầu authentication + role admin)
  - Public routes: Một số endpoint công khai (không cần auth)

### 1.2. Mục tiêu
- Tạo service layer cho web app tương tự admin
- Implement các public API endpoints cần thiết cho web
- Thay thế mock data bằng API calls thực tế

## 2. Phân tích API hiện có

### 2.1. Admin Services (apps/admin/src/services/)

| Service | Endpoints Admin | Public Endpoints | Ghi chú |
|---------|----------------|------------------|---------|
| **products.service.ts** | `/admin/products` | ❌ Chưa có | Cần tạo public endpoints |
| **categories.service.ts** | `/admin/categories` | ❌ Chưa có | Cần tạo public endpoints |
| **orders.service.ts** | `/admin/orders` | ✅ `/orders` (POST) | Đã có create order |
| **vouchers.service.ts** | `/admin/vouchers` | ✅ `/vouchers/validate` (POST) | Đã có validate |
| **banners.service.ts** | `/admin/banners` | ❌ Chưa có | Cần tạo public endpoints |
| **flash-sales.service.ts** | `/admin/flash-sales` | ❌ Chưa có | Cần tạo public endpoints |
| **reviews.service.ts** | `/admin/reviews` | ❌ Chưa có | Cần tạo public endpoints |
| **stores.service.ts** | `/admin/stores` | ❌ Chưa có | Cần tạo public endpoints |
| **settings.service.ts** | `/admin/settings` | ❌ Chưa có | Cần tạo public endpoints |

## 3. API Endpoints cần implement cho Web

### 3.1. Products API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('products')
export class PublicProductsController {
  // GET /products - Lấy danh sách sản phẩm (có filter, search, pagination)
  // GET /products/:id - Lấy chi tiết sản phẩm
  // GET /products/featured - Lấy sản phẩm nổi bật
  // GET /products/flash-sale - Lấy sản phẩm flash sale
  // GET /products/category/:categoryId - Lấy sản phẩm theo category
}
```

**Endpoints:**
- `GET /api/products` - Danh sách sản phẩm (public, có filter)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/flash-sale` - Sản phẩm đang flash sale
- `GET /api/products/category/:categoryId` - Sản phẩm theo danh mục

### 3.2. Categories API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('categories')
export class PublicCategoriesController {
  // GET /categories - Lấy tất cả categories (tree structure)
  // GET /categories/:id - Lấy chi tiết category
  // GET /categories/:id/products - Lấy sản phẩm của category
}
```

**Endpoints:**
- `GET /api/categories` - Danh sách categories (public, tree structure)
- `GET /api/categories/:id` - Chi tiết category
- `GET /api/categories/:id/products` - Sản phẩm theo category

### 3.3. Banners API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('banners')
export class PublicBannersController {
  // GET /banners - Lấy banners active
  // GET /banners/:id - Lấy chi tiết banner
}
```

**Endpoints:**
- `GET /api/banners` - Danh sách banners đang active
- `GET /api/banners/:id` - Chi tiết banner

### 3.4. Flash Sales API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('flash-sales')
export class PublicFlashSalesController {
  // GET /flash-sales - Lấy flash sales đang active
  // GET /flash-sales/:id - Lấy chi tiết flash sale
  // GET /flash-sales/:id/products - Lấy sản phẩm trong flash sale
}
```

**Endpoints:**
- `GET /api/flash-sales` - Danh sách flash sales đang active
- `GET /api/flash-sales/:id` - Chi tiết flash sale
- `GET /api/flash-sales/:id/products` - Sản phẩm trong flash sale

### 3.5. Reviews API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('reviews')
export class PublicReviewsController {
  // GET /reviews/product/:productId - Lấy reviews của sản phẩm
  // POST /reviews - Tạo review mới (có thể cần auth)
}
```

**Endpoints:**
- `GET /api/reviews/product/:productId` - Reviews của sản phẩm
- `POST /api/reviews` - Tạo review mới (có thể public hoặc cần auth)

### 3.6. Stores API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('stores')
export class PublicStoresController {
  // GET /stores - Lấy danh sách stores active
  // GET /stores/:id - Lấy chi tiết store
}
```

**Endpoints:**
- `GET /api/stores` - Danh sách stores đang active
- `GET /api/stores/:id` - Chi tiết store

### 3.7. Settings API (Public)

**Cần tạo Public Controller:**
```typescript
@Controller('settings')
export class PublicSettingsController {
  // GET /settings - Lấy settings công khai (contact, social, etc.)
  // GET /settings/:key - Lấy setting theo key
}
```

**Endpoints:**
- `GET /api/settings` - Settings công khai
- `GET /api/settings/:key` - Setting theo key

### 3.8. Orders API (Đã có một phần)

**Endpoints hiện có:**
- ✅ `POST /api/orders` - Tạo đơn hàng (đã có)

**Có thể cần thêm:**
- `GET /api/orders/:orderNumber` - Tra cứu đơn hàng theo số đơn (public)
- `GET /api/orders/:id/status` - Kiểm tra trạng thái đơn hàng

### 3.9. Vouchers API (Đã có một phần)

**Endpoints hiện có:**
- ✅ `POST /api/vouchers/validate` - Validate voucher (đã có)

## 4. Cấu trúc Service Layer cho Web

### 4.1. Thư mục structure
```
apps/web/src/
├── lib/
│   └── api-client.ts          # Axios client (cần tạo)
├── services/
│   ├── products.service.ts    # Products API service
│   ├── categories.service.ts  # Categories API service
│   ├── orders.service.ts      # Orders API service
│   ├── vouchers.service.ts    # Vouchers API service
│   ├── banners.service.ts     # Banners API service
│   ├── flash-sales.service.ts # Flash Sales API service
│   ├── reviews.service.ts     # Reviews API service
│   ├── stores.service.ts      # Stores API service
│   └── settings.service.ts    # Settings API service
└── types/
    └── index.ts               # Type definitions
```

### 4.2. API Client Setup

**File: `apps/web/src/lib/api-client.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 5. Implementation Plan

### Phase 1: Setup Infrastructure (Priority: High)
- [ ] Tạo `apps/web/src/lib/api-client.ts`
- [ ] Setup environment variables cho API URL
- [ ] Tạo base types trong `apps/web/src/types/index.ts`

### Phase 2: Backend - Public Controllers (Priority: High)
- [ ] Tạo `PublicProductsController` trong `apps/api/src/modules/products/`
- [ ] Tạo `PublicCategoriesController` trong `apps/api/src/modules/categories/`
- [ ] Tạo `PublicBannersController` trong `apps/api/src/modules/banners/`
- [ ] Tạo `PublicFlashSalesController` trong `apps/api/src/modules/flash-sales/`
- [ ] Tạo `PublicReviewsController` trong `apps/api/src/modules/reviews/`
- [ ] Tạo `PublicStoresController` trong `apps/api/src/modules/stores/`
- [ ] Tạo `PublicSettingsController` trong `apps/api/src/modules/settings/`
- [ ] Thêm endpoint tra cứu đơn hàng trong `PublicOrdersController`

### Phase 3: Frontend - Service Layer (Priority: High)
- [ ] Tạo `apps/web/src/services/products.service.ts`
- [ ] Tạo `apps/web/src/services/categories.service.ts`
- [ ] Tạo `apps/web/src/services/banners.service.ts`
- [ ] Tạo `apps/web/src/services/flash-sales.service.ts`
- [ ] Tạo `apps/web/src/services/reviews.service.ts`
- [ ] Tạo `apps/web/src/services/stores.service.ts`
- [ ] Tạo `apps/web/src/services/settings.service.ts`
- [ ] Tạo `apps/web/src/services/orders.service.ts`
- [ ] Tạo `apps/web/src/services/vouchers.service.ts`

### Phase 4: Replace Mock Data (Priority: Medium)
- [ ] Thay thế `apps/web/src/data/products.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/categories.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/banners.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/flashSales.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/reviews.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/stores.ts` bằng API calls
- [ ] Thay thế `apps/web/src/data/vouchers.ts` bằng API calls

### Phase 5: Update Components (Priority: Medium)
- [ ] Update `HomePage.tsx` - Sử dụng API cho banners, flash sales, featured products
- [ ] Update `ProductsPage.tsx` - Sử dụng API cho danh sách sản phẩm
- [ ] Update `ProductDetailPage.tsx` - Sử dụng API cho chi tiết sản phẩm
- [ ] Update `CategoryNav.tsx` - Sử dụng API cho categories
- [ ] Update `FlashSaleSection.tsx` - Sử dụng API cho flash sales
- [ ] Update `BannerCarousel.tsx` - Sử dụng API cho banners
- [ ] Update `ProductReviews.tsx` - Sử dụng API cho reviews
- [ ] Update `StoresPage.tsx` - Sử dụng API cho stores
- [ ] Update `CartPage.tsx` - Sử dụng API cho voucher validation và order creation

### Phase 6: Error Handling & Loading States (Priority: Medium)
- [ ] Thêm error handling cho tất cả API calls
- [ ] Thêm loading states cho các components
- [ ] Thêm retry logic cho failed requests
- [ ] Thêm caching nếu cần thiết

### Phase 7: Testing & Optimization (Priority: Low)
- [ ] Test tất cả API endpoints
- [ ] Optimize API calls (debounce, pagination)
- [ ] Add request cancellation với AbortController
- [ ] Performance testing

## 6. Chi tiết từng Service

### 6.1. Products Service

**Methods:**
```typescript
class ProductsService {
  // Lấy danh sách sản phẩm với filter
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; pagination: Pagination }>

  // Lấy chi tiết sản phẩm
  async getById(id: string): Promise<Product>

  // Lấy sản phẩm nổi bật
  async getFeatured(limit?: number): Promise<Product[]>

  // Lấy sản phẩm flash sale
  async getFlashSale(): Promise<Product[]>

  // Lấy sản phẩm theo category
  async getByCategory(categoryId: string, params?: QueryParams): Promise<Product[]>
}
```

### 6.2. Categories Service

**Methods:**
```typescript
class CategoriesService {
  // Lấy tất cả categories (tree structure)
  async getAll(): Promise<Category[]>

  // Lấy chi tiết category
  async getById(id: string): Promise<Category>

  // Lấy sản phẩm của category
  async getProducts(categoryId: string, params?: QueryParams): Promise<Product[]>
}
```

### 6.3. Orders Service

**Methods:**
```typescript
class OrdersService {
  // Tạo đơn hàng (đã có)
  async create(data: CreateOrderData): Promise<Order>

  // Tra cứu đơn hàng (cần implement)
  async getByOrderNumber(orderNumber: string): Promise<Order>

  // Kiểm tra trạng thái đơn hàng (cần implement)
  async getStatus(orderId: string): Promise<OrderStatus>
}
```

### 6.4. Vouchers Service

**Methods:**
```typescript
class VouchersService {
  // Validate voucher (đã có)
  async validate(code: string, total: number): Promise<VoucherValidation>
}
```

## 7. Notes & Considerations

### 7.1. Authentication
- Hầu hết public endpoints không cần authentication
- Reviews có thể cần authentication nếu muốn track user
- Có thể thêm optional authentication cho một số features

### 7.2. Caching Strategy
- Categories: Cache lâu (ít thay đổi)
- Products: Cache ngắn (có thể thay đổi)
- Flash Sales: Cache ngắn (real-time)
- Banners: Cache trung bình

### 7.3. Error Handling
- Tất cả API calls cần có error handling
- Hiển thị user-friendly error messages
- Log errors để debug

### 7.4. Performance
- Sử dụng pagination cho danh sách
- Lazy load images
- Debounce search inputs
- Use AbortController để cancel requests

## 8. Timeline Estimate

- **Phase 1**: 1-2 giờ
- **Phase 2**: 4-6 giờ
- **Phase 3**: 3-4 giờ
- **Phase 4**: 2-3 giờ
- **Phase 5**: 4-6 giờ
- **Phase 6**: 2-3 giờ
- **Phase 7**: 2-3 giờ

**Tổng ước tính**: 18-27 giờ

## 9. Dependencies

- Axios (đã có trong admin, cần thêm vào web nếu chưa có)
- TypeScript types cần sync với backend entities

