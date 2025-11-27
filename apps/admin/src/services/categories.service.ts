import apiClient from '@/lib/api-client';
import type { Category } from '@/types';

export interface CreateCategoryData {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
  status?: string;
  subcategories?: string[];
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface ReorderCategoriesData {
  categories: Array<{ id: string; sortOrder: number }>;
}

class CategoriesService {
  async getAll(signal?: AbortSignal, params?: Record<string, any>): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>(
      '/admin/categories',
      { 
        signal,
        params 
      }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Category> {
    const response = await apiClient.get<{ success: boolean; data: Category }>(
      `/admin/categories/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post<{ success: boolean; data: Category }>(
      '/admin/categories',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.patch<{ success: boolean; data: Category }>(
      `/admin/categories/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`);
  }

  async reorder(data: ReorderCategoriesData): Promise<void> {
    await apiClient.post('/admin/categories/reorder', data);
  }
}

export const categoriesService = new CategoriesService();

