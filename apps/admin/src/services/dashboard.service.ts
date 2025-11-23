import apiClient from '@/lib/api-client';

export interface DashboardStats {
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
}

export interface TopProduct {
  id: string;
  name: string;
  soldCount: number;
  price: number;
  image?: string;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

class DashboardService {
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      '/admin/dashboard/stats',
      { signal }
    );
    return response.data.data;
  }

  async getTopProducts(limit: number = 10, signal?: AbortSignal): Promise<TopProduct[]> {
    const response = await apiClient.get<{ success: boolean; data: TopProduct[] }>(
      '/admin/dashboard/top-products',
      { params: { limit }, signal }
    );
    return response.data.data;
  }

  async getRecentOrders(limit: number = 10, signal?: AbortSignal): Promise<RecentOrder[]> {
    const response = await apiClient.get<{ success: boolean; data: RecentOrder[] }>(
      '/admin/dashboard/recent-orders',
      { params: { limit }, signal }
    );
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();

