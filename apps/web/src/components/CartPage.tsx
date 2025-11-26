import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as v from 'valibot';
import { checkoutSchema } from '../schemas/checkout.schema';
import { getFieldError, extractApiError, type ValidationError } from '../lib/error-handler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { storesService } from '../services/stores.service';
import { ordersService } from '../services/orders.service';
import type { Store } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function CartPage() {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Fetch stores from API
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        const storesData = await storesService.getAll(controller.signal);
        setStores(storesData);
        // Set first store as default if available
        if (storesData.length > 0) {
          setSelectedStoreId(storesData[0].id);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
        toast.error('Không thể tải danh sách cửa hàng');
      } finally {
        setIsLoadingStores(false);
      }
    };
    
    fetchStores();
    
    return () => controller.abort();
  }, []);

  const selectedStore = stores.find(store => store.id === selectedStoreId) || stores[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with valibot
    setValidationErrors([]);
    
    const formData = {
      name: checkoutData.name,
      phone: checkoutData.phone,
      email: checkoutData.email,
      storeId: selectedStoreId,
      notes: checkoutData.notes || undefined,
    };
    
    const result = v.safeParse(checkoutSchema, formData);
    
    if (!result.success) {
      // Convert valibot issues to ValidationError[]
      const errors: ValidationError[] = result.issues.map(issue => {
        const fieldPath = issue.path?.map(p => p.key).join('.') || 'unknown';
        return {
          field: fieldPath,
          message: issue.message,
        };
      });
      
      setValidationErrors(errors);
      // Scroll to top of dialog to show errors
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"]');
        if (dialogContent) {
          dialogContent.scrollTop = 0;
        }
      }, 100);
      return;
    }
    
    // Create order via API
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: checkoutData.name,
        customerPhone: checkoutData.phone,
        customerEmail: checkoutData.email,
        notes: checkoutData.notes || undefined,
        pickupStoreId: selectedStoreId,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await ordersService.create(orderData);
      
      toast.success(t('cart.order_created', { orderNumber: response.orderNumber }));
      clearCart();
      setShowCheckout(false);
      
      // Navigate to order tracking page after 2 seconds
      setTimeout(() => {
        navigate('/order-tracking');
      }, 2000);
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        toast.error(apiError.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button
              onClick={() => navigate('/products')}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              Khám phá sản phẩm
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">Bạn có {cart.length} sản phẩm trong giỏ hàng</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        <ImageWithFallback
                          src={
                            item.thumbnailUrls?.[0] ||
                            item.images?.[0] ||
                            item.image ||
                            ''
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div>
                            <h3 className="mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              {typeof item.category === 'string' ? item.category : item.category?.name || ''}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              removeFromCart(item.id);
                              toast.success(t('cart.product_removed'));
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center bg-gray-100 rounded-xl w-fit">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="rounded-l-xl"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="w-12 text-center">{item.quantity}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="rounded-r-xl"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-md sticky top-24"
            >
              <h3 className="mb-6">Tổng đơn hàng</h3>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatPrice(getTotalPrice())}</span>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                size="lg"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 group mb-3"
              >
                Đặt hàng
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Tiếp tục mua sắm
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thông tin đặt hàng</DialogTitle>
            <DialogDescription>
              Vui lòng điền thông tin và chọn địa điểm nhận hàng
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Section */}
            <form onSubmit={handleCheckout} className="space-y-4" id="checkout-form">
              <div>
                <label className="block mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={checkoutData.name}
                  onChange={(e) => {
                    setCheckoutData({ ...checkoutData, name: e.target.value });
                    if (getFieldError(validationErrors, 'name')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'name'));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none ${
                    getFieldError(validationErrors, 'name') ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Nguyễn Văn A"
                />
                {getFieldError(validationErrors, 'name') && (
                  <p className="text-sm text-red-500 mt-1">
                    {getFieldError(validationErrors, 'name')}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={checkoutData.phone}
                  onChange={(e) => {
                    setCheckoutData({ ...checkoutData, phone: e.target.value });
                    if (getFieldError(validationErrors, 'phone')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'phone'));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none ${
                    getFieldError(validationErrors, 'phone') ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="0912345678"
                />
                {getFieldError(validationErrors, 'phone') && (
                  <p className="text-sm text-red-500 mt-1">
                    {getFieldError(validationErrors, 'phone')}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={checkoutData.email}
                  onChange={(e) => {
                    setCheckoutData({ ...checkoutData, email: e.target.value });
                    if (getFieldError(validationErrors, 'email')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'email'));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none ${
                    getFieldError(validationErrors, 'email') ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="email@example.com"
                />
                {getFieldError(validationErrors, 'email') && (
                  <p className="text-sm text-red-500 mt-1">
                    {getFieldError(validationErrors, 'email')}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  Địa điểm nhận hàng <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedStoreId} 
                  onValueChange={(value) => {
                    setSelectedStoreId(value);
                    if (getFieldError(validationErrors, 'storeId')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'storeId'));
                    }
                  }}
                >
                  <SelectTrigger 
                    disabled={isLoadingStores}
                    className={`w-full h-12 bg-gray-50 rounded-xl ${
                      getFieldError(validationErrors, 'storeId') ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <SelectValue placeholder={isLoadingStores ? t('cart.loading_stores') : t('cart.select_store')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError(validationErrors, 'storeId') && (
                  <p className="text-sm text-red-500 mt-1">
                    {getFieldError(validationErrors, 'storeId')}
                  </p>
                )}
                
                {/* Display selected store info */}
                {selectedStore && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1.5">{selectedStore.name}</p>
                        <p className="text-xs text-gray-600 mb-1 leading-relaxed">{selectedStore.address}</p>
                        <p className="text-xs text-gray-600">📞 {selectedStore.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2">Ghi chú đơn hàng</label>
                <textarea
                  value={checkoutData.notes}
                  onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none"
                  placeholder="Ghi chú về đơn hàng..."
                />
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="mb-2">Tóm tắt đơn hàng</h4>
                <div className="space-y-2 text-sm">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-600">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between">
                    <span>Tổng cộng:</span>
                    <span className="text-red-600">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </form>

            {/* Map Section */}
            {selectedStore && (
              <div className="hidden md:block">
                <div className="sticky top-4">
                  <div className="bg-gray-100 rounded-xl overflow-hidden h-[500px]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${selectedStore.lat},${selectedStore.lng}&z=15&output=embed`}
                      allowFullScreen
                      title={`Bản đồ ${selectedStore.name}`}
                    />
                  </div>
                  <div className="mt-3 p-4 bg-white rounded-xl border">
                    <h4 className="mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      Địa điểm nhận hàng
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{selectedStore.name}</p>
                    <p className="text-xs text-gray-500">{selectedStore.address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCheckout(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {isSubmitting ? t('cart.processing') : t('cart.confirm_order')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}