'use client';

import React, { memo, useCallback } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HighlightText } from './HighlightText';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  /** Optional index for staggered animation */
  index?: number;
  /** Optional total products count for animation optimization */
  totalProducts?: number;
  /** Optional previous total count for detecting new products */
  previousTotal?: number;
  /** Optional search query for highlighting */
  searchQuery?: string;
  /** Optional: disable animation */
  disableAnimation?: boolean;
  /** Show category tag (default: true) */
  showCategory?: boolean;
  /** Show description (default: true) */
  showDescription?: boolean;
}

// Utility functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const stripHtmlTags = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

export const ProductCard = memo(function ProductCard({
  product,
  index = 0,
  totalProducts = 0,
  previousTotal = 0,
  searchQuery,
  disableAnimation = false,
  showCategory = true,
  showDescription = true,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const router = useRouter();

  // Only animate newly loaded products (those added after previousTotal)
  const isNewProduct = previousTotal > 0 ? index >= previousTotal : (totalProducts > 0 ? index >= totalProducts - 20 : false);
  // Stagger only the new products, with reduced delay for smoother animation
  const animationDelay = isNewProduct ? (index - previousTotal) * 0.015 : 0;

  const handleProductClick = useCallback(() => {
    router.push(`/products/${product.slug}`);
  }, [router, product.slug]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(t('home.add_to_cart_success', { name: product.name }));
  }, [addToCart, product, t]);

  const animationProps = disableAnimation
    ? {}
    : {
        initial: isNewProduct ? { y: 30, opacity: 0 } : false,
        animate: { y: 0, opacity: 1 },
        transition: { delay: animationDelay, duration: 0.3 },
        // Changed from y: -8 to scale to fix Safari masonry grid bug
        whileHover: { scale: 1.02, transition: { duration: 0.2 } },
      };

  const descriptionText = product.description ? stripHtmlTags(product.description) : '';

  return (
    <motion.div
      {...animationProps}
      onClick={handleProductClick}
      className="product-card bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      style={{ 
        contain: 'layout style paint',
        willChange: isNewProduct ? 'transform, opacity' : 'auto',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative" style={{ willChange: 'transform' }}>
        <ImageWithFallback
          src={product.thumbnailUrls?.[0] || product.images?.[0] || product.image || ''}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Flash Sale Badge */}
        {product.isFlashSale && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded">
            FLASH SALE
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded">
            {t('products.low_stock')}
          </div>
        )}
      </div>

      <div className="p-3">
        {/* Category Tag - conditionally shown */}
        {showCategory && (
          <div className="mb-1.5">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-sm max-w-full truncate">
              {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
            </span>
          </div>
        )}

        {/* Product Name */}
        <div title={product.name} className="relative">
          <h3 className="mb-1.5 line-clamp-2 text-xs font-medium text-gray-800">
            {searchQuery ? (
              <HighlightText text={product.name} highlight={searchQuery} />
            ) : (
              product.name
            )}
          </h3>
        </div>

        {/* Description - conditionally shown, max 1 line with tooltip */}
        {showDescription && descriptionText && (
          <div title={descriptionText} className="mb-1.5">
            <p className="text-[10px] text-gray-500 line-clamp-1">
              {descriptionText}
            </p>
          </div>
        )}

        {/* Rating - always show */}
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px]">{(product.rating ?? 0).toFixed(1)}</span>
          <span className="text-[10px] text-gray-500">
            ({product.reviewCount ?? 0})
          </span>
        </div>

        {/* Price & Sold Count */}
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <div className="text-red-600 font-bold text-xs">
            {product.discount ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span>{formatPrice(product.price * (1 - product.discount / 100))}</span>
                  <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded">
                    -{product.discount}%
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 line-through">
                  {formatPrice(product.price)}
                </div>
              </div>
            ) : (
              formatPrice(product.price)
            )}
          </div>
          {(product.soldCount ?? 0) > 0 ? (
            <div className="text-[10px] text-gray-500">
              {t('home.sold_count', { count: product.soldCount })}
            </div>
          ) : null}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 h-8 text-xs"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
        </Button>
      </div>
    </motion.div>
  );
});
