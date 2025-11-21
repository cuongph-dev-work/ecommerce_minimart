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
import { Search, Eye, MoreHorizontal, Download, Plus, Calendar } from 'lucide-react';
import { orders } from '@/data/orders';
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
import type { Order, OrderStatus } from '@/types';
import { getStatusColor, getStatusLabel, formatCurrency, getDeliveryMethodLabel } from '@/lib/order-utils';
import { OrderDetailsSheet } from '@/components/orders/OrderDetailsSheet';

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ordersData, setOrdersData] = useState<Order[]>(orders);
  const itemsPerPage = 10;

  // Filter orders
  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // View order details
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Update order status
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus, notes: string) => {
    setOrdersData(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus,
            statusHistory: [
              ...order.statusHistory,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                notes: notes || undefined,
              },
            ],
          };
          // Update selected order if it's the one being updated
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(updatedOrder);
          }
          return updatedOrder;
        }
        return order;
      })
    );

    // Show success message (you can replace with toast notification)
    console.log(`Đơn hàng ${orderId} đã được cập nhật sang trạng thái: ${newStatus}`);
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
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
              handleFilterChange();
            }}
          />
        </div>

        {/* Status Filter */}
        <Select 
          value={statusFilter} 
          onValueChange={(value) => {
            setStatusFilter(value as OrderStatus | 'all');
            handleFilterChange();
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
            <SelectItem value="ready_for_pickup">Sẵn sàng nhận</SelectItem>
            <SelectItem value="shipping">Đang giao</SelectItem>
            <SelectItem value="delivered">Đã giao</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="returned">Hoàn trả</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range (placeholder for now) */}
        <Button variant="outline" className="w-full sm:w-auto">
          <Calendar className="mr-2 h-4 w-4" />
          Chọn ngày
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Tổng đơn</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Chờ xử lý</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Đang xử lý</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {orders.filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready_for_pickup').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Hoàn thành</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {orders.filter(o => o.status === 'completed').length}
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
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-medium font-mono text-sm">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.customerPhone}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.items.length} sản phẩm
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {order.pickupLocation.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.total)}
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          In hóa đơn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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
      />
    </motion.div>
  );
}
