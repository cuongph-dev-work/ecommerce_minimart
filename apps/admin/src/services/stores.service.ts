import apiClient from '@/lib/api-client';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  lat?: number;
  lng?: number;
  workingHours?: any;
  services?: string[];
  allowPickup?: boolean;
  preparationTime?: string;
  status?: string;
}

export interface CreateStoreData {
  name: string;
  address: string;
  phone: string;
  email?: string;
  lat?: number;
  lng?: number;
  workingHours?: any;
  services?: string[];
  allowPickup?: boolean;
  preparationTime?: string;
  status?: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {}

export interface QueryStoreParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

class StoresService {
  async getAll(params?: QueryStoreParams, signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: { stores: Store[]; pagination: any } }>(
      '/admin/stores',
      { params, signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Store> {
    const response = await apiClient.get<{ success: boolean; data: Store }>(
      `/admin/stores/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async create(data: CreateStoreData): Promise<Store> {
    const response = await apiClient.post<{ success: boolean; data: Store }>(
      '/admin/stores',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateStoreData): Promise<Store> {
    const response = await apiClient.patch<{ success: boolean; data: Store }>(
      `/admin/stores/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/stores/${id}`);
  }
}

export const storesService = new StoresService();

