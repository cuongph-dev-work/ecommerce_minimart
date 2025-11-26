import { useState, useEffect } from 'react';
import { ArrowRight, Headphones, Watch, Package, Camera, Gamepad2, Home, Monitor, Smartphone, Tablet, Tv, Refrigerator, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
// import { Badge } from './ui/badge'; // Unused - flash sale feature disabled
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BannerCarousel } from './BannerCarousel';
import { CategoryNav } from './CategoryNav';
// import { FlashSaleSection } from './FlashSaleSection';
// import { VoucherSection } from './VoucherSection';
import { TrustBadges } from './TrustBadges';
import { CategoryProductSection } from './CategoryProductSection';
import { productsService } from '../services/products.service';
import { categoriesService, CategoryWithSales } from '../services/categories.service';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN').format(value);
  };
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryWithSales[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const loadData = async () => {
      try {
        // Load featured products
        const featured = await productsService.getFeatured(5, signal);
        if (signal.aborted) return;
        setFeaturedProducts(featured);

        // Load top 3 categories by sales
        const topCats = await categoriesService.getTopBySales(3, signal);
        if (signal.aborted) return;
        setTopCategories(topCats);

        // Load top 5 products for each category
        const productsMap: Record<string, Product[]> = {};
        for (const category of topCats) {
          const products = await productsService.getByCategory(category.id, 5, 'sold', 'desc', signal);
          if (signal.aborted) return;
          productsMap[category.id] = products;
        }
        setCategoryProducts(productsMap);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request cancelled');
          return;
        }
        console.error('Failed to load homepage data:', error);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      abortController.abort();
    };
  }, []);

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

  const handleCategoryClick = (category: string) => {
    navigate('/products');
  };

  // Icon mapping for categories
  const iconMap: Record<string, React.ReactNode> = {
    'Âm thanh': <Headphones className="h-6 w-6" />,
    'Đồng hồ': <Watch className="h-6 w-6" />,
    'Phụ kiện': <Package className="h-6 w-6" />,
    'Camera': <Camera className="h-6 w-6" />,
    'Gaming': <Gamepad2 className="h-6 w-6" />,
    'Smarthome': <Home className="h-6 w-6" />,
    'Laptop & PC': <Monitor className="h-6 w-6" />,
    'Điện thoại': <Smartphone className="h-6 w-6" />,
    'Tablet': <Tablet className="h-6 w-6" />,
    'Tivi': <Tv className="h-6 w-6" />,
    'Gia dụng': <Refrigerator className="h-6 w-6" />,
    'Sức khỏe': <Activity className="h-6 w-6" />,
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
      {/* <section className="container mx-auto px-4 sm:px-6 mb-6">
        <FlashSaleSection />
      </section> */}

      {/* Voucher Section */}
      {/* <section className="container mx-auto px-4 sm:px-6 mb-6">
        <VoucherSection />
      </section> */}

      {/* Trust Badges */}
      <section className="container mx-auto px-4 sm:px-6 mb-6">
        <TrustBadges />
      </section>

      {/* Featured Products */}
      {(loading || featuredProducts.length > 0) && (
        <section className="container mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="mb-2">{t('home.featured_products')}</h2>
                <p className="text-gray-600">
                  {t('home.featured_products_subtitle')}
                </p>
              </div>
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="hidden sm:flex"
              >
                {t('home.view_all')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-xl animate-pulse h-64" />
                ))}
              </div>
            ) : (
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
              {/* Flash Sale Badge - Hidden since flash sale feature is disabled */}
              {/* {product.isFlashSale && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    FLASH SALE
                  </Badge>
                </div>
              )} */}

              <div className="aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={product.thumbnailUrls?.[0] || product.images?.[0] || product.image || ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-3">
                {/* Category & Brand */}
                <div className="text-xs text-gray-500 mb-1">
                  {product.brand || (typeof product.category === 'string' ? product.category : product.category?.name)}
                </div>

                {/* Product Name */}
                <h3 className="text-sm mb-2 line-clamp-2">{product.name}</h3>

                {/* Rating - Hidden until review feature is implemented */}
                {/* {product.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs">{product.rating}</span>
                    {product.reviewCount && (
                      <span className="text-xs text-gray-500">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )} */}

                {/* Price with Discount */}
                <div className="mb-2">
                  {product.discount ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 font-semibold">
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
                    <div className="text-purple-600 font-semibold">{formatPrice(product.price)}</div>
                  )}
                </div>

                  {/* Sold Count */}
                  {product.soldCount && (
                    <div className="text-xs text-gray-500 mb-2">
                      {t('home.sold_count', { count: product.soldCount })}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    {t('products.add_to_cart')}
                  </Button>
                </div>
              </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-6 sm:hidden">
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                className="w-full"
              >
                {t('home.view_all_products')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Category Product Sections - Top 3 Categories by Sales */}
      {!loading && topCategories.map((category) => (
        <CategoryProductSection
          key={category.id}
          categoryName={category.name}
          categorySlug={category.slug}
          products={categoryProducts[category.id] || []}
          icon={iconMap[category.name]}
        />
      ))}

    </div>
  );
}