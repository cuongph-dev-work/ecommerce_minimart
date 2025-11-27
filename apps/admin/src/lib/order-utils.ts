import type { OrderStatus } from '@/types';

/**
 * Generate a unique order ID
 * Format: ORD-YYYYMMDD-XXXX
 */
export function generateOrderId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Calculate order total
 */
export function calculateTotal(subtotal: number, discount: number): number {
  return subtotal - discount;
}

/**
 * Get valid next statuses based on current status
 * Simplified for pickup-only model
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  const statusFlow: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['received', 'cancelled'],
    ready_for_pickup: ['received', 'cancelled'],
    received: ['returned'],
    completed: ['returned'],
    cancelled: [],
    returned: [],
  };

  return statusFlow[currentStatus] || [];
}

/**
 * Format order date to Vietnamese format
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get color class for status badge
 */
export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
    confirmed: 'bg-blue-500/10 text-blue-600 border-blue-200',
    preparing: 'bg-purple-500/10 text-red-600 border-purple-200',
    ready: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    ready_for_pickup: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    received: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    cancelled: 'bg-rose-500/10 text-rose-600 border-rose-200',
    returned: 'bg-orange-500/10 text-orange-600 border-orange-200',
  };

  return colors[status] || 'bg-gray-500/10 text-gray-600 border-gray-200';
}

/**
 * Get Vietnamese label for status
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng nhận hàng',
    ready_for_pickup: 'Sẵn sàng nhận hàng',
    received: 'Đã hoàn thành',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
    returned: 'Hoàn trả',
  };

  return labels[status] || status;
}



/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Get status icon
 */
export function getStatusIcon(status: OrderStatus): string {
  const icons: Record<OrderStatus, string> = {
    pending: '⏳',
    confirmed: '✅',
    preparing: '📦',
    ready: '🏪',
    ready_for_pickup: '🏪',
    received: '✨',
    completed: '✨',
    cancelled: '❌',
    returned: '↩️',
  };

  return icons[status] || '📋';
}

/**
 * Get Vietnamese label for delivery method
 */
export function getDeliveryMethodLabel(method: 'pickup' | 'delivery'): string {
  const labels: Record<'pickup' | 'delivery', string> = {
    pickup: 'Nhận tại cửa hàng',
    delivery: 'Giao hàng',
  };

  return labels[method] || method;
}
