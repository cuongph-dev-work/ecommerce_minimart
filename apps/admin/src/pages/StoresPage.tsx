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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Search, Edit, Trash2, MoreHorizontal, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  workingHours: {
    weekdays: { start: string; end: string };
    weekends: { start: string; end: string };
  };
  services: string[];
  allowPickup: boolean;
  preparationTime: string;
  status: 'active' | 'inactive';
  orderCount?: number;
}

const initialStores: Store[] = [
  {
    id: '1',
    name: 'Chi nhánh Quận 1 - TP.HCM',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phone: '028 1234 5678',
    email: 'quan1@store.vn',
    lat: 10.7769,
    lng: 106.7009,
    workingHours: {
      weekdays: { start: '08:00', end: '21:00' },
      weekends: { start: '09:00', end: '20:00' },
    },
    services: [
      'Trải nghiệm sản phẩm trực tiếp',
      'Tư vấn chuyên sâu từ chuyên gia',
      'Hỗ trợ cài đặt và kích hoạt',
    ],
    allowPickup: true,
    preparationTime: '1-2 ngày',
    status: 'active',
    orderCount: 15,
  },
];

const availableServices = [
  'Trải nghiệm sản phẩm trực tiếp',
  'Tư vấn chuyên sâu từ chuyên gia',
  'Hỗ trợ cài đặt và kích hoạt',
  'Bảo hành và sửa chữa nhanh',
  'Đổi trả trong 7 ngày',
  'Miễn phí gửi xe ô tô, xe máy',
];

