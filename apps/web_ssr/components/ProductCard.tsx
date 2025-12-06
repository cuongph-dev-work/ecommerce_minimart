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
      className="product-card bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
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

      <div className="p-4">
        {/* Category Tag */}
        <div className="mb-2">
           <span className="inline-block px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-sm max-w-full truncate">
            {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
          </span>
        </div>

        {/* Product Name with Tooltip */}
        <div title={product.name} className="relative group/tooltip">
          <h3 className="mb-2 line-clamp-1 text-sm font-medium text-gray-800">
            {searchQuery ? (
              <HighlightText text={product.name} highlight={searchQuery} />
            ) : (
              product.name
            )}
          </h3>
        </div>

        {/* Rating - only show if rating > 0 */}
        {(product.rating ?? 0) > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs">{product.rating!.toFixed(1)}</span>
            {(product.reviewCount ?? 0) > 0 && (
              <span className="text-xs text-gray-500">
                ({product.reviewCount})
              </span>
            )}
          </div>
        ) : null}

        {/* Description - Optional: keeping it but strictly limiting if needed or removing as per 'Shopee style' usually minimal text. 
            User request didn't explicitly ask to remove description, but typical 'Shopee' cards don't have descriptions. 
            I'll keep it minimal or hide it to strictly follow 'shopee-like' condensed layout if that was implied, 
            but for now I'll just follow the specific instructions: 'name 1 line', 'no min-height'.
            Let's keep description but make it very subtle or maybe just remove min-height as well.
        */}
        {/* <p className="text-xs text-gray-500 mb-3 line-clamp-1">
          {product.description ? stripHtmlTags(product.description) : ''}
        </p> */}

        {/* Price & Sold Count */}
        <div className="flex flex-wrap items-center justify-between gap-1 mb-3 mt-auto">
          <div className="text-red-600 font-bold text-sm">
            {product.discount ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                   <span>{formatPrice(product.price * (1 - product.discount / 100))}</span>
                   <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded">
                    -{product.discount}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </div>
              </div>
            ) : (
              formatPrice(product.price)
            )}
          </div>
          {(product.soldCount ?? 0) > 0 ? (
            <div className="text-xs text-gray-500">
              {t('home.sold_count', { count: product.soldCount })}
            </div>
          ) : null}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={(e) => onAddToCart(product, e)}
          className="w-full bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 h-9 text-sm"
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? t('products.out_of_stock') : t('products.add_to_cart')}
        </Button>
      </div>
    </motion.div>
  );
});
