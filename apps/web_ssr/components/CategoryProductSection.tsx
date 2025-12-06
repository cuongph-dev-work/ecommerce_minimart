'use client';

import { ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTranslation } from 'react-i18next';

interface CategoryProductSectionProps {
  categoryName: string;
  categorySlug?: string;
  products: Product[];
}

export function CategoryProductSection({ categoryName, categorySlug, products }: CategoryProductSectionProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(t('home.add_to_cart_success', { name: product.name }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleViewAll = () => {
    const categoryParam = categorySlug || categoryName;
    router.push(`/products?category=${encodeURIComponent(categoryParam)}`);
  };

  // Show max 10 products
  const displayProducts = products.slice(0, 10);

  return (
    <section className="container mx-auto px-4 sm:px-6 mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-1">{categoryName}</h2>
            <p className="text-xs text-gray-500">
              {t('home.products_count', { count: products.length })}
            </p>
          </div>
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="hidden sm:flex"
          >
            {t('home.view_all')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => router.push(`/products/${product.slug}`)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group relative flex flex-col h-full"
            >
              {/* Flash Sale Badge */}
              {product.isFlashSale && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    FLASH SALE
                  </Badge>
                </div>
              )}

              <div className="aspect-square overflow-hidden bg-gray-100 shrink-0">
                <ImageWithFallback
                  src={product.thumbnailUrls?.[0] || product.images?.[0] || product.image || ''}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-3 flex flex-col grow">
                {/* Category & Brand */}
                <div className="text-xs text-gray-500 mb-1">
                  {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
                </div>

                {/* Product Name */}
                <h3 className="text-sm mb-2 line-clamp-2 min-h-[40px] break-all">{product.name}</h3>

                {/* Rating */}
                {(product.rating != null ||
                  product.reviewCount != null) && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">
                      {(product.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}

                {/* Price with Discount */}
                <div className="mb-2">
                  {product.discount ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-semibold">
                          {formatPrice(product.price * (1 - product.discount / 100))}
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          -{product.discount}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                {/* Sold Count */}
                {product.soldCount != null && (
                  <div className="text-xs text-gray-500 mb-2">
                    {t('home.sold_count', { count: product.soldCount || 0 })}
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={(e) => handleAddToCart(product, e)}
                  size="sm"
                  className="w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 mt-auto"
                >
                  {t('products.add_to_cart')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-6 sm:hidden">
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="w-full"
          >
            {t('home.view_all_category', { category: categoryName })}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
