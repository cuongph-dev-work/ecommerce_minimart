import { useState, useEffect, useCallback } from 'react';
import { storesService, type Store as StoreServiceType } from '@/services/stores.service';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import { storeSchema } from '@/schemas/store.schema';
import { safeParse } from 'valibot';

type Store = StoreServiceType;

export function StoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [statusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchStores = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const response = await storesService.getAll(undefined, signal);
      
      let filtered: Store[] = response.stores;
      if (statusFilter !== 'all') {
        filtered = response.stores.filter((store: Store) => store.status === statusFilter);
      }
      
      setStores(filtered as Store[]);
    } catch (err: unknown) {
      if (axios.isCancel(err)) return;
      // Silently fail for fetch
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStores(controller.signal);
    return () => controller.abort();
  }, [fetchStores]);

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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;
    if (!googleMapsApiKey) {
      setGeocodeError('Thiếu Google Maps API key. Vui lòng cấu hình biến VITE_GOOGLE_MAPS_API_KEY.');
      return;
    }
    
    try {
      setIsGeocoding(true);
      setGeocodeError(null);

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
      );
      const data = await response.json();

      if (data?.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setNewStoreLat(Number(lat).toFixed(7));
        setNewStoreLng(Number(lng).toFixed(7));
        setGeocodeError(null);
      } else {
        const message =
          data?.error_message ||
          (data?.status === 'ZERO_RESULTS'
            ? 'Không tìm thấy tọa độ cho địa chỉ này'
            : 'Không thể lấy tọa độ từ Google Maps');
        setGeocodeError(message);
        console.warn('Geocoding error:', data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy tọa độ:', error);
      setGeocodeError('Không thể kết nối tới Google Maps Geocoding API');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSaveStore = async () => {
    // Frontend validation using Valibot schema
    const formData: Record<string, unknown> = {
      name: newStoreName.trim(),
      address: newStoreAddress.trim(),
      phone: newStorePhone.trim(),
      email: newStoreEmail?.trim() || undefined,
      lat: newStoreLat ? Number(newStoreLat) : undefined,
      lng: newStoreLng ? Number(newStoreLng) : undefined,
      workingHours: {
        weekdays: { start: newStoreWeekdaysStart, end: newStoreWeekdaysEnd },
        weekends: { start: newStoreWeekendsStart, end: newStoreWeekendsEnd },
      },
      services: newStoreServices.filter(s => s.trim().length > 0),
      allowPickup: newStoreAllowPickup,
      preparationTime: newStorePreparationTime,
      status: newStoreStatus,
    };

    const result = safeParse(storeSchema, formData);
    
    if (!result.success) {
      // Convert Valibot errors to ValidationError format
      const errors: ValidationError[] = result.issues.map((issue) => {
        const field = issue.path?.[0]?.key as string || 'name';
        return {
          field,
          message: issue.message,
        };
      });
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      setValidationErrors([]);

      const storeData = {
        name: newStoreName,
        address: newStoreAddress,
        phone: newStorePhone,
        email: newStoreEmail || undefined,
        lat: newStoreLat ? Number(newStoreLat) : undefined,
        lng: newStoreLng ? Number(newStoreLng) : undefined,
        workingHours: {
          weekdays: { start: newStoreWeekdaysStart, end: newStoreWeekdaysEnd },
          weekends: { start: newStoreWeekendsStart, end: newStoreWeekendsEnd },
        },
        services: newStoreServices.filter(s => s.trim().length > 0),
        allowPickup: newStoreAllowPickup,
        preparationTime: newStorePreparationTime,
        status: newStoreStatus,
      };

      if (editingStore) {
        await storesService.update(editingStore.id, storeData);
      } else {
        await storesService.create(storeData);
      }

      setIsAddDialogOpen(false);
      resetForm();
      await fetchStores();
    } catch (err: unknown) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setValidationErrors([{ field: 'name', message: apiError.message }]);
      }
      // Không set error state nữa, chỉ dùng validationErrors
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setNewStoreName(store.name);
    setNewStoreAddress(store.address);
    setNewStorePhone(store.phone);
    setNewStoreEmail(store.email || '');
    setNewStoreLat(store.lat?.toString() || '');
    setNewStoreLng(store.lng?.toString() || '');
    setNewStoreWeekdaysStart(store.workingHours?.weekdays?.start || '08:00');
    setNewStoreWeekdaysEnd(store.workingHours?.weekdays?.end || '21:00');
    setNewStoreWeekendsStart(store.workingHours?.weekends?.start || '09:00');
    setNewStoreWeekendsEnd(store.workingHours?.weekends?.end || '20:00');
    setNewStoreServices(store.services || []);
    setNewStoreAllowPickup(store.allowPickup ?? true);
    setNewStorePreparationTime(store.preparationTime || '1-2 ngày');
    setNewStoreStatus((store.status as 'active' | 'inactive') || 'active');
    setIsAddDialogOpen(true);
  };

  const handleDeleteStore = async (id: string) => {
    try {
      await storesService.delete(id);
      setStoreToDelete(null);
      await fetchStores();
    } catch (err: unknown) {
      console.error('Failed to delete store:', err);
    }
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
    setValidationErrors([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Địa điểm nhận hàng</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý các chi nhánh cửa hàng và địa điểm nhận hàng
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Thêm cửa hàng
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStore ? 'Sửa cửa hàng' : 'Thêm cửa hàng mới'}</DialogTitle>
              <DialogDescription>
                {editingStore ? 'Cập nhật thông tin cửa hàng' : 'Thêm chi nhánh cửa hàng mới'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label>Tên chi nhánh *</Label>
                <Input
                  value={newStoreName}
                  onChange={(e) => {
                    setNewStoreName(e.target.value);
                    if (getFieldError(validationErrors, 'name')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'name'));
                    }
                  }}
                  placeholder="Chi nhánh Quận 1 - TP.HCM"
                  className={getFieldError(validationErrors, 'name') ? 'border-destructive' : ''}
                />
                {getFieldError(validationErrors, 'name') && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(validationErrors, 'name')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Địa chỉ *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => geocodeAddress(newStoreAddress)}
                    disabled={!newStoreAddress.trim() || isGeocoding || !googleMapsApiKey}
                  >
                    {isGeocoding ? 'Đang lấy...' : googleMapsApiKey ? 'Lấy tọa độ' : 'Thiếu API key'}
                  </Button>
                </div>
                <Textarea
                  value={newStoreAddress}
                  onChange={(e) => {
                    setNewStoreAddress(e.target.value);
                    if (geocodeError) {
                      setGeocodeError(null);
                    }
                    if (getFieldError(validationErrors, 'address')) {
                      setValidationErrors(validationErrors.filter(err => err.field !== 'address'));
                    }
                  }}
                  onBlur={() => {
                    // Tự động lấy tọa độ khi blur nếu địa chỉ đã có và chưa có tọa độ
                    if (newStoreAddress.trim() && (!newStoreLat || !newStoreLng) && googleMapsApiKey) {
                      geocodeAddress(newStoreAddress);
                    }
                  }}
                  placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  className={`min-h-[80px] ${getFieldError(validationErrors, 'address') ? 'border-destructive' : ''}`}
                />
                {getFieldError(validationErrors, 'address') && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(validationErrors, 'address')}
                  </p>
                )}
                {geocodeError && (
                  <p className="text-sm text-destructive mt-1">
                    {geocodeError}
                  </p>
                )}
                {!googleMapsApiKey && (
                  <p className="text-xs text-muted-foreground">
                    Cần cấu hình biến môi trường <code>VITE_GOOGLE_MAPS_API_KEY</code> để tự động lấy tọa độ.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Số điện thoại *</Label>
                  <Input
                    value={newStorePhone}
                    onChange={(e) => {
                      setNewStorePhone(e.target.value);
                      if (getFieldError(validationErrors, 'phone')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'phone'));
                      }
                    }}
                    placeholder="028 1234 5678"
                    className={getFieldError(validationErrors, 'phone') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'phone') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'phone')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newStoreEmail}
                    onChange={(e) => {
                      setNewStoreEmail(e.target.value);
                      if (getFieldError(validationErrors, 'email')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'email'));
                      }
                    }}
                    placeholder="quan1@store.vn"
                    className={getFieldError(validationErrors, 'email') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'email') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'email')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude {isGeocoding && <span className="text-xs text-muted-foreground">(Đang lấy...)</span>}</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newStoreLat}
                    onChange={(e) => setNewStoreLat(e.target.value)}
                    placeholder="10.7769"
                    readOnly={isGeocoding}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Longitude {isGeocoding && <span className="text-xs text-muted-foreground">(Đang lấy...)</span>}</Label>
                  <Input
                    type="number"
                    step="any"
                    value={newStoreLng}
                    onChange={(e) => setNewStoreLng(e.target.value)}
                    placeholder="106.7009"
                    readOnly={isGeocoding}
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
                <div className="space-y-2">
                  {newStoreServices.map((service, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={service}
                        onChange={(e) => {
                          const newServices = [...newStoreServices];
                          newServices[index] = e.target.value;
                          setNewStoreServices(newServices);
                        }}
                        placeholder="Nhập tên dịch vụ..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setNewStoreServices(newStoreServices.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewStoreServices([...newStoreServices, ''])}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm dịch vụ
                  </Button>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSaveStore} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : editingStore ? 'Cập nhật' : 'Lưu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Đang tải cửa hàng...
                </TableCell>
              </TableRow>
            ) : filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy cửa hàng
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
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
                <TableCell>{(store as Store & { orderCount?: number }).orderCount || 0}</TableCell>
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
            ))
            )}
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

