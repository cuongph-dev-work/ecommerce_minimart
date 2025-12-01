import { useState, useEffect, useCallback } from 'react';
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
import { Search, Eye, MoreHorizontal, Plus, Calendar, X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus, Product } from '@/types';
import { getStatusColor, getStatusLabel, formatCurrency } from '@/lib/order-utils';
import { OrderDetailsSheet } from '@/components/orders/OrderDetailsSheet';
import { ordersService } from '@/services/orders.service';
import { productsService } from '@/services/products.service';
import { storesService, type Store } from '@/services/stores.service';
import axios from 'axios';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { extractApiError, getFieldError, type ValidationError } from '@/lib/error-handler';
import * as v from 'valibot';
import { createOrderSchema } from '@/schemas/order.schema';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function OrdersPage() {
  useDocumentTitle('Đơn hàng');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersPagination, setOrdersPagination] = useState<{ total: number; totalPages: number; page: number; limit: number } | null>(null);
  const itemsPerPage = 10;

  // Create order form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: string; quantity: number; product: Product }>>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoadingProductsStores, setIsLoadingProductsStores] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState<{ total: number; totalPages: number; page: number; limit: number } | null>(null);
  
  // Date range filter
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, currentPage, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (isCreateDialogOpen) {
      const controller = new AbortController();
      fetchProductsAndStores(controller.signal);
      return () => controller.abort();
    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (isProductDialogOpen) {
      const controller = new AbortController();
      fetchProductsForDialog(controller.signal);
      return () => controller.abort();
    } else {
      // Reset when dialog closes
      setProductPage(1);
      setProductSearchTerm('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProductDialogOpen, productPage, productSearchTerm]);

  const fetchProductsForDialog = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoadingProductsStores(true);
      const productsRes = await productsService.getAll({ 
        page: productPage, 
        limit: 12,
        search: productSearchTerm || undefined,
      }, signal);
      setProducts(productsRes.products || []);
      setProductPagination(productsRes.pagination || null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to load products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoadingProductsStores(false);
    }
  }, [productPage, productSearchTerm]);

  const fetchProductsAndStores = async (signal?: AbortSignal) => {
    try {
      setIsLoadingProductsStores(true);
      const storesRes = await storesService.getAll({ page: 1, limit: 100 }, signal);
      setStores(storesRes.stores || []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Failed to load stores:', err);
      setError('Không thể tải danh sách cửa hàng');
    } finally {
      setIsLoadingProductsStores(false);
    }
  };

  const fetchOrders = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }, signal);
      // Transform API response to match frontend Order type
      const transformed = response.orders.map((order: any) => ({
        ...order,
        orderDate: order.createdAt || order.orderDate,
        pickupLocation: order.pickupStore || order.pickupLocation,
      }));
      setOrdersData(transformed);
      setOrdersPagination(response.pagination || null);
    } catch (err: any) {
      if (axios.isCancel(err)) return;
      setError(err?.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, searchTerm, startDate, endDate]);

  // View order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Update order status
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, notes: string) => {
    try {
      const updatedOrder = await ordersService.updateStatus(orderId, {
        status: newStatus,
        notes,
      });
      // Update local state
      setOrdersData(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updatedOrder });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update order status');
    }
  };

  // Update order payment
  const handlePaymentUpdate = async (orderId: string) => {
    // Refresh the orders list to get updated payment status
    await fetchOrders();
  };

  // Add product to order
  const handleAddProduct = (product: Product) => {
    const existing = selectedProducts.find(sp => sp.productId === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(sp =>
        sp.productId === product.id ? { ...sp, quantity: sp.quantity + 1 } : sp
      ));
    } else {
      setSelectedProducts([...selectedProducts, { productId: product.id, quantity: 1, product }]);
    }
    setIsProductDialogOpen(false);
    setProductSearchTerm('');
  };

  // Filter products that are in stock
  const availableProducts = products.filter(p => p.stock > 0);

  // Remove product from order
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(sp => sp.productId !== productId));
  };

  // Update product quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }
    setSelectedProducts(selectedProducts.map(sp =>
      sp.productId === productId ? { ...sp, quantity } : sp
    ));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, sp) => {
      return sum + (sp.product.price * sp.quantity);
    }, 0);
    // TODO: Apply voucher discount if voucherCode is provided
    const discount = 0;
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  // Reset create order form
  const resetCreateForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerNotes('');
    setSelectedStoreId('');
    setSelectedProducts([]);
    setVoucherCode('');
    setValidationErrors([]);
    setError(null);
  };

  // Create order
  const handleCreateOrder = async () => {
    // Frontend validation with valibot
    setError(null);
    setValidationErrors([]);
    
    const orderData = {
      customerName,
      customerPhone,
      customerEmail,
      notes: customerNotes || undefined,
      pickupStoreId: selectedStoreId,
      items: selectedProducts.map(sp => ({
        productId: sp.productId,
        quantity: sp.quantity,
      })),
      voucherCode: voucherCode || undefined,
    };
    
    const result = v.safeParse(createOrderSchema, orderData);
    
    if (!result.success) {
      // Convert valibot issues to ValidationError[]
      const errors: ValidationError[] = result.issues.map(issue => {
        // Get field name from path (e.g., path = [{ key: 'customerName' }])
        const fieldPath = issue.path?.map(p => p.key).join('.') || 'unknown';
        return {
          field: fieldPath,
          message: issue.message,
        };
      });
      
      setValidationErrors(errors);
      // Scroll to top of dialog to show validation errors
      setTimeout(() => {
        const dialogContent = document.querySelector('[role="dialog"]');
        if (dialogContent) {
          dialogContent.scrollTop = 0;
        }
      }, 100);
      return;
    }

    try {
      setIsCreating(true);
      await ordersService.create(result.output);
      setIsCreateDialogOpen(false);
      resetCreateForm();
      await fetchOrders();
    } catch (err: unknown) {
      const apiError = extractApiError(err);
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
        // Scroll to top to show validation errors
        setTimeout(() => {
          const dialogContent = document.querySelector('[role="dialog"]');
          if (dialogContent) {
            dialogContent.scrollTop = 0;
          }
        }, 100);
      } else {
        setError(apiError.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đơn hàng</h2>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi đơn hàng của khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          {/* Temporarily hidden - Excel export feature */}
          {/* <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button> */}
          <Button 
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 when search changes
            }}
          />
        </div>

        {/* Status Filter */}
        <Select 
          value={statusFilter} 
          onValueChange={(value) => {
            setStatusFilter(value as OrderStatus | 'all');
            setCurrentPage(1); // Reset to page 1 when filter changes
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
            <SelectItem value="ready">Sẵn sàng nhận</SelectItem>
            <SelectItem value="received">Đã nhận hàng</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="returned">Hoàn trả</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DropdownMenu 
          open={isDatePickerOpen} 
          onOpenChange={(open) => {
            setIsDatePickerOpen(open);
            if (open) {
              // Initialize temp values when opening
              setTempStartDate(startDate);
              setTempEndDate(endDate);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto relative">
              <Calendar className="mr-2 h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">
                {startDate || endDate 
                  ? `${startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '...'} - ${endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '...'}`
                  : 'Chọn ngày'
                }
              </span>
              {(startDate || endDate) && (
                <X 
                  className="ml-2 h-4 w-4 shrink-0" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setStartDate('');
                    setEndDate('');
                    setTempStartDate('');
                    setTempEndDate('');
                    setCurrentPage(1);
                  }}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto p-0" align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="p-4">
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const today = new Date();
                    const start = new Date(today);
                    start.setDate(today.getDate() - 6); // 7 days ago
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  7 ngày qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const today = new Date();
                    const start = new Date(today);
                    start.setDate(today.getDate() - 29); // 30 days ago
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  30 ngày qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const today = new Date();
                    const start = new Date(today.getFullYear(), today.getMonth(), 1);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today.toISOString().split('T')[0]);
                  }}
                >
                  Tháng này
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const today = new Date();
                    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const end = new Date(today.getFullYear(), today.getMonth(), 0);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(end.toISOString().split('T')[0]);
                  }}
                >
                  Tháng trước
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm font-medium">Từ ngày</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="start-date"
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => {
                          setTempStartDate(e.target.value);
                        }}
                        max={tempEndDate || undefined}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-sm font-medium">Đến ngày</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="end-date"
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => {
                          setTempEndDate(e.target.value);
                        }}
                        min={tempStartDate || undefined}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Range Display */}
                {(tempStartDate || tempEndDate) && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Khoảng thời gian:</span>
                      <span className="font-medium">
                        {tempStartDate 
                          ? new Date(tempStartDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '...'
                        }
                        {' - '}
                        {tempEndDate 
                          ? new Date(tempEndDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '...'
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setTempStartDate('');
                      setTempEndDate('');
                    }}
                  >
                    Xóa
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setStartDate(tempStartDate);
                      setEndDate(tempEndDate);
                      setCurrentPage(1);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Tổng đơn</p>
          <p className="text-2xl font-bold mt-1">{ordersData.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Chờ xử lý</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {ordersData.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {ordersData.filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Hoàn thành</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {ordersData.filter(o => o.status === 'received').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : ordersData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              ordersData.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-medium font-mono text-sm">
                    {order.orderNumber || order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.customerPhone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.items?.length || 0} sản phẩm
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {typeof order.pickupLocation === 'string' ? order.pickupLocation : order.pickupLocation?.name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      order.paymentStatus === 'paid' 
                        ? "bg-emerald-600 text-white dark:bg-emerald-500"
                        : "bg-red-600 text-white dark:bg-red-500"
                    )}>
                      {order.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(order.status)
                    )}>
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {/* Temporarily hidden - Print invoice feature */}
                        {/* <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          In hóa đơn
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {ordersPagination && ordersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Trang {ordersPagination.page} / {ordersPagination.totalPages} ({ordersPagination.total} đơn hàng)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, ordersPagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (ordersPagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= ordersPagination.totalPages - 2) {
                    pageNum = ordersPagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(ordersPagination.totalPages, prev + 1))}
                disabled={currentPage === ordersPagination.totalPages || isLoading}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Sheet */}
      <OrderDetailsSheet 
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onStatusUpdate={handleStatusUpdate}
        onPaymentUpdate={handlePaymentUpdate}
      />

      {/* Create Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo đơn hàng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin khách hàng và chọn sản phẩm để tạo đơn hàng
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="grid gap-6 py-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên khách hàng <span className="text-destructive">*</span></Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (getFieldError(validationErrors, 'customerName')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'customerName'));
                      }
                    }}
                    placeholder="Nguyễn Văn A"
                    className={getFieldError(validationErrors, 'customerName') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'customerName') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'customerName')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Số điện thoại <span className="text-destructive">*</span></Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (getFieldError(validationErrors, 'customerPhone')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'customerPhone'));
                      }
                    }}
                    placeholder="0901234567"
                    className={getFieldError(validationErrors, 'customerPhone') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'customerPhone') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'customerPhone')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (getFieldError(validationErrors, 'customerEmail')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'customerEmail'));
                      }
                    }}
                    placeholder="customer@example.com"
                    className={getFieldError(validationErrors, 'customerEmail') ? 'border-destructive' : ''}
                  />
                  {getFieldError(validationErrors, 'customerEmail') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'customerEmail')}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupStore">Cửa hàng nhận <span className="text-destructive">*</span></Label>
                  <Select 
                    value={selectedStoreId} 
                    onValueChange={(value) => {
                      setSelectedStoreId(value);
                      if (getFieldError(validationErrors, 'pickupStoreId')) {
                        setValidationErrors(validationErrors.filter(err => err.field !== 'pickupStoreId'));
                      }
                    }}
                  >
                    <SelectTrigger className={getFieldError(validationErrors, 'pickupStoreId') ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Chọn cửa hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError(validationErrors, 'pickupStoreId') && (
                    <p className="text-sm text-destructive mt-1">
                      {getFieldError(validationErrors, 'pickupStoreId')}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerNotes">Ghi chú</Label>
                <Textarea
                  id="customerNotes"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ghi chú đặc biệt..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Products Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sản phẩm</h3>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductDialogOpen(true)}
                  disabled={isLoadingProductsStores}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Button>
              </div>

              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Chưa có sản phẩm nào
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((sp) => (
                    <div key={sp.productId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{sp.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(sp.product.price)} x {sp.quantity} = {formatCurrency(sp.product.price * sp.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(sp.productId, sp.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={sp.quantity}
                          onChange={(e) => handleUpdateQuantity(sp.productId, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(sp.productId, sp.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(sp.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher */}
            <div className="space-y-2">
              <Label htmlFor="voucherCode">Mã giảm giá (tùy chọn)</Label>
              <Input
                id="voucherCode"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã voucher"
              />
            </div>

            {/* Totals */}
            {selectedProducts.length > 0 && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(calculateTotals().subtotal)}</span>
                </div>
                {calculateTotals().discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(calculateTotals().discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(calculateTotals().total)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Hủy
            </Button>
            <Button onClick={handleCreateOrder} disabled={isCreating || selectedProducts.length === 0}>
              {isCreating ? 'Đang tạo...' : 'Tạo đơn hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Selection Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
            <DialogDescription>
              Tìm kiếm và chọn sản phẩm để thêm vào đơn hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, SKU, thương hiệu..."
                className="pl-10"
                value={productSearchTerm}
                onChange={(e) => {
                  setProductSearchTerm(e.target.value);
                  setProductPage(1); // Reset to page 1 when search changes
                }}
              />
            </div>

            {/* Products Grid */}
            {isLoadingProductsStores ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải sản phẩm...
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {productSearchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableProducts.map((product) => {
                  const isSelected = selectedProducts.some(sp => sp.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      disabled={isSelected}
                      className={cn(
                        "relative p-3 border rounded-lg hover:border-primary transition-all text-left",
                        isSelected && "opacity-50 cursor-not-allowed bg-muted"
                      )}
                    >
                      {/* Product Image */}
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted mb-2">
                        <img
                          src={product.image || product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.png';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="space-y-1">
                        <div className="font-medium text-sm line-clamp-2">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.sku && `SKU: ${product.sku}`}
                        </div>
                        <div className="font-semibold text-primary">
                          {formatCurrency(product.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tồn kho: {product.stock}
                        </div>
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Đã chọn
                        </div>
                      )}
                    </button>
                  );
                })}
                </div>

                {/* Pagination */}
                {productPagination && productPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Trang {productPagination.page} / {productPagination.totalPages} ({productPagination.total} sản phẩm)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                        disabled={productPage === 1 || isLoadingProductsStores}
                      >
                        Trước
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, productPagination.totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (productPagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (productPage <= 3) {
                            pageNum = i + 1;
                          } else if (productPage >= productPagination.totalPages - 2) {
                            pageNum = productPagination.totalPages - 4 + i;
                          } else {
                            pageNum = productPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={productPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setProductPage(pageNum)}
                              disabled={isLoadingProductsStores}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductPage(prev => Math.min(productPagination.totalPages, prev + 1))}
                        disabled={productPage === productPagination.totalPages || isLoadingProductsStores}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
