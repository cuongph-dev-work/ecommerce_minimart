import { useState } from 'react';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

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

  const handleSaveVoucher = () => {
    if (editingVoucher) {
      setVouchers(vouchers.map(v =>
        v.id === editingVoucher.id
          ? {
              ...v,
              code: newVoucherCode,
              title: newVoucherTitle,
              description: newVoucherDescription,
              type: newVoucherType,
              discount: Number(newVoucherDiscount),
              maxDiscount: newVoucherMaxDiscount ? Number(newVoucherMaxDiscount) : undefined,
              minPurchase: Number(newVoucherMinPurchase),
              maxUses: Number(newVoucherMaxUses),
              expiryDate: newVoucherExpiryDate,
              status: newVoucherStatus,
            }
          : v
      ));
    } else {
      const newVoucher: Voucher = {
        id: Math.random().toString(36).substr(2, 9),
        code: newVoucherCode,
        title: newVoucherTitle,
        description: newVoucherDescription,
        type: newVoucherType,
        discount: Number(newVoucherDiscount),
        maxDiscount: newVoucherMaxDiscount ? Number(newVoucherMaxDiscount) : undefined,
        minPurchase: Number(newVoucherMinPurchase),
        maxUses: Number(newVoucherMaxUses),
        usedCount: 0,
        expiryDate: newVoucherExpiryDate,
        status: newVoucherStatus,
      };
      setVouchers([newVoucher, ...vouchers]);
    }
    setIsAddSheetOpen(false);
    resetForm();
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
    setIsAddSheetOpen(true);
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers(vouchers.filter(v => v.id !== id));
    setVoucherToDelete(null);
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
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm Voucher
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingVoucher ? 'Sửa Voucher' : 'Thêm Voucher Mới'}</SheetTitle>
              <SheetDescription>
                {editingVoucher ? 'Cập nhật thông tin voucher' : 'Tạo mã giảm giá mới'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mã voucher *</Label>
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
                  <Label>Giá trị giảm giá *</Label>
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
                  <Label>Đơn hàng tối thiểu (VNĐ)</Label>
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
                  <Label>Ngày hết hạn</Label>
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
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveVoucher}>
                {editingVoucher ? 'Cập nhật' : 'Lưu'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
            {filteredVouchers.map((voucher) => (
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
            ))}
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

