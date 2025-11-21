export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  featured?: boolean;
  discount?: number; // Phần trăm giảm giá
  rating?: number; // Điểm đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
  soldCount?: number; // Số lượng đã bán
  isFlashSale?: boolean; // Có phải sản phẩm flash sale không
  flashSaleEnd?: Date; // Thời gian kết thúc flash sale
  brand?: string; // Thương hiệu
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  avatar?: string;
}

export interface FlashSale {
  id: string;
  productId: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  endTime: Date;
  sold: number;
  total: number;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number; // Phần trăm hoặc số tiền
  type: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  color: string;
}