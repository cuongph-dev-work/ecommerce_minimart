import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, Star, Truck, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductReviews } from './ProductReviews';

interface ProductDetailPageProps {
  productId: string;
}

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === productId);
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [productId, addToRecentlyViewed]);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="mb-4">Không tìm thấy sản phẩm</h2>
          <Button onClick={() => navigate('/products')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
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

  // Mock images - in real scenario, product would have multiple images
  const images = [product.image, product.image, product.image];

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
            Quay lại
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
            <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm mb-4">
              {product.category}
            </div>

            <h1 className="mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">4.5 (128 đánh giá)</span>
            </div>

            <div className="mb-6">{formatPrice(product.price)}</div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="mb-1">Chính hãng 100%</div>
                    <p className="text-sm text-gray-600">
                      Sản phẩm chính hãng có tem
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="mb-1">Giao hàng nhanh</div>
                    <p className="text-sm text-gray-600">1-3 ngày nội thành</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="mb-1">Bảo hành chính hãng</div>
                    <p className="text-sm text-gray-600">12-24 tháng</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="mb-1">Còn hàng</div>
                    <p className="text-sm text-gray-600">
                      {product.stock} sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block mb-3">Số lượng</label>
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
                  {product.stock} sản phẩm có sẵn
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
                Thêm vào giỏ
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
                Mua ngay
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="mb-8">Sản phẩm liên quan</h2>
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
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-gray-500 mb-1">
                      {relatedProduct.category}
                    </div>
                    <h3 className="mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="mb-4">{formatPrice(relatedProduct.price)}</div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(relatedProduct);
                        toast.success(`Đã thêm ${relatedProduct.name} vào giỏ hàng`);
                      }}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      Thêm vào giỏ
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Product Reviews */}
        <section className="mt-12">
          <h2 className="mb-8">Đánh giá sản phẩm</h2>
          <ProductReviews productId={productId} />
        </section>
      </div>
    </div>
  );
}