export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  specifications?: string; // HTML content for specifications tab
  usageGuide?: string; // HTML content for usage guide tab
  image?: string; // Thumbnail image for list view
  category: string | { id: string; name: string }; // Can be string (from mock) or object (from API)
  subcategory?: string; // Danh mục con
  stock: number;
  featured?: boolean;
  discount?: number; // Phần trăm giảm giá
  rating?: number; // Điểm đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
  soldCount?: number; // Số lượng đã bán
  isFlashSale?: boolean; // Có phải sản phẩm flash sale không
  flashSaleEnd?: Date; // Thời gian kết thúc flash sale
  brand?: string; // Thương hiệu
  images?: string[]; // Danh sách ảnh gốc (original) cho detail view
  sku?: string; // Mã kho
  warrantyPeriod?: string; // Thời gian bảo hành (ví dụ: "12 tháng")
  isOfficial?: boolean; // Hàng chính hãng
  isHidden?: boolean; // Ẩn sản phẩm khỏi public
  status?: string; // Product status (active, inactive, out_of_stock)
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[]; // Deprecated: use children instead
  children?: Category[]; // Subcategories as Category records
  // Admin specific fields for UI (optional)
  image?: string; 
  slug?: string;
  description?: string;
  productCount?: number;
}

// Order Status Types (must match backend enum)
export type OrderStatus = 
  | 'pending'           // Chờ xác nhận
  | 'confirmed'         // Đã xác nhận
  | 'preparing'         // Đang chuẩn bị hàng
  | 'ready'            // Sẵn sàng nhận hàng
  | 'received'         // Đã hoàn thành (khách đã nhận)
  | 'cancelled'         // Đã hủy
  | 'returned';         // Hoàn trả

export type PaymentMethod = 'cod'; // Only COD supported
export type PaymentStatus = 'unpaid' | 'paid';

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  product?: Product; // Populated product from API
  quantity: number;
  price: number;
  subtotal: number;
}

// Order Status History
export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  updatedBy?: string; // Admin name
}

// Pickup Location Information
export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  district?: string;
  city?: string;
}

// Delivery Address
export interface DeliveryAddress {
  fullAddress: string;
  ward: string;      // Phường/Xã
  district: string;  // Quận/Huyện
  city: string;      // Tỉnh/Thành phố
}

// Main Order Interface
export interface Order {
  id: string;
  orderNumber?: string; // Order number in format XXXX-XXXX-XXXX
  
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  notes?: string; // API field name
  
  // Pickup Location (customer selects where to pick up)
  pickupLocation?: PickupLocation | string;
  pickupStore?: PickupLocation | string; // API field name
  
  // Order Details
  orderDate?: string;
  createdAt?: string; // API field name
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  discount: number;
  voucherCode?: string;
  total: number;
  shippingFee?: number; // Optional shipping fee
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiptImage?: string; // Deprecated: use receiptImages instead
  receiptImages?: string[]; // Array of receipt image URLs
  
  // Status
  status: OrderStatus;
  statusHistory?: OrderStatusHistory[];
}