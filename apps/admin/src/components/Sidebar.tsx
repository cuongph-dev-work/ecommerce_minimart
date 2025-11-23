import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  ChevronRight,
  Image,
  // Zap, // Tạm thời comment do chưa implement Flash Sale
  // Ticket, // Tạm thời comment do chưa implement Vouchers
  MapPin,
  // Star, // Tạm thời comment do chưa implement Reviews
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Tổng quan',
      path: '/',
    },
    {
      icon: Package,
      label: 'Sản phẩm',
      path: '/products',
    },
    {
      icon: Tags,
      label: 'Danh mục',
      path: '/categories',
    },
    {
      icon: Image,
      label: 'Banners',
      path: '/banners',
    },
    // Tạm thời ẩn Flash Sale và Vouchers do chưa implement
    // {
    //   icon: Zap,
    //   label: 'Flash Sale',
    //   path: '/flash-sales',
    // },
    // {
    //   icon: Ticket,
    //   label: 'Vouchers',
    //   path: '/vouchers',
    // },
    {
      icon: MapPin,
      label: 'Cửa hàng',
      path: '/stores',
    },
    {
      icon: ShoppingCart,
      label: 'Đơn hàng',
      path: '/orders',
    },
    // Tạm thời ẩn Đánh giá do chưa implement
    // {
    //   icon: Star,
    //   label: 'Đánh giá',
    //   path: '/reviews',
    // },
    // Tạm thời ẩn tab Người dùng do chưa có chức năng đăng ký user
    // {
    //   icon: Users,
    //   label: 'Người dùng',
    //   path: '/users',
    // },
    {
      icon: Settings,
      label: 'Cấu hình',
      path: '/settings',
    },
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-screen w-72 bg-background border-r border-border flex flex-col fixed left-0 top-0 z-50"
    >
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="font-bold text-primary-foreground text-xl">M</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight">Minimart</span>
          <span className="text-xs text-muted-foreground font-medium">Admin Panel</span>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
          Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </div>

    </motion.div>
  );
}
