export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
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
  images?: string[]; // Danh sách ảnh sản phẩm
  sku?: string; // Mã kho
  warrantyPeriod?: string; // Thời gian bảo hành (ví dụ: "12 tháng")
  isOfficial?: boolean; // Hàng chính hãng
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
  // Admin specific fields for UI (optional)
  image?: string; 
  slug?: string;
  description?: string;
  productCount?: number;
}

// Order Status Types
export type OrderStatus = 
  | 'pending'           // Chờ xác nhận
  | 'confirmed'         // Đã xác nhận
  | 'preparing'         // Đang chuẩn bị hàng
  | 'ready_for_pickup'  // Sẵn sàng nhận hàng
  | 'completed'         // Đã hoàn thành (khách đã nhận)
  | 'cancelled'         // Đã hủy
  | 'returned';         // Hoàn trả

export type PaymentMethod = 'cod'; // Only COD supported
export type PaymentStatus = 'unpaid' | 'paid';

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
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
  
  // Customer Information
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  
  // Pickup Location (customer selects where to pick up)
  pickupLocation: PickupLocation;
  
  // Order Details
  orderDate: string;
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  discount: number;
  voucherCode?: string;
  total: number;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Status
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
}