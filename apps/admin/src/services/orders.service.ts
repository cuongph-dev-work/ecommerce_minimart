import apiClient from '@/lib/api-client';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
}

export interface UpdatePaymentStatusData {
  paymentStatus: PaymentStatus;
  amount: number;
  note?: string;
  receiptImages?: string[];
}

export interface AddContactData {
  message: string;
}

export interface QueryOrderParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  pickupStoreId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  voucherCode?: string;
}

class OrdersService {
  async getAll(params?: QueryOrderParams, signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: { orders: Order[]; pagination: any } }>(
      '/admin/orders',
      { params, signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Order> {
    const response = await apiClient.get<{ success: boolean; data: Order }>(
      `/admin/orders/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async updateStatus(id: string, data: UpdateOrderStatusData): Promise<Order> {
    const response = await apiClient.put<{ success: boolean; data: Order }>(
      `/admin/orders/${id}/status`,
      data
    );
    return response.data.data;
  }

  async updatePayment(id: string, data: UpdatePaymentStatusData): Promise<Order> {
    const response = await apiClient.put<{ success: boolean; data: Order }>(
      `/admin/orders/${id}/payment`,
      data
    );
    return response.data.data;
  }

  async addContact(id: string, data: AddContactData): Promise<void> {
    await apiClient.post(`/admin/orders/${id}/contact`, data);
  }

  async create(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<{ success: boolean; data: { orderId: string; orderNumber: string; total: number } }>(
      '/orders',
      data
    );
    // Fetch the full order details after creation
    const order = await this.getById(response.data.data.orderId);
    return order;
  }
}

export const ordersService = new OrdersService();

