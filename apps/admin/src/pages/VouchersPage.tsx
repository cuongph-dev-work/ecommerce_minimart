import { useState, useEffect } from 'react';
import { vouchersService } from '@/services/vouchers.service';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'fixed' | 'percentage';
  discount: number;
  maxDiscount?: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  status: 'active' | 'inactive' | 'expired';
}

const initialVouchers: Voucher[] = [
  {
    id: '1',
    code: 'TECH50K',
    title: 'Giảm 50K',
    description: 'Cho đơn hàng từ 500K',
    type: 'fixed',
    discount: 50000,
    minPurchase: 500000,
    maxUses: 1000,
    usedCount: 45,
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '2',
    code: 'SALE20',
    title: 'Giảm 20%',
    description: 'Tối đa 200K cho đơn từ 1 triệu',
    type: 'percentage',
    discount: 20,
    maxDiscount: 200000,
    minPurchase: 1000000,
    maxUses: 500,
    usedCount: 120,
    expiryDate: '2025-12-31',
    status: 'active',
  },
];

export function VouchersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');


  useEffect(() => {
    const controller = new AbortController();
    fetchVouchers(controller.signal);
    return () => controller.abort();
  }, [statusFilter]);

  const fetchVouchers = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await vouchersService.getAll(signal);
      
      // Transform API response to match frontend Voucher type
      const transformed = data.map((v: any) => ({
        ...v,
        title: v.code,
        description: v.description || '',
        expiryDate: v.endDate,
        usedCount: v.usedCount || 0,
      }));

      let filtered = transformed;
      if (statusFilter !== 'all') {
        filtered = transformed.filter((voucher: any) => voucher.status === statusFilter);
      }
      
      setVouchers(filtered);
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      // Silently fail for fetch
    } finally {
      setIsLoading(false);
    }
  };

  // Form state
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherTitle, setNewVoucherTitle] = useState('');
  const [newVoucherDescription, setNewVoucherDescription] = useState('');
  const [newVoucherType, setNewVoucherType] = useState<'fixed' | 'percentage'>('fixed');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState('');
  const [newVoucherMaxDiscount, setNewVoucherMaxDiscount] = useState('');
  const [newVoucherMinPurchase, setNewVoucherMinPurchase] = useState('');
  const [newVoucherMaxUses, setNewVoucherMaxUses] = useState('');
  const [newVoucherExpiryDate, setNewVoucherExpiryDate] = useState('');
  const [newVoucherStatus, setNewVoucherStatus] = useState<'active' | 'inactive' | 'expired'>('active');

  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveVoucher = async () => {
    // Frontend validation
    const errors: ValidationError[] = [];

    // Validate code
    if (!newVoucherCode || newVoucherCode.trim().length === 0) {
      errors.push({ field: 'code', message: 'Mã voucher không được để trống' });
    } else if (newVoucherCode.length < 3 || newVoucherCode.length > 20) {
      errors.push({ field: 'code', message: 'Mã voucher phải từ 3-20 ký tự' });
    } else if (!/^[A-Z0-9]+$/.test(newVoucherCode)) {
      errors.push({ field: 'code', message: 'Mã voucher chỉ được chứa chữ in hoa và số' });
    }

    // Validate discount
    if (!newVoucherDiscount || isNaN(Number(newVoucherDiscount))) {
      errors.push({ field: 'discount', message: 'Giá trị giảm giá phải là số hợp lệ' });
    } else if (Number(newVoucherDiscount) < 0) {
      errors.push({ field: 'discount', message: 'Giá trị giảm giá phải >= 0' });
    }

    // Validate minPurchase
    if (!newVoucherMinPurchase || isNaN(Number(newVoucherMinPurchase))) {
      errors.push({ field: 'minPurchase', message: 'Đơn hàng tối thiểu phải là số hợp lệ' });
    } else if (Number(newVoucherMinPurchase) < 0) {
      errors.push({ field: 'minPurchase', message: 'Đơn hàng tối thiểu phải >= 0' });
    }

    // Validate maxDiscount (optional)
    if (newVoucherMaxDiscount && isNaN(Number(newVoucherMaxDiscount))) {
      errors.push({ field: 'maxDiscount', message: 'Giảm tối đa phải là số hợp lệ' });
    } else if (newVoucherMaxDiscount && Number(newVoucherMaxDiscount) < 0) {
      errors.push({ field: 'maxDiscount', message: 'Giảm tối đa phải >= 0' });
    }

    // Validate maxUses (optional)
    if (newVoucherMaxUses && isNaN(Number(newVoucherMaxUses))) {
      errors.push({ field: 'maxUses', message: 'Số lượt sử dụng phải là số hợp lệ' });
    } else if (newVoucherMaxUses && Number(newVoucherMaxUses) < 1) {
      errors.push({ field: 'maxUses', message: 'Số lượt sử dụng phải >= 1' });
    } else if (newVoucherMaxUses && !Number.isInteger(Number(newVoucherMaxUses))) {
      errors.push({ field: 'maxUses', message: 'Số lượt sử dụng phải là số nguyên' });
    }

    // Validate expiryDate
    if (!newVoucherExpiryDate || newVoucherExpiryDate.trim().length === 0) {
      errors.push({ field: 'expiryDate', message: 'Vui lòng chọn ngày hết hạn' });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);

      const voucherData = {
        code: newVoucherCode,
        type: newVoucherType,
        value: Number(newVoucherDiscount),
        maxDiscount: newVoucherMaxDiscount ? Number(newVoucherMaxDiscount) : undefined,
        minOrderValue: Number(newVoucherMinPurchase),
        usageLimit: newVoucherMaxUses ? Number(newVoucherMaxUses) : undefined,
        startDate: new Date().toISOString(),
        endDate: newVoucherExpiryDate,
        status: newVoucherStatus,
      };

      if (editingVoucher) {
        await vouchersService.update(editingVoucher.id, voucherData);
      } else {
        await vouchersService.create(voucherData);
      }

      setIsAddDialogOpen(false);
      resetForm();
      await fetchVouchers();
    } catch (err: any) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setValidationErrors([{ field: 'code', message: apiError.message }]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setNewVoucherCode(voucher.code);
    setNewVoucherTitle(voucher.title);
    setNewVoucherDescription(voucher.description);
    setNewVoucherType(voucher.type);
    setNewVoucherDiscount(voucher.discount.toString());
    setNewVoucherMaxDiscount(voucher.maxDiscount?.toString() || '');
    setNewVoucherMinPurchase(voucher.minPurchase.toString());
    setNewVoucherMaxUses(voucher.maxUses.toString());
    setNewVoucherExpiryDate(voucher.expiryDate);
    setNewVoucherStatus(voucher.status);
    setIsAddDialogOpen(true);
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await vouchersService.delete(id);
      setVoucherToDelete(null);
      await fetchVouchers();
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa voucher');
    }
  };

  const resetForm = () => {
    setEditingVoucher(null);
    setNewVoucherCode('');
    setNewVoucherTitle('');
    setNewVoucherDescription('');
    setNewVoucherType('fixed');
    setNewVoucherDiscount('');
    setNewVoucherMaxDiscount('');
    setNewVoucherMinPurchase('');
    setNewVoucherMaxUses('');
    setNewVoucherExpiryDate('');
    setNewVoucherStatus('active');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600';
      case 'expired':
        return 'bg-rose-500/10 text-rose-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'inactive':
        return 'Tạm dừng';
      case 'expired':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vouchers / Mã giảm giá</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý các mã giảm giá và voucher
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? 'Sửa Voucher' : 'Thêm Voucher Mới'}</DialogTitle>
              <DialogDescription>
                {editingVoucher ? 'Cập nhật thông tin voucher' : 'Tạo mã giảm giá mới'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã voucher <span className="text-destructive">*</span></Label>
                  <Input
                    value={newVoucherCode}
                    onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                    placeholder="TECH50K"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tiêu đề</Label>
                  <Input
                    value={newVoucherTitle}
                    onChange={(e) => setNewVoucherTitle(e.target.value)}
                    placeholder="Giảm 50K"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Input
                  value={newVoucherDescription}
                  onChange={(e) => setNewVoucherDescription(e.target.value)}
                  placeholder="Cho đơn hàng từ 500K"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại giảm giá</Label>
                  <select
                    value={newVoucherType}
                    onChange={(e) => setNewVoucherType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="fixed">Số tiền cố định</option>
                    <option value="percentage">Phần trăm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Giá trị giảm giá <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={newVoucherDiscount}
                    onChange={(e) => setNewVoucherDiscount(e.target.value)}
                    placeholder={newVoucherType === 'fixed' ? '50000' : '20'}
                  />
                </div>
              </div>

              {newVoucherType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Giảm tối đa (VNĐ)</Label>
                  <Input
                    type="number"
                    value={newVoucherMaxDiscount}
                    onChange={(e) => setNewVoucherMaxDiscount(e.target.value)}
                    placeholder="200000"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Đơn hàng tối thiểu (VNĐ) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    value={newVoucherMinPurchase}
                    onChange={(e) => setNewVoucherMinPurchase(e.target.value)}
                    placeholder="500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số lượt sử dụng tối đa</Label>
                  <Input
                    type="number"
                    value={newVoucherMaxUses}
                    onChange={(e) => setNewVoucherMaxUses(e.target.value)}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày hết hạn <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={newVoucherExpiryDate}
                    onChange={(e) => setNewVoucherExpiryDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <select
                    value={newVoucherStatus}
                    onChange={(e) => setNewVoucherStatus(e.target.value as 'active' | 'inactive' | 'expired')}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSaveVoucher} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : editingVoucher ? 'Cập nhật' : 'Lưu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm voucher..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Đang tải voucher...
                </TableCell>
              </TableRow>
            ) : filteredVouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy voucher
                </TableCell>
              </TableRow>
            ) : (
              filteredVouchers.map((voucher) => (
              <TableRow key={voucher.id} className="group">
                <TableCell className="font-mono font-medium">{voucher.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{voucher.title}</div>
                  <div className="text-xs text-muted-foreground">{voucher.description}</div>
                </TableCell>
                <TableCell>
                  {voucher.type === 'fixed' ? (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600">Cố định</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-600">Phần trăm</span>
                  )}
                </TableCell>
                <TableCell>
                  {voucher.type === 'fixed' ? (
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(voucher.discount)}₫</span>
                  ) : (
                    <span className="font-medium">{voucher.discount}% {voucher.maxDiscount && `(tối đa ${new Intl.NumberFormat('vi-VN').format(voucher.maxDiscount)}₫)`}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {voucher.usedCount} / {voucher.maxUses}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(voucher.status))}>
                    {getStatusLabel(voucher.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEditVoucher(voucher)}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setVoucherToDelete(voucher.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!voucherToDelete} onOpenChange={(open) => !open && setVoucherToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoucherToDelete(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => voucherToDelete && handleDeleteVoucher(voucherToDelete)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

