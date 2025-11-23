import apiClient from '@/lib/api-client';

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  sortOrder: number;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedBannersResponse {
  banners: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBannerData {
  title: string;
  image: string;
  description?: string;
  link?: string;
  sortOrder?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerData extends Partial<CreateBannerData> {}



class BannersService {
  async getAll(params?: { page?: number; limit?: number; search?: string; status?: string }, signal?: AbortSignal): Promise<PaginatedBannersResponse> {
    const response = await apiClient.get<{ success: boolean; data: PaginatedBannersResponse }>(
      '/admin/banners',
      { 
        signal,
        params 
      }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Banner> {
    const response = await apiClient.get<{ success: boolean; data: Banner }>(
      `/admin/banners/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async create(data: CreateBannerData): Promise<Banner> {
    const response = await apiClient.post<{ success: boolean; data: Banner }>(
      '/admin/banners',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateBannerData): Promise<Banner> {
    const response = await apiClient.patch<{ success: boolean; data: Banner }>(
      `/admin/banners/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/banners/${id}`);
  }
}

export const bannersService = new BannersService();

