import { useState, useEffect } from 'react';
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
import { AlertCircle, Loader2 } from 'lucide-react';
import { ordersService } from '@/services/orders.service';

interface OrderStatusUpdateProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (orderId: string, newStatus: OrderStatus, notes: string) => void;
}

export function OrderStatusUpdate({ order, open, onOpenChange, onUpdate }: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedStatus(null);
      setNotes('');
      setError(null);
    }
  }, [open]);

  if (!order) return null;

  const validStatuses = getValidNextStatuses(order.status);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Call API
      await ordersService.updateStatus(order.id, {
        status: selectedStatus,
        notes: notes.trim() || undefined,
      });

      // Call callback if provided
      if (onUpdate) {
        onUpdate(order.id, selectedStatus, notes);
      }

      // Reset form and close
      setSelectedStatus(null);
      setNotes('');
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Không thể cập nhật trạng thái đơn hàng';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
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

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <strong>Lưu ý:</strong> Đơn hàng này là nhận tại cửa hàng.
            Các trạng thái khả dụng phụ thuộc vào trạng thái hiện tại.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStatus || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật trạng thái'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
