import apiClient from '@/lib/api-client';

export interface FlashSaleProduct {
  productId: string;
  productName: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  total: number;
  sold: number;
}

export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  products: FlashSaleProduct[];
}

export interface CreateFlashSaleData {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export type UpdateFlashSaleData = Partial<CreateFlashSaleData>;

export interface AddProductToFlashSaleData {
  productId: string;
  discountPrice: number;
  stockLimit?: number;
}

class FlashSalesService {
  async getAll(signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: FlashSale[] }>(
      '/admin/flash-sales',
      { signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<FlashSale> {
    const response = await apiClient.get<{ success: boolean; data: FlashSale }>(
      `/admin/flash-sales/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async create(data: CreateFlashSaleData): Promise<FlashSale> {
    const response = await apiClient.post<{ success: boolean; data: FlashSale }>(
      '/admin/flash-sales',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateFlashSaleData): Promise<FlashSale> {
    const response = await apiClient.patch<{ success: boolean; data: FlashSale }>(
      `/admin/flash-sales/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${id}`);
  }

  async addProduct(id: string, data: AddProductToFlashSaleData): Promise<void> {
    await apiClient.post(`/admin/flash-sales/${id}/products`, data);
  }

  async removeProduct(id: string, productId: string): Promise<void> {
    await apiClient.delete(`/admin/flash-sales/${id}/products/${productId}`);
  }
}

export const flashSalesService = new FlashSalesService();

