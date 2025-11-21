import { ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { products } from '../data/products';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BannerCarousel } from './BannerCarousel';
import { CategoryNav } from './CategoryNav';
import { FlashSaleSection } from './FlashSaleSection';
import { VoucherSection } from './VoucherSection';
import { TrustBadges } from './TrustBadges';

export function HomePage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const featuredProducts = products.filter((p) => p.featured);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCategoryClick = (category: string) => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Carousel */}
      <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 mb-6">
      <BannerCarousel />
      </section>

      {/* Category Navigation */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <CategoryNav onCategoryClick={handleCategoryClick} />
      </section>

      {/* Flash Sale Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <FlashSaleSection />
      </section>

      {/* Voucher Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <VoucherSection />
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <TrustBadges />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="mb-2">Sản phẩm nổi bật</h2>
              <p className="text-gray-600">
                Khám phá những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="hidden sm:flex"
            >
              Xem tất cả
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group relative"
              >
                {/* Flash Sale Badge */}
                {product.isFlashSale && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-red-500 text-white hover:bg-red-600">
                      FLASH SALE
                    </Badge>
                  </div>
                )}

                <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-3">
                  {/* Category & Brand */}
                  <div className="text-xs text-gray-500 mb-1">
                    {product.brand || product.category}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-sm mb-2 line-clamp-2">{product.name}</h3>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs">{product.rating}</span>
                      {product.reviewCount && (
                        <span className="text-xs text-gray-500">
                          ({product.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-2 text-purple-600">{formatPrice(product.price)}</div>

                  {/* Sold Count */}
                  {product.soldCount && (
                    <div className="text-xs text-gray-500 mb-2">
                      Đã bán {product.soldCount}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="w-full"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}