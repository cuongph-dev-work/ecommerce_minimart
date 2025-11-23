
import { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,

} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats, RecentOrder } from '@/services/dashboard.service';
import axios from 'axios';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, ordersData] = await Promise.all([
          dashboardService.getStats(controller.signal),
          dashboardService.getRecentOrders(5, controller.signal),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
          <p className="text-muted-foreground mt-2">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
          <p className="text-muted-foreground mt-2 text-destructive">{error || 'Không thể tải dữ liệu'}</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(stats.revenue.today),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Tổng khách hàng',
      value: stats.customers.total.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats.orders.total.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Sản phẩm sắp hết hàng',
      value: `${stats.products.lowStock + stats.products.outOfStock}`,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <p className="text-muted-foreground mt-2">
          Tổng quan về hiệu quả kinh doanh và các hoạt động gần đây.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between pb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </h3>
              <div className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4 bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tổng quan doanh thu</h3>
            <select className="text-sm border-none bg-muted/50 rounded-lg px-3 py-1 focus:ring-0 cursor-pointer hover:bg-muted transition-colors">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>Năm qua</option>
            </select>
          </div>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Biểu đồ minh họa</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3 bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <h3 className="text-lg font-semibold mb-6">Đơn hàng gần đây</h3>
          <div className="space-y-6">
            {recentOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const initials = order.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={order.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</div>
                      <div className="text-xs text-muted-foreground capitalize">{order.status}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
