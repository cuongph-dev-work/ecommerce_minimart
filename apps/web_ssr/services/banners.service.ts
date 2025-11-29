import apiClient from '@/lib/api-client';
import type { Banner } from '@/types';

class BannersService {
  async getAll(signal?: AbortSignal): Promise<Banner[]> {
    const response = await apiClient.get<{ success: boolean; data: Banner[] }>(
      '/banners',
      { signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Banner> {
    const response = await apiClient.get<{ success: boolean; data: Banner }>(
      `/banners/${id}`,
      { signal }
    );
    return response.data.data;
  }
}

export const bannersService = new BannersService();

