import apiClient from '@/lib/api-client';
import type { Category } from '@/types';

export interface CategoryWithSales extends Category {
  totalSold: number;
}

class CategoriesService {
  async getAll(signal?: AbortSignal): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; data: Category[] }>(
      '/categories',
      { signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Category> {
    const response = await apiClient.get<{ success: boolean; data: Category }>(
      `/categories/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async getBySlug(slug: string, signal?: AbortSignal): Promise<Category> {
    const response = await apiClient.get<{ success: boolean; data: Category }>(
      `/categories/slug/${slug}`,
      { signal }
    );
    return response.data.data;
  }

  async getTopBySales(limit?: number, signal?: AbortSignal): Promise<CategoryWithSales[]> {
    const response = await apiClient.get<{ success: boolean; data: CategoryWithSales[] }>(
      '/categories/top-by-sales',
      { 
        params: { limit },
        signal 
      }
    );
    return response.data.data;
  }
}

export const categoriesService = new CategoriesService();

