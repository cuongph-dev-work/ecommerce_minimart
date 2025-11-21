import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import { reviews } from '../data/reviews';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const productReviews = reviews.filter((r) => r.productId === productId);

  if (productReviews.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getAverageRating = () => {
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    productReviews.forEach((r) => {
      distribution[r.rating - 1]++;
    });
    return distribution.reverse();
  };

  const distribution = getRatingDistribution();
  const avgRating = getAverageRating();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="mb-6">Đánh giá sản phẩm</h3>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b">
        <div className="text-center">
          <div className="text-5xl mb-2">{avgRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= parseFloat(avgRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">{productReviews.length} đánh giá</p>
        </div>

        <div className="md:col-span-2">
          {[5, 4, 3, 2, 1].map((rating, index) => {
            const count = distribution[index];
            const percentage = productReviews.length > 0 
              ? (count / productReviews.length) * 100 
              : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {productReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border-b last:border-b-0 pb-6 last:pb-0"
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {review.userName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="mb-1">{review.userName}</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.date)}
                  </span>
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  Hữu ích
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
