import { FlashSale } from '../types';

// Flash sale kết thúc sau 6 giờ từ bây giờ
const flashSaleEndTime = new Date(Date.now() + 6 * 60 * 60 * 1000);

export const flashSales: FlashSale[] = [
  {
    id: 'fs1',
    productId: '1', // Tai nghe
    originalPrice: 1890000,
    salePrice: 1490000,
    discount: 21,
    endTime: flashSaleEndTime,
    sold: 45,
    total: 100,
  },
  {
    id: 'fs2',
    productId: '4', // Camera
    originalPrice: 2790000,
    salePrice: 2190000,
    discount: 22,
    endTime: flashSaleEndTime,
    sold: 28,
    total: 50,
  },
  {
    id: 'fs3',
    productId: '8', // Sạc dự phòng
    originalPrice: 450000,
    salePrice: 299000,
    discount: 34,
    endTime: flashSaleEndTime,
    sold: 67,
    total: 100,
  },
  {
    id: 'fs4',
    productId: '2', // Đồng hồ
    originalPrice: 5490000,
    salePrice: 4490000,
    discount: 18,
    endTime: flashSaleEndTime,
    sold: 12,
    total: 30,
  },
];
