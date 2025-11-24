import apiClient from '@/lib/api-client';
import type { Store } from '@/types';

class StoresService {
  async getAll(signal?: AbortSignal): Promise<Store[]> {
    const response = await apiClient.get<{ success: boolean; data: Store[] }>(
      '/stores',
      { signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Store> {
    const response = await apiClient.get<{ success: boolean; data: Store }>(
      `/stores/${id}`,
      { signal }
    );
    return response.data.data;
  }
}

export const storesService = new StoresService();

