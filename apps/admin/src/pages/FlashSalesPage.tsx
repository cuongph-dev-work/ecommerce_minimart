import { useState, useEffect } from 'react';
import { flashSalesService } from '@/services/flash-sales.service';
import type { FlashSale, FlashSaleProduct } from '@/services/flash-sales.service';
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
import { Plus, Search, Edit, Trash2, MoreHorizontal, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { productsService } from '@/services/products.service';
import type { Product } from '@/types';
import axios from 'axios';




export function FlashSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null);
  const [flashSaleToDelete, setFlashSaleToDelete] = useState<string | null>(null);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FlashSaleProduct | null>(null);
  const [productToRemove, setProductToRemove] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFlashSales(controller.signal);
    fetchProducts();
    return () => controller.abort();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsService.getAll({ limit: 1000 });
      setProducts(response.products);
    } catch (err: any) {
      console.error('Failed to load products:', err);
    }
  };

  const fetchFlashSales = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await flashSalesService.getAll(signal);
      // Cast status to match expected type
      const transformed = data.map((item: any) => ({
        ...item,
        status: item.status as 'active' | 'upcoming' | 'ended'
      }));
      setFlashSales(transformed);
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err?.message || 'Failed to load flash sales');
    } finally {
      setIsLoading(false);
    }
  };

  // Form state for adding/editing product
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [productSalePrice, setProductSalePrice] = useState('');
  const [productTotal, setProductTotal] = useState('');

  // Form state
  const [newFlashSaleName, setNewFlashSaleName] = useState('');
  const [newFlashSaleStartTime, setNewFlashSaleStartTime] = useState('');
  const [newFlashSaleEndTime, setNewFlashSaleEndTime] = useState('');
  const [newFlashSaleStatus, setNewFlashSaleStatus] = useState<'upcoming' | 'active' | 'ended'>('upcoming');

  const filteredFlashSales = flashSales.filter((fs) =>
    fs.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFlashSale = async () => {
    if (!newFlashSaleName || !newFlashSaleStartTime || !newFlashSaleEndTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const flashSaleData = {
        name: newFlashSaleName,
        startTime: newFlashSaleStartTime,
        endTime: newFlashSaleEndTime,
        status: newFlashSaleStatus,
      };

      if (editingFlashSale) {
        await flashSalesService.update(editingFlashSale.id, flashSaleData);
      } else {
        await flashSalesService.create(flashSaleData);
      }

      setIsAddSheetOpen(false);
      resetForm();
      await fetchFlashSales();
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu flash sale');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditFlashSale = (flashSale: FlashSale) => {
    setEditingFlashSale(flashSale);
    setNewFlashSaleName(flashSale.name);
    setNewFlashSaleStartTime(flashSale.startTime.split('T')[0] + 'T' + flashSale.startTime.split('T')[1].split('.')[0]);
    setNewFlashSaleEndTime(flashSale.endTime.split('T')[0] + 'T' + flashSale.endTime.split('T')[1].split('.')[0]);
    setNewFlashSaleStatus(flashSale.status);
    setIsAddSheetOpen(true);
  };

  const handleDeleteFlashSale = async (id: string) => {
    try {
      await flashSalesService.delete(id);
      setFlashSaleToDelete(null);
      await fetchFlashSales();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete flash sale');
    }
  };

  const resetForm = () => {
    setEditingFlashSale(null);
    setNewFlashSaleName('');
    setNewFlashSaleStartTime('');
    setNewFlashSaleEndTime('');
    setNewFlashSaleStatus('upcoming');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600';
      case 'ended':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const handleAddProduct = async () => {
    if (!selectedFlashSale || !selectedProductId || !productSalePrice || !productTotal) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const product = products.find(p => p.id === selectedProductId);
      if (!product) return;


      const salePrice = Number(productSalePrice);

      await flashSalesService.addProduct(selectedFlashSale.id, {
        productId: selectedProductId,
        discountPrice: salePrice,
        stockLimit: Number(productTotal),
      });

      setIsAddProductOpen(false);
      resetProductForm();
      await fetchFlashSales();
      // Refresh selected flash sale
      const updated = await flashSalesService.getById(selectedFlashSale.id);
      setSelectedFlashSale(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to add product to flash sale');
    }
  };

  const handleEditProduct = (product: FlashSaleProduct) => {
    setEditingProduct(product);
    setSelectedProductId(product.productId);
    setProductOriginalPrice(product.originalPrice.toString());
    setProductSalePrice(product.salePrice.toString());
    setProductTotal(product.total.toString());
    setIsAddProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedFlashSale || !editingProduct || !productSalePrice || !productTotal) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Remove old product and add updated one
      await flashSalesService.removeProduct(selectedFlashSale.id, editingProduct.productId);
      const salePrice = Number(productSalePrice);
      await flashSalesService.addProduct(selectedFlashSale.id, {
        productId: editingProduct.productId,
        discountPrice: salePrice,
        stockLimit: Number(productTotal),
      });

      setIsAddProductOpen(false);
      resetProductForm();
      await fetchFlashSales();
      // Refresh selected flash sale
      const updated = await flashSalesService.getById(selectedFlashSale.id);
      setSelectedFlashSale(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to update product in flash sale');
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!selectedFlashSale) return;
    try {
      await flashSalesService.removeProduct(selectedFlashSale.id, productId);
      setProductToRemove(null);
      await fetchFlashSales();
      // Refresh selected flash sale
      const updated = await flashSalesService.getById(selectedFlashSale.id);
      setSelectedFlashSale(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove product from flash sale');
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setSelectedProductId('');
    setProductOriginalPrice('');
    setProductSalePrice('');
    setProductTotal('');
  };

  const availableProducts = products.filter(p => 
    !selectedFlashSale?.products.some(fp => fp.productId === p.id) || 
    editingProduct?.productId === p.id
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Flash Sale</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý các chương trình flash sale
          </p>
        </div>
        <Sheet open={isAddSheetOpen} onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) resetForm();
        }}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Tạo Flash Sale
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingFlashSale ? 'Sửa Flash Sale' : 'Tạo Flash Sale Mới'}</SheetTitle>
              <SheetDescription>
                {editingFlashSale ? 'Cập nhật thông tin flash sale' : 'Tạo chương trình flash sale mới'}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label>Tên chương trình <span className="text-destructive">*</span></Label>
                <Input
                  value={newFlashSaleName}
                  onChange={(e) => setNewFlashSaleName(e.target.value)}
                  placeholder="Flash Sale 12.12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thời gian bắt đầu <span className="text-destructive">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={newFlashSaleStartTime}
                    onChange={(e) => setNewFlashSaleStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thời gian kết thúc <span className="text-destructive">*</span></Label>
                  <Input
                    type="datetime-local"
                    value={newFlashSaleEndTime}
                    onChange={(e) => setNewFlashSaleEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <select
                  value={newFlashSaleStatus}
                  onChange={(e) => setNewFlashSaleStatus(e.target.value as 'upcoming' | 'active' | 'ended')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <SheetFooter>
              <Button variant="outline" onClick={() => setIsAddSheetOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSaveFlashSale} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : editingFlashSale ? 'Cập nhật' : 'Tạo'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm flash sale..."
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
              <TableHead>Tên chương trình</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading flash sales...
                </TableCell>
              </TableRow>
            ) : filteredFlashSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No flash sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredFlashSales.map((flashSale) => (
              <TableRow key={flashSale.id} className="group">
                <TableCell className="font-medium">{flashSale.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(flashSale.startTime).toLocaleDateString('vi-VN')} - {new Date(flashSale.endTime).toLocaleDateString('vi-VN')}
                  </div>
                </TableCell>
                <TableCell>{flashSale.products.length} sản phẩm</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(flashSale.status))}>
                    {getStatusLabel(flashSale.status)}
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
                      <DropdownMenuItem onSelect={() => {
                        setSelectedFlashSale(flashSale);
                        setIsProductSheetOpen(true);
                      }}>
                        Quản lý sản phẩm
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleEditFlashSale(flashSale)}>
                        <Edit className="mr-2 h-4 w-4" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setFlashSaleToDelete(flashSale.id)}
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

      {/* Product Management Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={(open) => {
        setIsProductSheetOpen(open);
        if (!open) {
          setSelectedFlashSale(null);
          resetProductForm();
        }
      }}>
        <SheetContent className="sm:max-w-4xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Quản lý sản phẩm - {selectedFlashSale?.name}
            </SheetTitle>
            <SheetDescription>
              Thêm, sửa hoặc xóa sản phẩm trong flash sale này
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <Button
              onClick={() => {
                resetProductForm();
                setIsAddProductOpen(true);
              }}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </Button>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Giá gốc</TableHead>
                    <TableHead>Giá khuyến mãi</TableHead>
                    <TableHead>Giảm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đã bán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFlashSale?.products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Chưa có sản phẩm nào trong flash sale này
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedFlashSale?.products.map((product) => (
                      <TableRow key={product.productId} className="group">
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(product.salePrice)}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded bg-red-500/10 text-red-600 text-sm font-medium">
                            -{product.discount}%
                          </span>
                        </TableCell>
                        <TableCell>{product.total}</TableCell>
                        <TableCell>{product.sold}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => setProductToRemove(product.productId)}
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={(open) => {
        setIsAddProductOpen(open);
        if (!open) resetProductForm();
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm vào Flash Sale'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Cập nhật thông tin sản phẩm trong flash sale' : 'Chọn sản phẩm và thiết lập giá khuyến mãi'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Sản phẩm *</Label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const product = products.find(p => p.id === e.target.value);
                  if (product) {
                    setProductOriginalPrice(product.price.toString());
                  }
                }}
                disabled={!!editingProduct}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Chọn sản phẩm</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(product.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá gốc (VNĐ) *</Label>
                <Input
                  type="number"
                  value={productOriginalPrice}
                  onChange={(e) => setProductOriginalPrice(e.target.value)}
                  placeholder="1890000"
                />
              </div>

              <div className="space-y-2">
                <Label>Giá khuyến mãi (VNĐ) *</Label>
                <Input
                  type="number"
                  value={productSalePrice}
                  onChange={(e) => setProductSalePrice(e.target.value)}
                  placeholder="1490000"
                />
              </div>
            </div>

            {productOriginalPrice && productSalePrice && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Giảm giá:</div>
                <div className="text-lg font-semibold text-red-600">
                  -{Math.round(((Number(productOriginalPrice) - Number(productSalePrice)) / Number(productOriginalPrice)) * 100)}%
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Số lượng khuyến mãi *</Label>
              <Input
                type="number"
                value={productTotal}
                onChange={(e) => setProductTotal(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Hủy</Button>
            <Button
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              disabled={!selectedProductId || !productOriginalPrice || !productSalePrice || !productTotal}
            >
              {editingProduct ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Product Confirmation */}
      <Dialog open={!!productToRemove} onOpenChange={(open) => !open && setProductToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi flash sale? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToRemove(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => productToRemove && handleRemoveProduct(productToRemove)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!flashSaleToDelete} onOpenChange={(open) => !open && setFlashSaleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa flash sale</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa flash sale này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlashSaleToDelete(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => flashSaleToDelete && handleDeleteFlashSale(flashSaleToDelete)}
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

