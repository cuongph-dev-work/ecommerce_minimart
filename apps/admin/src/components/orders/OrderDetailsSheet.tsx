import { useState } from 'react';
import type { Order, OrderStatus } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
} from 'lucide-react';
import {
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  getDeliveryMethodLabel,
  formatOrderDate,
} from '@/lib/order-utils';
import { cn } from '@/lib/utils';
import { OrderStatusUpdate } from './OrderStatusUpdate';

interface OrderDetailsSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus, notes: string) => void;
}

export function OrderDetailsSheet({ order, open, onOpenChange, onStatusUpdate }: OrderDetailsSheetProps) {
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus, notes: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus, notes);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Chi tiết đơn hàng</SheetTitle>
          <SheetDescription>
            Mã đơn: <span className="font-mono font-semibold">{order.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái</span>
            <Badge className={cn("border", getStatusColor(order.status))}>
              {getStatusLabel(order.status)}
            </Badge>
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
                <div className="font-medium min-w-[100px]">Họ tên:</div>
                <div>{order.customerName}</div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="font-medium min-w-[100px]">Số điện thoại:</div>
                <div>{order.customerPhone}</div>
              </div>
              {order.customerEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="font-medium min-w-[100px]">Email:</div>
                  <div>{order.customerEmail}</div>
                </div>
              )}
              {order.customerNotes && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="font-medium min-w-[100px]">Ghi chú:</div>
                  <div className="text-muted-foreground italic">{order.customerNotes}</div>
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
                <div>{getDeliveryMethodLabel(order.deliveryMethod)}</div>
              </div>
              
              {order.deliveryMethod === 'pickup' && order.storeInfo && (
                <>
                  <div className="flex items-start gap-2">
                    <Store className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="font-medium min-w-[120px]">Cửa hàng:</div>
                    <div>{order.storeInfo.name}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="font-medium min-w-[120px]">Địa chỉ:</div>
                    <div className="text-sm">{order.storeInfo.address}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="font-medium min-w-[120px]">Điện thoại:</div>
                    <div>{order.storeInfo.phone}</div>
                  </div>
                </>
              )}

              {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="font-medium min-w-[120px]">Địa chỉ giao:</div>
                  <div className="text-sm">
                    {order.deliveryAddress.fullAddress}, {order.deliveryAddress.ward}, {order.deliveryAddress.district}, {order.deliveryAddress.city}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Sản phẩm</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.productName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Số lượng: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
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
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Giảm giá {order.voucherCode && `(${order.voucherCode})`}:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Phương thức thanh toán:</span>
                <Badge variant="outline">Thanh toán khi nhận hàng (COD)</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trạng thái thanh toán:</span>
                <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày đặt hàng:</span>
              <span className="font-medium">{formatOrderDate(order.orderDate)}</span>
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

          <Button className="w-full" size="lg" onClick={() => setStatusUpdateOpen(true)}>
            Cập nhật trạng thái
          </Button>
        </div>
      </SheetContent>

      {/* Status Update Dialog */}
      <OrderStatusUpdate
        order={order}
        open={statusUpdateOpen}
        onOpenChange={setStatusUpdateOpen}
        onUpdate={handleStatusUpdate}
      />
    </Sheet>
  );
}
