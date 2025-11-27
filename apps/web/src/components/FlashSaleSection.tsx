import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { flashSales } from '../data/flashSales';
import { products } from '../data/products';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function FlashSaleSection() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      if (flashSales.length > 0) {
        const now = new Date().getTime();
        const end = new Date(flashSales[0].endTime).getTime();
        const distance = end - now;

        if (distance > 0) {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const flashSaleProducts = flashSales.map((sale) => {
    const product = products.find((p) => p.id === sale.productId);
    return { ...sale, product };
  }).filter((item) => item.product);

  if (flashSaleProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-white mb-1">Flash Sale</h2>
            <p className="text-white/80 text-sm">Giảm giá cực sốc - Số lượng có hạn</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
          <Clock className="h-5 w-5 text-white" />
          <div className="flex gap-1 text-white">
            <div className="flex flex-col items-center">
              <span className="text-sm">Giờ</span>
              <div className="bg-white/30 rounded px-2 py-1 min-w-[40px] text-center">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
            </div>
            <span className="self-end pb-1">:</span>
            <div className="flex flex-col items-center">
              <span className="text-sm">Phút</span>
              <div className="bg-white/30 rounded px-2 py-1 min-w-[40px] text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
            </div>
            <span className="self-end pb-1">:</span>
            <div className="flex flex-col items-center">
              <span className="text-sm">Giây</span>
              <div className="bg-white/30 rounded px-2 py-1 min-w-[40px] text-center">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {flashSaleProducts.map((item, index) => {
          if (!item.product) return null;
          const soldPercentage = (item.sold / item.total) * 100;

          return (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/products/${item.product.slug}`)}
              className="bg-white rounded-xl overflow-hidden cursor-pointer group relative"
            >
              {/* Discount Badge */}
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs">
                -{item.discount}%
              </div>

              <div className="aspect-square overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-sm">{item.product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">{formatPrice(item.salePrice)}</span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Đã bán</span>
                    <span className="text-red-600">
                      {item.sold}/{item.total}
                    </span>
                  </div>
                  <Progress value={soldPercentage} className="h-2" />
                </div>

                <Button
                  onClick={(e) => handleAddToCart(item.product!, e)}
                  size="sm"
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  Mua ngay
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
