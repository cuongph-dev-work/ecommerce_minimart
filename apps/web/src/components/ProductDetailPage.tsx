import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Truck, Shield, Package, BadgeCheck, Award } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductReviews } from './ProductReviews';
import { ProductDescription } from './ProductDescription';
import { productsService } from '../services/products.service';
import { settingsService } from '../services/settings.service';
import type { Product } from '../types';
import { useTranslation } from 'react-i18next';

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        // Load settings and product in parallel
        const [data, settingsData] = await Promise.all([
          productsService.getById(productId, abortController.signal),
          settingsService.getAll(abortController.signal).catch(() => ({})),
        ]);
        
        if (!abortController.signal.aborted) {
          setProduct(data);
          setSettings(settingsData);
          addToRecentlyViewed(data);
          
          // Load related products from same category
          const categoryId = typeof data.category === 'string' ? data.category : data.category?.id;
          if (categoryId) {
            const related = await productsService.getByCategory(categoryId, 4, 'sold', 'desc', abortController.signal);
            const filtered = related.filter(p => p.id !== productId).slice(0, 4);
            if (!abortController.signal.aborted) {
              setRelatedProducts(filtered);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load product:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => abortController.abort();
  }, [productId, addToRecentlyViewed]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p>{t('products.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="mb-4">{t('products.not_found')}</h2>
          <Button onClick={() => navigate('/products')}>
            {t('products.back_to_list')}
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(t('products.add_to_cart_success').replace('{name}', product.name));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Get images from product - use thumbnailUrls or images array
  const images = product.thumbnailUrls && product.thumbnailUrls.length > 0
    ? product.thumbnailUrls
    : product.images && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : [];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {t('products.back')}
          </Button>
        </motion.div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {/* Images */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-4">
                <ImageWithFallback
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-xl overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-red-600'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
                <span>{typeof product.category === 'string' ? product.category : product.category?.name || ''}</span>
              </div>
              {product.brand && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 shadow-sm">
                  <Award className="h-4 w-4" />
                  <span className="font-semibold">{product.brand}</span>
                </div>
              )}
            </div>

            <h1 className="mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {(product.rating || 0).toFixed(1)} ({t('reviews.review_count', { count: product.reviewCount || 0 })})
              </span>
            </div>

            <div className="mb-6">{formatPrice(product.price)}</div>
            {/* Features */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Authentic/Official */}
                {product.isOfficial && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <BadgeCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="mb-1">{t('product_detail.features.authentic.title')}</div>
                      <p className="text-sm text-gray-600">
                        {settings.authentic_description || t('product_detail.features.authentic.description')}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Fast Delivery */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="mb-1">{t('product_detail.features.delivery.title')}</div>
                    <p className="text-sm text-gray-600">
                      {settings.delivery_info || t('product_detail.features.delivery.default')}
                    </p>
                  </div>
                </div>
                
                {/* Warranty */}
                {(product.warrantyPeriod || settings.warranty_info) && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="mb-1">{t('product_detail.features.warranty.title')}</div>
                      <p className="text-sm text-gray-600">
                        {product.warrantyPeriod || settings.warranty_info || t('product_detail.features.warranty.default')}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Stock */}
                {product.stock > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="mb-1">{t('product_detail.features.stock.title')}</div>
                      <p className="text-sm text-gray-600">
                        {t('product_detail.features.stock.description', { count: product.stock })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block mb-3">{t('product_detail.quantity')}</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="rounded-l-xl"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-center">{quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="rounded-r-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-600 text-sm">
                  {t('product_detail.stock_available', { count: product.stock })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('product_detail.add_to_cart')}
              </Button>
              <Button
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                variant="outline"
                size="lg"
                disabled={product.stock === 0}
              >
                {t('product_detail.buy_now')}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Product Description Tabs */}
        <section className="mt-12">
          <ProductDescription 
            description={product.description}
            specifications={product.specifications}
            usageGuide={product.usageGuide}
          />
        </section>

        {/* Product Reviews */}
        <section className="mt-12">
          <ProductReviews productId={productId} />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-8">{t('products.related_products')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={relatedProduct.thumbnailUrls?.[0] || relatedProduct.images?.[0] || relatedProduct.image || ''}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-gray-500 mb-1">
                      {typeof relatedProduct.category === 'string' ? relatedProduct.category : relatedProduct.category?.name || ''}
                    </div>
                    <h3 className="mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="mb-4">{formatPrice(relatedProduct.price)}</div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(relatedProduct);
                        toast.success(t('products.add_to_cart_success').replace('{name}', relatedProduct.name));
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      {t('products.add_to_cart')}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}