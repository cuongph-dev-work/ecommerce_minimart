import { Review } from '../types';

export const reviews: Review[] = [
  // Reviews for Product 1 - Tai nghe
  {
    id: 'r1',
    productId: '1',
    userName: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Tai nghe rất tuyệt vời! Chất lượng âm thanh cực kỳ tốt, chống ồn hiệu quả. Đáng tiền!',
    date: new Date('2024-11-15'),
  },
  {
    id: 'r2',
    productId: '1',
    userName: 'Trần Thị B',
    rating: 4,
    comment: 'Pin trâu, âm thanh hay. Chỉ hơi nặng một chút nhưng vẫn ok.',
    date: new Date('2024-11-10'),
  },
  {
    id: 'r3',
    productId: '1',
    userName: 'Lê Minh C',
    rating: 5,
    comment: 'Sản phẩm chính hãng, giao hàng nhanh. Rất hài lòng!',
    date: new Date('2024-11-05'),
  },
  
  // Reviews for Product 2 - Đồng hồ
  {
    id: 'r4',
    productId: '2',
    userName: 'Phạm Hải D',
    rating: 5,
    comment: 'Đồng hồ đẹp, nhiều tính năng. Theo dõi sức khỏe rất chính xác.',
    date: new Date('2024-11-18'),
  },
  {
    id: 'r5',
    productId: '2',
    userName: 'Hoàng Mai E',
    rating: 4,
    comment: 'Màn hình đẹp, pin tốt. Giá hơi cao nhưng xứng đáng.',
    date: new Date('2024-11-12'),
  },
  
  // Reviews for Product 4 - Camera
  {
    id: 'r6',
    productId: '4',
    userName: 'Võ Tuấn F',
    rating: 5,
    comment: 'Camera quay rất nét, ban đêm cũng rõ. Cài đặt dễ dàng.',
    date: new Date('2024-11-14'),
  },
  {
    id: 'r7',
    productId: '4',
    userName: 'Đặng Linh G',
    rating: 5,
    comment: 'Sản phẩm tốt, shop tư vấn nhiệt tình. Sẽ ủng hộ tiếp!',
    date: new Date('2024-11-08'),
  },
  
  // Reviews for Product 8 - Sạc dự phòng
  {
    id: 'r8',
    productId: '8',
    userName: 'Bùi Nam H',
    rating: 5,
    comment: 'Pin trâu, sạc nhanh thật. Mang đi du lịch rất tiện.',
    date: new Date('2024-11-16'),
  },
  {
    id: 'r9',
    productId: '8',
    userName: 'Ngô Thu I',
    rating: 4,
    comment: 'Dung lượng thật đúng như mô tả. Hơi nặng một chút.',
    date: new Date('2024-11-11'),
  },
  {
    id: 'r10',
    productId: '8',
    userName: 'Lý Quang J',
    rating: 5,
    comment: 'Giá rẻ mà chất lượng tốt. Rất đáng mua!',
    date: new Date('2024-11-06'),
  },
];
