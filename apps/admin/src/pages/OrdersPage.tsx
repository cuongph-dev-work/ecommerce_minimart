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
import { Search, Eye, MoreHorizontal, Filter } from 'lucide-react';
import { orders } from '@/data/orders';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
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
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage customer orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Create Order
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 bg-muted/30 border-transparent focus:bg-background focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="group">
                <TableCell className="font-medium">
                  {order.id}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.customerEmail}
                  </div>
                </TableCell>
                <TableCell>
                  {order.date}
                </TableCell>
                <TableCell>
                  {order.items} items
                </TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total)}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    getStatusColor(order.status)
                  )}>
                    {order.status}
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
