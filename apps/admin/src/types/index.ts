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

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}