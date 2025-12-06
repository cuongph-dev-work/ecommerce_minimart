'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useTranslation } from 'react-i18next';

interface CategoryProductSectionProps {
  categoryName: string;
  categorySlug?: string;
  products: Product[];
}

export function CategoryProductSection({ categoryName, categorySlug, products }: CategoryProductSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();

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
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-xl">
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-1">{categoryName}</h2>
            <p className="text-xs text-gray-500">
              {t('home.products_count', { count: products.length })}
            </p>
          </div>
          <button
            onClick={handleViewAll}
            className="hidden sm:flex items-center gap-1 text-red-500 text-sm font-medium hover:text-red-600 transition-colors group"
          >
            {t('home.view_all')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              totalProducts={displayProducts.length}
              showCategory={false}
              showDescription={false}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-6 sm:hidden">
          <button
            onClick={handleViewAll}
            className="flex items-center justify-center gap-1 text-red-500 text-sm font-medium hover:text-red-600 transition-colors group"
          >
            {t('home.view_all_category', { category: categoryName })}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
