import apiClient from '@/lib/api-client';

export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'processing' | 'ready' | 'received' | 'completed' | 'cancelled' | 'returned';
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  pickupStore?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

class OrdersService {
  /**
   * Track order by order number and phone number
   */
  async trackOrder(orderNumber: string, phone: string, signal?: AbortSignal): Promise<Order> {
    const response = await apiClient.get<{ success: boolean; data: Order }>(
      '/orders/track',
      {
        params: { orderNumber, phone },
        signal,
      }
    );
    return response.data.data;
  }

  /**
   * Create a new order
   */
  async create(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
    deliveryType: 'pickup' | 'delivery';
    pickupStoreId?: string;
    deliveryAddress?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    voucherCode?: string;
    expressDelivery?: boolean;
  }): Promise<Order> {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      '/orders',
      data
    );
    return response.data.data;
  }
}

export const ordersService = new OrdersService();

