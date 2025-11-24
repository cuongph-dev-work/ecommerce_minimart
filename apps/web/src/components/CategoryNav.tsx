import React, { useEffect, useState } from 'react';
import { Headphones, Watch, Package, Camera, Gamepad2, Home, Monitor, Smartphone, Tablet, Tv, Refrigerator, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';

interface CategoryNavProps {
  onCategoryClick?: (categoryId: string, categoryName: string) => void;
}

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

export function CategoryNav({ onCategoryClick }: CategoryNavProps) {
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  const displayCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3>Danh mục sản phẩm</h3>
        {!loading && categories.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-[rgb(7,0,11)] hover:underline"
          >
            {showAll ? 'Thu gọn' : `Xem tất cả (${categories.length})`}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-6 text-center py-8 text-gray-500">Đang tải...</div>
        ) : displayCategories.length === 0 ? (
          <div className="col-span-6 text-center py-8 text-gray-500">Không có danh mục</div>
        ) : (
          displayCategories.map((category, index) => {
            const Icon = category.icon ? iconMap[category.icon] : Package;
            const subcategories = category.children || [];
            return (
              <motion.button
                key={category.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => onCategoryClick?.(category.id, category.name)}
                className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg transition-all text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {Icon && <Icon className="h-6 w-6 text-white" />}
                </div>
                <div className="text-sm mb-1">{category.name}</div>
                {subcategories.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {subcategories.length} loại
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}