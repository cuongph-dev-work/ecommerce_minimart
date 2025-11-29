import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, Calendar, ChevronDown, History, Trash2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import * as v from 'valibot';
import { getFieldError, extractApiError, type ValidationError } from '../lib/error-handler';
import { ordersService, type Order } from '../services/orders.service';
import { orderHistoryService, type OrderHistoryItem } from '../lib/order-history';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function OrderTrackingPage() {
  const { t } = useTranslation();
  
  // Validation schema with i18n
  const getTrackingSchema = () => v.object({
    orderNumber: v.pipe(
      v.string(t('order_tracking.validation.order_number_required')),
      v.minLength(1, t('order_tracking.validation.order_number_empty'))
    ),
    phone: v.pipe(
      v.string(t('order_tracking.validation.phone_required')),
      v.regex(/^[0-9]{10,11}$/, t('order_tracking.validation.phone_invalid'))
    ),
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    const loadedHistory = orderHistoryService.getAll();
    setHistory(loadedHistory);
  }, []);

  const handleSearch = async () => {
    // Validate
    setValidationErrors([]);
    setNotFound(false);

    const result = v.safeParse(getTrackingSchema(), {
      orderNumber,
      phone: phoneNumber,
    });

    if (!result.success) {
      const errors: ValidationError[] = result.issues.map(issue => {
        const fieldPath = issue.path?.map(p => p.key).join('.') || 'unknown';
        return {
          field: fieldPath,
          message: issue.message,
        };
      });
      setValidationErrors(errors);
      return;
    }

    setIsSearching(true);

    try {
      const response = await ordersService.trackOrder(orderNumber, phoneNumber);
      setOrderData(response);
      setNotFound(false);
      
      // Lưu vào history
      orderHistoryService.add(orderNumber, phoneNumber, response);
      const updatedHistory = orderHistoryService.getAll();
      setHistory(updatedHistory);
    } catch (err) {
      const apiError = extractApiError(err);
      setNotFound(true);
      setOrderData(null);
      toast.error(apiError.message || t('order_tracking.not_found'));
    } finally {
      setIsSearching(false);
    }
  };

  const refreshOrder = async (orderNumber: string, phone: string) => {
    setIsSearching(true);
    try {
      const response = await ordersService.trackOrder(orderNumber, phone);
      setOrderData(response);
      setNotFound(false);
      
      // Update history with latest data
      orderHistoryService.add(orderNumber, phone, response);
      const updatedHistory = orderHistoryService.getAll();
      setHistory(updatedHistory);
      toast.success(t('order_tracking.updated'));
    } catch (err) {
      const apiError = extractApiError(err);
      setNotFound(true);
      setOrderData(null);
      toast.error(apiError.message || t('order_tracking.not_found'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryClick = async (item: OrderHistoryItem) => {
    setOrderNumber(item.orderNumber);
    setPhoneNumber(item.phone);
    setExpandedHistoryId(null);
    setShowHistory(false);
    setNotFound(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch latest data from API
    await refreshOrder(item.orderNumber, item.phone);
  };

  const handleRemoveHistory = (e: React.MouseEvent, item: OrderHistoryItem) => {
    e.stopPropagation();
    orderHistoryService.remove(item.orderNumber, item.phone);
    const updatedHistory = orderHistoryService.getAll();
    setHistory(updatedHistory);
    toast.success(t('order_tracking.removed_from_history'));
  };

  const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${t('order_tracking.date_format.at')} ${hours}:${minutes} ${day} ${t('order_tracking.date_format.month')} ${month}, ${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-600 border-orange-300';
      case 'confirmed':
        return 'bg-red-50 text-red-600 border-blue-200';
      case 'processing':
      case 'preparing':
        return 'bg-purple-100 text-red-600 border-gray-200';
      case 'ready':
        return 'bg-red-50 text-red-600 border-blue-200';
      case 'completed':
      case 'received':
        return 'bg-green-100 text-green-600 border-gray-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return t(`order_tracking.status.${status}`, status);
  };

  const getTrackingSteps = (status: string, createdAt: string) => {
    const baseDate = new Date(createdAt);
    const steps = [
      {
        title: t('order_tracking.tracking_steps.placed.title'),
        description: t('order_tracking.tracking_steps.placed.description'),
        date: new Date(baseDate.getTime()),
        completed: true,
      },
      {
        title: t('order_tracking.tracking_steps.confirmed.title'),
        description: t('order_tracking.tracking_steps.confirmed.description'),
        date: new Date(baseDate.getTime() + 1.5 * 3600000), // +1.5 hours
        completed: ['confirmed', 'preparing', 'processing', 'ready', 'received', 'completed'].includes(status),
      },
      {
        title: t('order_tracking.tracking_steps.processing.title'),
        description: t('order_tracking.tracking_steps.processing.description'),
        date: new Date(baseDate.getTime() + 24 * 3600000), // +1 day
        completed: ['preparing', 'processing', 'ready', 'received', 'completed'].includes(status),
      },
      {
        title: t('order_tracking.tracking_steps.ready.title'),
        description: t('order_tracking.tracking_steps.ready.description'),
        date: new Date(baseDate.getTime() + 2 * 24 * 3600000), // +2 days
        completed: ['ready', 'received', 'completed'].includes(status),
      },
      {
        title: t('order_tracking.tracking_steps.completed.title'),
        description: t('order_tracking.tracking_steps.completed.description'),
        date: new Date(baseDate.getTime() + 3 * 24 * 3600000), // +3 days
        completed: ['received', 'completed'].includes(status),
      },
    ];

    return steps;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="mb-4">{t('order_tracking.title')}</h1>
          <p className="text-gray-600">
            {t('order_tracking.subtitle')}
          </p>
        </motion.div>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-gray-600" />
                <span className="font-semibold">Lịch sử tra cứu ({history.length})</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${
                  showHistory ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t divide-y">
                    {history.map((item, _index) => {
                      const historyId = `${item.orderNumber}-${item.phone}`;
                      const isExpanded = expandedHistoryId === historyId;
                      
                      return (
                        <div key={historyId}>
                          <button
                            onClick={() => {
                              setExpandedHistoryId(isExpanded ? null : historyId);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  #{item.orderNumber}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.orderData.status)}`}>
                                  {getStatusText(item.orderData.status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {item.phone} • {formatHistoryDate(item.searchedAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  refreshOrder(item.orderNumber, item.phone);
                                }}
                                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                title="Cập nhật trạng thái"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleRemoveHistory(e, item)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Xóa khỏi lịch sử"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronDown
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-gray-50"
                              >
                                <div className="p-4 space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng cộng:</span>
                                    <span className="font-semibold text-red-600">
                                      {formatPrice(item.orderData.total)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sản phẩm:</span>
                                    <span className="font-medium">
                                      {item.orderData.items.length} sản phẩm
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => handleHistoryClick(item)}
                                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                                    size="sm"
                                  >
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Search Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                {t('order_tracking.order_number')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value.toUpperCase());
                  if (getFieldError(validationErrors, 'orderNumber')) {
                    setValidationErrors(validationErrors.filter(err => err.field !== 'orderNumber'));
                  }
                }}
                placeholder={t('order_tracking.order_number_placeholder')}
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                  getFieldError(validationErrors, 'orderNumber')
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
              />
              {getFieldError(validationErrors, 'orderNumber') && (
                <p className="text-sm text-red-500 mt-1">
                  {getFieldError(validationErrors, 'orderNumber')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                {t('order_tracking.phone_number')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (getFieldError(validationErrors, 'phone')) {
                    setValidationErrors(validationErrors.filter(err => err.field !== 'phone'));
                  }
                }}
                placeholder={t('order_tracking.phone_number_placeholder')}
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                  getFieldError(validationErrors, 'phone')
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                }`}
              />
              {getFieldError(validationErrors, 'phone') && (
                <p className="text-sm text-red-500 mt-1">
                  {getFieldError(validationErrors, 'phone')}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!orderNumber || !phoneNumber || isSearching}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            size="lg"
          >
            <Search className="mr-2 h-5 w-5" />
            {isSearching ? t('order_tracking.searching') : t('order_tracking.search_button')}
          </Button>

          {/* Info hint */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>{t('order_tracking.hint_title')}</strong> {t('order_tracking.hint_message')}
            </p>
          </div>
        </motion.div>

        {/* Not Found Message */}
        {notFound && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-red-900 mb-2">{t('order_tracking.not_found_title')}</h3>
            <p className="text-red-700">
              {t('order_tracking.not_found_message')}
            </p>
          </motion.div>
        )}

        {/* Order Details */}
        {orderData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            {/* Order Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="mb-2">{t('order_tracking.order_details', { orderNumber: orderData.orderNumber || orderData.id })}</h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('order_tracking.order_date')} {formatDate(orderData.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshOrder(orderData.orderNumber || orderData.id, orderData.customerPhone)}
                    disabled={isSearching}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    title="Cập nhật trạng thái"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`} />
                  </Button>
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(orderData.status)}`}
                  >
                    {getStatusText(orderData.status)}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {orderData.pickupStore ? t('order_tracking.pickup_location') : t('order_tracking.delivery_address')}
                    </div>
                    {orderData.pickupStore ? (
                      <>
                        <p className="text-gray-900">{orderData.pickupStore.name}</p>
                        <p className="text-gray-600 text-sm">{orderData.pickupStore.address}</p>
                      </>
                    ) : (
                      <p className="text-gray-900">-</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t('order_tracking.customer_info')}</div>
                    <p className="text-gray-900">{orderData.customerName}</p>
                    <p className="text-gray-600">{orderData.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="mb-4">{t('order_tracking.products', { count: orderData.items.length })}</h4>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">{t('order_tracking.quantity')} {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-lg">{t('order_tracking.total')}</span>
                  <span className="text-2xl text-red-600 font-semibold">
                    {formatPrice(orderData.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h3 className="mb-6">{t('order_tracking.status_title')}</h3>
              
              <div className="relative">
                {getTrackingSteps(orderData.status, orderData.createdAt).map((step, index) => (
                  <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Timeline line */}
                    {index < getTrackingSteps(orderData.status, orderData.createdAt).length - 1 && (
                      <div
                        className={`absolute left-[1.125rem] top-14 w-[2px] h-full transition-colors ${
                          step.completed ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Icon with ring */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                          step.completed ? 'shadow-lg' : ''
                        }`}
                        style={step.completed ? {
                          backgroundColor: index === 0 && orderData.status === 'pending' ? '#f97316' : '#16a34a',
                          boxShadow: index === 0 && orderData.status === 'pending'
                            ? '0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 0 0 4px rgba(255, 237, 213, 1)'
                            : '0 4px 6px -1px rgba(22, 163, 74, 0.3), 0 0 0 4px rgba(220, 252, 231, 1)'
                        } : {
                          backgroundColor: '#f3f4f6',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(229, 231, 235, 1)'
                        }}
                      >
                        {index === 0 && (
                          <Package 
                            className="h-4 w-4" 
                            style={{ 
                              color: step.completed ? '#ffffff' : '#9ca3af',
                              strokeWidth: 2.5 
                            }} 
                          />
                        )}
                        {index === 1 && (
                          <CheckCircle 
                            className="h-4 w-4" 
                            style={{ 
                              color: step.completed ? '#ffffff' : '#9ca3af',
                              strokeWidth: 2.5 
                            }} 
                          />
                        )}
                        {index === 2 && (
                          <Clock 
                            className="h-4 w-4" 
                            style={{ 
                              color: step.completed ? '#ffffff' : '#9ca3af',
                              strokeWidth: 2.5 
                            }} 
                          />
                        )}
                        {index === 3 && (
                          <Truck 
                            className="h-4 w-4" 
                            style={{ 
                              color: step.completed ? '#ffffff' : '#9ca3af',
                              strokeWidth: 2.5 
                            }} 
                          />
                        )}
                        {index === 4 && (
                          <CheckCircle 
                            className="h-4 w-4" 
                            style={{ 
                              color: step.completed ? '#ffffff' : '#9ca3af',
                              strokeWidth: 2.5 
                            }} 
                          />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <div className={`mb-1.5 font-semibold transition-colors ${
                        step.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{step.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(step.date.toISOString())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

