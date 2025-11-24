export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string; // For backward compatibility with mock data
  images?: string[]; // Array of images from API
  thumbnailUrls?: string[]; // Thumbnail URLs from API
  category: string | Category | any; // Can be string (mock data) or Category object (API)
  subcategory?: string | Category | any;
  stock: number;
  sku?: string;
  featured?: boolean;
  discount?: number; // Phần trăm giảm giá
  rating?: number; // Điểm đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
  soldCount?: number; // Số lượng đã bán
  isFlashSale?: boolean; // Có phải sản phẩm flash sale không
  flashSaleEnd?: Date; // Thời gian kết thúc flash sale
  brand?: string; // Thương hiệu
  isOfficial?: boolean;
  warrantyPeriod?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  lat?: number;
  lng?: number;
  workingHours?: {
    weekdays: { start: string; end: string };
    weekends: { start: string; end: string };
  };
  services?: string[];
  allowPickup?: boolean;
  preparationTime?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for Store (matches backend entity)
export type Store = StoreLocation;

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
  icon?: string; // Icon name for frontend mapping
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  children?: Category[]; // Subcategories
  subcategories?: string[]; // Legacy support
  sortOrder?: number;
  status?: string;
  productCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  status?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}