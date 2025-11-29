'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Headphones, Watch, Package, Camera, Gamepad2, Home, Monitor, Smartphone, Tablet, Tv, Refrigerator, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';
import { useTranslation } from 'react-i18next';

const iconMap: Record<string, any> = {
  Headphones,
  Watch,
  Package,
  Camera,
  Gamepad2,
  Home,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Refrigerator,
  Activity,
};

export function MegaMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryClick = (category: Category) => {
    const slug = category.slug || category.id;
    router.push(`/products?category=${encodeURIComponent(slug)}`);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <span>{t('mega_menu.categories')}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            style={{ width: '800px', maxWidth: '90vw' }}
          >
            <div className="grid grid-cols-3 gap-6 p-6 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="col-span-3 text-center py-8 text-gray-500">{t('home.loading')}</div>
              ) : categories.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">{t('home.no_categories')}</div>
              ) : (
                categories.map((category) => {
                  // Normalize icon name: capitalize first letter to match iconMap keys
                  const iconName = category.icon 
                    ? category.icon.charAt(0).toUpperCase() + category.icon.slice(1).toLowerCase()
                    : null;
                  const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : Package;
                  const subcategories = category.children || [];
                  return (
                    <div key={category.id} className="group">
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all mb-2"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          {Icon && <Icon className="h-5 w-5 text-white" />}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          {subcategories.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {t('mega_menu.categories_count', { count: subcategories.length })}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Subcategories */}
                      {subcategories.length > 0 && (
                        <div className="ml-13 space-y-1">
                          {subcategories.slice(0, 4).map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleCategoryClick(sub)}
                              className="block text-sm text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all py-1"
                            >
                              {sub.name}
                            </button>
                          ))}
                          {subcategories.length > 4 && (
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              {t('mega_menu.more_items', { count: subcategories.length - 4 })}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 p-4 text-center">
              <button
                onClick={() => {
                  router.push('/products');
                  setIsOpen(false);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                {t('home.view_all_products')} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}