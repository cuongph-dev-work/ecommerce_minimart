import { useState, useEffect } from 'react';
import type { Order, OrderStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  MapPin,
  Store,
  Package,
  CreditCard,
  Truck,
  Printer,
  MessageSquare,
  Loader2,
  User,
} from 'lucide-react';
import {
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  formatOrderDate,
} from '@/lib/order-utils';
import { cn } from '@/lib/utils';
import { OrderStatusUpdate } from './OrderStatusUpdate';
import { OrderPaymentUpdate } from './OrderPaymentUpdate';
import { ordersService } from '@/services/orders.service';
import axios from 'axios';

interface OrderDetailsSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus, notes: string) => void;
  onPaymentUpdate?: (orderId: string) => void;
}

export function OrderDetailsSheet({ order, open, onOpenChange, onStatusUpdate, onPaymentUpdate }: OrderDetailsSheetProps) {
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [paymentUpdateOpen, setPaymentUpdateOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && order?.id) {
      fetchOrderDetail();
    } else {
      setOrderDetail(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id]);

  const fetchOrderDetail = async () => {
    if (!order?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const abortController = new AbortController();
      const detail = await ordersService.getById(order.id, abortController.signal);
      setOrderDetail(detail);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const displayOrder = orderDetail || order;

  if (!order) return null;

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus, notes: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus, notes);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết đơn hàng</DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono font-semibold">{displayOrder?.orderNumber || displayOrder?.id}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchOrderDetail}>
              Thử lại
            </Button>
          </div>
        ) : !displayOrder ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy đơn hàng
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Status and Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái đơn hàng</span>
                <Badge className={cn("border min-w-[110px] justify-center", getStatusColor(displayOrder.status))}>
                  {getStatusLabel(displayOrder.status)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Thanh toán</span>
                <Badge
                  className={cn(
                    "min-w-[120px] justify-center",
                    displayOrder.paymentStatus === 'paid'
                      ? "bg-emerald-600 text-white dark:bg-emerald-500"
                      : "bg-red-600 text-white dark:bg-red-500"
                  )}
                >
                  {displayOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin khách hàng
              </h3>
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="font-medium min-w-[100px]">Họ tên:</div>
                  <div>{displayOrder.customerName}</div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="font-medium min-w-[100px]">Số điện thoại:</div>
                  <div>{displayOrder.customerPhone}</div>
                </div>
                {displayOrder.customerEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="font-medium min-w-[100px]">Email:</div>
                    <div>{displayOrder.customerEmail}</div>
                  </div>
                )}
                {(displayOrder.notes || displayOrder.customerNotes) && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="font-medium min-w-[100px]">Ghi chú:</div>
                    <div className="text-muted-foreground italic">{displayOrder.notes || displayOrder.customerNotes}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Delivery Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Thông tin giao nhận
              </h3>
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="font-medium min-w-[120px]">Phương thức:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      {displayOrder.deliveryType === 'delivery'
                        ? '🚚 Giao hàng tận nơi'
                        : '🏪 Nhận tại cửa hàng'}
                    </span>
                    {displayOrder.expressDelivery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-600 text-white dark:bg-amber-500 min-w-[90px] justify-center">
                        <span>⚡</span>
                        <span>Hoả Tốc</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Show store info for pickup orders */}
                {displayOrder.deliveryType !== 'delivery' && (displayOrder.pickupStore || displayOrder.pickupLocation) && (
                  <>
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="font-medium min-w-[120px]">Cửa hàng:</div>
                      <div>
                        {typeof displayOrder.pickupStore === 'object'
                          ? displayOrder.pickupStore?.name
                          : typeof displayOrder.pickupLocation === 'object'
                            ? displayOrder.pickupLocation.name
                            : (displayOrder.pickupLocation as string) || 'N/A'}
                      </div>
                    </div>
                    {((typeof displayOrder.pickupStore === 'object' && displayOrder.pickupStore?.address) ||
                      (typeof displayOrder.pickupLocation === 'object' && displayOrder.pickupLocation?.address)) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="font-medium min-w-[120px]">Địa chỉ:</div>
                          <div className="text-sm">
                            {(typeof displayOrder.pickupStore === 'object' ? displayOrder.pickupStore?.address : '') ||
                              (typeof displayOrder.pickupLocation === 'object' ? displayOrder.pickupLocation?.address : '')}
                          </div>
                        </div>
                      )}
                    {((typeof displayOrder.pickupStore === 'object' && displayOrder.pickupStore?.phone) ||
                      (typeof displayOrder.pickupLocation === 'object' && displayOrder.pickupLocation?.phone)) && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="font-medium min-w-[120px]">Điện thoại:</div>
                          <div>
                            {(typeof displayOrder.pickupStore === 'object' ? displayOrder.pickupStore?.phone : '') ||
                              (typeof displayOrder.pickupLocation === 'object' ? displayOrder.pickupLocation?.phone : '')}
                          </div>
                        </div>
                      )}
                  </>
                )}

                {/* Show delivery address for delivery orders */}
                {displayOrder.deliveryType === 'delivery' && displayOrder.deliveryAddress && (
                  <div className="flex items-center gap-2">
                    <div className="font-medium min-w-[120px]">Địa chỉ giao hàng:</div>
                    <div className="text-sm">{displayOrder.deliveryAddress}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Sản phẩm</h3>
              <div className="space-y-3">
                {displayOrder.items && displayOrder.items.length > 0 ? (
                  displayOrder.items.map((item) => {
                    const product = item.product || null;
                    const productName = product?.name || item.productName || 'Sản phẩm';
                    const productImage = product?.images?.[0];

                    return (
                      <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
                          {productImage ? (
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{productName}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Số lượng: {item.quantity} × {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="font-semibold text-sm">
                          {formatCurrency(item.subtotal || item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground p-4 text-center">
                    Không có sản phẩm nào
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Tổng kết đơn hàng
              </h3>
              <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(displayOrder.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(displayOrder.shippingFee || 0)}</span>
                </div>
                {(displayOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Giảm giá {displayOrder.voucherCode && `(${displayOrder.voucherCode})`}:</span>
                    <span>-{formatCurrency(displayOrder.discount || 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatCurrency(displayOrder.total || 0)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Phương thức thanh toán:</span>
                  <Badge variant="outline" className="min-w-[200px] justify-center">Thanh toán khi nhận hàng (COD)</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trạng thái thanh toán:</span>
                  <Badge variant={displayOrder.paymentStatus === 'paid' ? 'default' : 'secondary'} className="min-w-[120px] justify-center">
                    {displayOrder.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </div>
                {((displayOrder.receiptImages && displayOrder.receiptImages.length > 0) || displayOrder.receiptImage) && (
                  <div className="space-y-2 text-sm">
                    <span>Ảnh biên lai:</span>
                    <div className="flex flex-wrap gap-2">
                      {(displayOrder.receiptImages || (displayOrder.receiptImage ? [displayOrder.receiptImage] : [])).map((img, index) => (
                        <a
                          key={index}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Ảnh {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày đặt hàng:</span>
                <span className="font-medium">{formatOrderDate(displayOrder.orderDate || displayOrder.createdAt || '')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Gọi khách hàng
              </Button>
              <Button className="flex-1" variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                In hóa đơn
              </Button>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="lg" onClick={() => setStatusUpdateOpen(true)}>
                Cập nhật trạng thái
              </Button>
              <Button className="flex-1" size="lg" variant="outline" onClick={() => setPaymentUpdateOpen(true)}>
                Cập nhật thanh toán
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Status Update Dialog */}
      {displayOrder && (
        <>
          <OrderStatusUpdate
            order={displayOrder}
            open={statusUpdateOpen}
            onOpenChange={setStatusUpdateOpen}
            onUpdate={(orderId, newStatus, notes) => {
              handleStatusUpdate(orderId, newStatus, notes);
              // Refresh order detail after status update
              if (orderId === displayOrder.id) {
                fetchOrderDetail();
              }
            }}
          />
          <OrderPaymentUpdate
            order={displayOrder}
            open={paymentUpdateOpen}
            onOpenChange={setPaymentUpdateOpen}
            onUpdate={(orderId) => {
              // Refresh order detail after payment update
              if (orderId === displayOrder.id) {
                fetchOrderDetail();
              }
              // Trigger parent refresh
              if (onPaymentUpdate) {
                onPaymentUpdate(orderId);
              }
            }}
          />
        </>
      )}
    </Dialog>
  );
}
