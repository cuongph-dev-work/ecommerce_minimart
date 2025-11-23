import apiClient from '@/lib/api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface QueryUserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

class UsersService {
  async getAll(params?: QueryUserParams, signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: { users: User[]; pagination: any } }>(
      '/admin/users',
      { params, signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      `/admin/users/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async updateStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>(
      `/admin/users/${id}/status`,
      { status }
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }
}

export const usersService = new UsersService();

