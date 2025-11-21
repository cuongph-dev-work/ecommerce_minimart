import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Âm thanh',
    icon: 'Headphones',
    subcategories: ['Tai nghe', 'Loa', 'Micro', 'Ampli', 'Soundbar'],
    image: 'https://images.unsplash.com/photo-1498049860654-af5a11528db3?w=500&q=80',
    description: 'Thiết bị âm thanh chất lượng cao',
    productCount: 120,
    slug: 'am-thanh'
  },
  {
    id: '2',
    name: 'Đồng hồ',
    icon: 'Watch',
    subcategories: ['Đồng hồ thông minh', 'Vòng tay thông minh', 'Đồng hồ thời trang'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    description: 'Đồng hồ thông minh và thời trang',
    productCount: 350,
    slug: 'dong-ho'
  },
  {
    id: '3',
    name: 'Phụ kiện',
    icon: 'Package',
    subcategories: ['Balo', 'Ốp lưng', 'Kính cường lực', 'Giá đỡ', 'Cáp sạc', 'Sạc dự phòng'],
    image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=500&q=80',
    description: 'Phụ kiện điện thoại và máy tính',
    productCount: 85,
    slug: 'phu-kien'
  },
  {
    id: '4',
    name: 'Camera',
    icon: 'Camera',
    subcategories: ['Camera hành trình', 'Webcam', 'Camera an ninh', 'Action cam'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    description: 'Camera và thiết bị quay phim',
    productCount: 64,
    slug: 'camera'
  },
  {
    id: '5',
    name: 'Gaming',
    icon: 'Gamepad2',
    subcategories: ['Chuột', 'Bàn phím', 'Tai nghe', 'Ghế gaming', 'Tay cầm', 'Màn hình'],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
    description: 'Thiết bị và phụ kiện chơi game',
    productCount: 210,
    slug: 'gaming'
  },
  {
    id: '6',
    name: 'Smarthome',
    icon: 'Home',
    subcategories: ['Đèn thông minh', 'Ổ cắm', 'Cảm biến', 'Điều khiển', 'Camera'],
    image: 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=500&q=80',
    description: 'Thiết bị nhà thông minh',
    productCount: 45,
    slug: 'smarthome'
  },
  {
    id: '7',
    name: 'Laptop & PC',
    icon: 'Monitor',
    subcategories: ['Laptop', 'PC', 'Màn hình', 'Bàn phím', 'Chuột', 'Linh kiện'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
    description: 'Máy tính và linh kiện',
    productCount: 150,
    slug: 'laptop-pc'
  },
  {
    id: '8',
    name: 'Điện thoại',
    icon: 'Smartphone',
    subcategories: ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80',
    description: 'Điện thoại di động mới nhất',
    productCount: 300,
    slug: 'dien-thoai'
  },
  {
    id: '9',
    name: 'Tablet',
    icon: 'Tablet',
    subcategories: ['iPad', 'Samsung Tab', 'Android Tablet', 'Phụ kiện Tablet'],
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
    description: 'Máy tính bảng giải trí và làm việc',
    productCount: 80,
    slug: 'tablet'
  },
  {
    id: '10',
    name: 'Tivi',
    icon: 'Tv',
    subcategories: ['Smart TV', 'Android TV', 'TV 4K', 'TV 8K', 'Soundbar'],
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
    description: 'Tivi và thiết bị giải trí gia đình',
    productCount: 55,
    slug: 'tivi'
  },
  {
    id: '11',
    name: 'Gia dụng',
    icon: 'Refrigerator',
    subcategories: ['Máy lọc không khí', 'Quạt', 'Máy hút bụi', 'Nồi cơm điện'],
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&q=80',
    description: 'Thiết bị gia dụng tiện ích',
    productCount: 110,
    slug: 'gia-dung'
  },
  {
    id: '12',
    name: 'Sức khỏe',
    icon: 'Activity',
    subcategories: ['Máy massage', 'Cân sức khỏe', 'Nhiệt kế', 'Máy đo huyết áp'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80',
    description: 'Thiết bị chăm sóc sức khỏe',
    productCount: 90,
    slug: 'suc-khoe'
  },
];