import { useState, useEffect } from 'react';
import type { Order, PaymentStatus } from '@/types';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import { uploadService } from '@/services/upload.service';
import { formatCurrency } from '@/lib/order-utils';

interface OrderPaymentUpdateProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (orderId: string) => void;
}

export function OrderPaymentUpdate({ order, open, onOpenChange, onUpdate }: OrderPaymentUpdateProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [amount, setAmount] = useState<string>('0');
  const [note, setNote] = useState('');
  const [receiptImages, setReceiptImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open && order) {
      setPaymentStatus(order.paymentStatus);
      setAmount(order.total.toString());
      setNote('');
      // Support both old receiptImage and new receiptImages
      const images = order.receiptImages || (order.receiptImage ? [order.receiptImage] : []);
      setReceiptImages(images);
      setError(null);
      setUploadProgress(0);
      setUploadingIndex(null);
    }
  }, [open, order]);

  if (!order) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate all files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
    }

    // Check total images limit (max 10)
    if (receiptImages.length + fileArray.length > 10) {
      setError('Tối đa 10 ảnh biên lai');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadingIndex(i);
        setUploadProgress(0);

        const result = await uploadService.uploadImage(
          file,
          'product',
          (progress: number) => {
            setUploadProgress(progress);
          }
        );

        uploadedUrls.push(result.url);
      }

      setReceiptImages(prev => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Không thể upload hình ảnh';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingIndex(null);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setReceiptImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 0) {
        setError('Số tiền không hợp lệ');
        return;
      }

      // Call API
      await ordersService.updatePayment(order.id, {
        paymentStatus,
        amount: amountNum,
        note: note.trim() || undefined,
        receiptImages: receiptImages.length > 0 ? receiptImages : undefined,
      });

      // Call callback if provided
      if (onUpdate) {
        onUpdate(order.id);
      }

      // Reset and close
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'Không thể cập nhật trạng thái thanh toán';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPaymentStatus(order.paymentStatus);
    setAmount(order.total.toString());
    setNote('');
    const images = order.receiptImages || (order.receiptImage ? [order.receiptImage] : []);
    setReceiptImages(images);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
          <DialogDescription>
            Mã đơn: <span className="font-mono font-semibold">{order.orderNumber || order.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Payment Status */}
          <div className="space-y-2">
            <Label>Trạng thái thanh toán hiện tại</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
              {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </div>
          </div>

          {/* New Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment-status">Trạng thái thanh toán mới *</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
              <SelectTrigger id="payment-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền"
            />
            {order.total > 0 && (
              <p className="text-xs text-muted-foreground">
                Tổng đơn hàng: {formatCurrency(order.total)}
              </p>
            )}
          </div>

          {/* Receipt Images */}
          <div className="space-y-2">
            <Label>Ảnh biên lai (tùy chọn, tối đa 10 ảnh)</Label>
            
            {/* Display uploaded images */}
            {receiptImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {receiptImages.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square border rounded-lg overflow-hidden bg-muted group">
                    <img
                      src={imageUrl}
                      alt={`Receipt ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 bg-white/90 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('receipt-upload')?.click()}
                disabled={isUploading || receiptImages.length >= 10}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading 
                  ? `Đang upload... ${uploadingIndex !== null ? `${uploadingIndex + 1}/${receiptImages.length + (uploadingIndex !== null ? 1 : 0)}` : ''} ${uploadProgress}%` 
                  : receiptImages.length >= 10 
                    ? 'Đã đạt giới hạn 10 ảnh'
                    : 'Chọn ảnh biên lai (có thể chọn nhiều)'
                }
              </Button>
              {isUploading && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            
            <Input
              id="receipt-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={isUploading || receiptImages.length >= 10}
            />
            <p className="text-xs text-muted-foreground">
              Hỗ trợ: JPG, PNG, WebP. Tối đa 5MB/ảnh. Đã chọn: {receiptImages.length}/10
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú về thanh toán (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting || isUploading}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              'Cập nhật thanh toán'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

