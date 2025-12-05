'use client';

import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HighlightText } from './HighlightText';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  totalProducts: number;
  searchQuery?: string;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onProductClick: (slug: string) => void;
  formatPrice: (price: number) => string;
  stripHtmlTags: (html: string) => string;
  t: (key: string, options?: any) => string;
}

export const ProductCard = memo(function ProductCard({
  product,
  index,
  totalProducts,
  searchQuery,
  onAddToCart,
  onProductClick,
  formatPrice,
  stripHtmlTags,
  t,
}: ProductCardProps) {
  // Only animate newly loaded products (last 20) to improve performance
  const isNewProduct = index >= totalProducts - 20;
  const animationDelay = isNewProduct ? (index % 20) * 0.02 : 0;

  return (
    <motion.div
      initial={isNewProduct ? { y: 30, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      whileHover={{ y: -8 }}
      onClick={() => onProductClick(product.slug)}
      className="product-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group"
      style={{ contain: 'layout style paint' }}
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <ImageWithFallback
          src={product.images?.[0] || product.image || ''}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Flash Sale Badge */}
        {product.isFlashSale && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
            FLASH SALE
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
            {t('products.low_stock')}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Category & Brand */}
        <div className="text-sm text-gray-500 mb-1">
          {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
        </div>

        {/* Product Name */}
        <h3 className="mb-2 line-clamp-2 min-h-[40px] break-all">
          {searchQuery ? (
            <HighlightText text={product.name} highlight={searchQuery} />
          ) : (
            product.name
          )}
        </h3>

        {/* Rating */}
        {product.rating != null && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs">{(product.rating || 0).toFixed(1)}</span>
            {product.reviewCount != null && (
              <span className="text-xs text-gray-500">
                ({(product.reviewCount || 0)})
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px] break-all">
          {product.description ? stripHtmlTags(product.description) : ''}
        </p>

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-red-600">
            {product.discount ? (
              <div>
                {formatPrice(product.price * (1 - product.discount / 100))}
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-2">
                  -{product.discount}%
                </span>
                <div className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </div>
              </div>
            ) : (
              formatPrice(product.price)
            )}
          </div>
          <div className="text-sm text-gray-500">
            {t('products.stock_label', { stock: product.stock })}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={(e) => onAddToCart(product, e)}
          className="w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
        </Button>
      </div>
    </motion.div>
  );
});
