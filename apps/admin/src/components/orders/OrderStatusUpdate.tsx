import { useState } from 'react';
import type { Order, OrderStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getValidNextStatuses, getStatusLabel } from '@/lib/order-utils';
import { AlertCircle } from 'lucide-react';

interface OrderStatusUpdateProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (orderId: string, newStatus: OrderStatus, notes: string) => void;
}

export function OrderStatusUpdate({ order, open, onOpenChange, onUpdate }: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');

  if (!order) return null;

  const validStatuses = getValidNextStatuses(order.status, order.deliveryMethod);

  const handleSubmit = () => {
    if (selectedStatus) {
      onUpdate(order.id, selectedStatus, notes);
      // Reset form
      setSelectedStatus(null);
      setNotes('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(null);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono font-semibold">{order.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Trạng thái hiện tại</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
              {getStatusLabel(order.status)}
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="new-status">Trạng thái mới *</Label>
            {validStatuses.length > 0 ? (
              <Select value={selectedStatus || ''} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Chọn trạng thái mới" />
                </SelectTrigger>
                <SelectContent>
                  {validStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  Không có trạng thái tiếp theo hợp lệ. Đơn hàng đã ở trạng thái cuối cùng.
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú về việc cập nhật trạng thái (không bắt buộc)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Delivery Method Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Lưu ý:</strong> Đơn hàng này là{' '}
            {order.deliveryMethod === 'pickup' ? 'nhận tại cửa hàng' : 'giao hàng tận nơi'}.
            Các trạng thái khả dụng phụ thuộc vào phương thức giao nhận.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStatus}
          >
            Cập nhật trạng thái
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