export function StoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);

  // Form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreLat, setNewStoreLat] = useState('');
  const [newStoreLng, setNewStoreLng] = useState('');
  const [newStoreWeekdaysStart, setNewStoreWeekdaysStart] = useState('08:00');
  const [newStoreWeekdaysEnd, setNewStoreWeekdaysEnd] = useState('21:00');
  const [newStoreWeekendsStart, setNewStoreWeekendsStart] = useState('09:00');
  const [newStoreWeekendsEnd, setNewStoreWeekendsEnd] = useState('20:00');
  const [newStoreServices, setNewStoreServices] = useState<string[]>([]);
  const [newStoreAllowPickup, setNewStoreAllowPickup] = useState(true);
  const [newStorePreparationTime, setNewStorePreparationTime] = useState('1-2 ngày');
  const [newStoreStatus, setNewStoreStatus] = useState<'active' | 'inactive'>('active');

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleService = (service: string) => {
    setNewStoreServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSaveStore = () => {
    if (editingStore) {
      setStores(stores.map(s =>
        s.id === editingStore.id
          ? {
              ...s,
              name: newStoreName,
              address: newStoreAddress,
              phone: newStorePhone,
              email: newStoreEmail,
              lat: Number(newStoreLat),
              lng: Number(newStoreLng),
              workingHours: {
                weekdays: { start: newStoreWeekdaysStart, end: newStoreWeekdaysEnd },
                weekends: { start: newStoreWeekendsStart, end: newStoreWeekendsEnd },
              },
              services: newStoreServices,
              allowPickup: newStoreAllowPickup,
              preparationTime: newStorePreparationTime,
              status: newStoreStatus,
            }
          : s
      ));
    } else {
      const newStore: Store = {
        id: Math.random().toString(36).substr(2, 9),
        name: newStoreName,
        address: newStoreAddress,
        phone: newStorePhone,
        email: newStoreEmail,
        lat: Number(newStoreLat),
        lng: Number(newStoreLng),
        workingHours: {
          weekdays: { start: newStoreWeekdaysStart, end: newStoreWeekdaysEnd },
          weekends: { start: newStoreWeekendsStart, end: newStoreWeekendsEnd },
        },
        services: newStoreServices,
        allowPickup: newStoreAllowPickup,
        preparationTime: newStorePreparationTime,
        status: newStoreStatus,
        orderCount: 0,
      };
      setStores([newStore, ...stores]);
    }
    setIsAddSheetOpen(false);
    resetForm();
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setNewStoreName(store.name);
    setNewStoreAddress(store.address);
    setNewStorePhone(store.phone);
    setNewStoreEmail(store.email);
    setNewStoreLat(store.lat.toString());
    setNewStoreLng(store.lng.toString());
    setNewStoreWeekdaysStart(store.workingHours.weekdays.start);
    setNewStoreWeekdaysEnd(store.workingHours.weekdays.end);
    setNewStoreWeekendsStart(store.workingHours.weekends.start);
    setNewStoreWeekendsEnd(store.workingHours.weekends.end);
    setNewStoreServices(store.services);
    setNewStoreAllowPickup(store.allowPickup);
    setNewStorePreparationTime(store.preparationTime);
    setNewStoreStatus(store.status);
    setIsAddSheetOpen(true);
  };

  const handleDeleteStore = (id: string) => {
    setStores(stores.filter(s => s.id !== id));
    setStoreToDelete(null);
  };

  const resetForm = () => {
    setEditingStore(null);
    setNewStoreName('');
    setNewStoreAddress('');
    setNewStorePhone('');
    setNewStoreEmail('');
    setNewStoreLat('');
    setNewStoreLng('');
    setNewStoreWeekdaysStart('08:00');
    setNewStoreWeekdaysEnd('21:00');
    setNewStoreWeekendsStart('09:00');
    setNewStoreWeekendsEnd('20:00');
    setNewStoreServices([]);
    setNewStoreAllowPickup(true);
    setNewStorePreparationTime('1-2 ngày');
    setNewStoreStatus('active');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cửa hàng / Địa điểm nhận hàng</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý các chi nhánh cửa hàng và địa điểm nhận hàng
          </p>
        </div>
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm cửa hàng
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-3xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingStore ? 'Sửa cửa hàng' : 'Thêm cửa hàng mới'}</SheetTitle>
              <SheetDescription>
                {editingStore ? 'Cập nhật thông tin cửa hàng' : 'Thêm chi nhánh cửa hàng mới'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label>Tên chi nhánh *</Label>
                <Input
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Chi nhánh Quận 1 - TP.HCM"
                />
              </div>

              <div className="space-y-2">
                <Label>Địa chỉ *</Label>
                <Textarea
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số điện thoại *</Label>
                  <Input
                    value={newStorePhone}
                    onChange={(e) => setNewStorePhone(e.target.value)}
                    placeholder="028 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newStoreEmail}
                    onChange={(e) => setNewStoreEmail(e.target.value)}
                    placeholder="quan1@store.vn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newStoreLat}
                    onChange={(e) => setNewStoreLat(e.target.value)}
                    placeholder="10.7769"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newStoreLng}
                    onChange={(e) => setNewStoreLng(e.target.value)}
                    placeholder="106.7009"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label>Giờ làm việc</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Thứ 2 - Thứ 6</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={newStoreWeekdaysStart}
                        onChange={(e) => setNewStoreWeekdaysStart(e.target.value)}
                      />
                      <span className="self-center">-</span>
                      <Input
                        type="time"
                        value={newStoreWeekdaysEnd}
                        onChange={(e) => setNewStoreWeekdaysEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Thứ 7 - CN</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={newStoreWeekendsStart}
                        onChange={(e) => setNewStoreWeekendsStart(e.target.value)}
                      />
                      <span className="self-center">-</span>
                      <Input
                        type="time"
                        value={newStoreWeekendsEnd}
                        onChange={(e) => setNewStoreWeekendsEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label>Dịch vụ tại cửa hàng</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={newStoreServices.includes(service)}
                        onCheckedChange={() => handleToggleService(service)}
                      />
                      <Label htmlFor={service} className="text-sm font-normal cursor-pointer">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowPickup"
                    checked={newStoreAllowPickup}
                    onCheckedChange={(checked) => setNewStoreAllowPickup(checked as boolean)}
                  />
                  <Label htmlFor="allowPickup" className="font-normal cursor-pointer">
                    Cho phép làm địa điểm nhận hàng
                  </Label>
                </div>

                {newStoreAllowPickup && (
                  <div className="space-y-2 pl-6">
                    <Label>Thời gian chuẩn bị hàng</Label>
                    <Input
                      value={newStorePreparationTime}
                      onChange={(e) => setNewStorePreparationTime(e.target.value)}
                      placeholder="1-2 ngày làm việc"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select
                  value={newStoreStatus}
                  onChange={(e) => setNewStoreStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm đóng</option>
                </select>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsAddSheetOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveStore}>
                {editingStore ? 'Cập nhật' : 'Lưu'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cửa hàng..."
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
              <TableHead>Tên chi nhánh</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Nhận hàng</TableHead>
              <TableHead>Đơn chờ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.map((store) => (
              <TableRow key={store.id} className="group">
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                  {store.address}
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      {store.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {store.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {store.allowPickup ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Có
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Không</span>
                  )}
                </TableCell>
                <TableCell>{store.orderCount || 0}</TableCell>
                <TableCell>
                  {store.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600">
                      Tạm đóng
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEditStore(store)}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setStoreToDelete(store.id)}
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

      <Dialog open={!!storeToDelete} onOpenChange={(open) => !open && setStoreToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa cửa hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa cửa hàng này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreToDelete(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => storeToDelete && handleDeleteStore(storeToDelete)}
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

