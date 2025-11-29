import type { Order } from '../services/orders.service';

export interface OrderHistoryItem {
  orderNumber: string;
  phone: string;
  orderData: Order;
  searchedAt: string;
}

const STORAGE_KEY = 'order_tracking_history';
const MAX_HISTORY = 10; // Giữ tối đa 10 lịch sử

export const orderHistoryService = {
  /**
   * Lấy tất cả lịch sử tra cứu
   */
  getAll(): OrderHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  /**
   * Thêm một lịch sử tra cứu mới
   */
  add(orderNumber: string, phone: string, orderData: Order): void {
    try {
      const history = this.getAll();
      
      // Xóa item cũ nếu đã tồn tại (same orderNumber + phone)
      const filtered = history.filter(
        item => !(item.orderNumber === orderNumber && item.phone === phone)
      );
      
      // Thêm item mới vào đầu
      const newItem: OrderHistoryItem = {
        orderNumber,
        phone,
        orderData,
        searchedAt: new Date().toISOString(),
      };
      
      filtered.unshift(newItem);
      
      // Giới hạn số lượng
      const limited = filtered.slice(0, MAX_HISTORY);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save order history:', error);
    }
  },

  /**
   * Xóa một item khỏi lịch sử
   */
  remove(orderNumber: string, phone: string): void {
    try {
      const history = this.getAll();
      const filtered = history.filter(
        item => !(item.orderNumber === orderNumber && item.phone === phone)
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove order history:', error);
    }
  },

  /**
   * Xóa tất cả lịch sử
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear order history:', error);
    }
  },
};

