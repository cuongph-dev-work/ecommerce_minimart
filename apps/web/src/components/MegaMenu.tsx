import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Headphones, Watch, Package, Camera, Gamepad2, Home, Monitor, Smartphone, Tablet, Tv, Refrigerator, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categories } from '../data/categories';

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
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
        <span>Danh mục</span>
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
              {categories.map((category) => {
                const Icon = iconMap[category.icon];
                return (
                  <div key={category.id} className="group">
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all mb-2"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {Icon && <Icon className="h-5 w-5 text-white" />}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        {category.subcategories && (
                          <div className="text-xs text-gray-500">
                            {category.subcategories.length} danh mục
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="ml-13 space-y-1">
                        {category.subcategories.slice(0, 4).map((sub, index) => (
                          <button
                            key={index}
                            onClick={() => handleCategoryClick(category.name)}
                            className="block text-sm text-gray-600 hover:text-red-600 hover:translate-x-1 transition-all py-1"
                          >
                            {sub}
                          </button>
                        ))}
                        {category.subcategories.length > 4 && (
                          <button
                            onClick={() => handleCategoryClick(category.name)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            +{category.subcategories.length - 4} mục khác
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 p-4 text-center">
              <button
                onClick={() => {
                  navigate('/products');
                  setIsOpen(false);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Xem tất cả sản phẩm →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}