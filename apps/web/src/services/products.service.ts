import apiClient from '@/lib/api-client';
import type { Product } from '@/types';

class ProductsService {
  async getFeatured(limit?: number, signal?: AbortSignal): Promise<Product[]> {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>(
      '/products/featured',
      { 
        params: { limit },
        signal 
      }
    );
    return response.data.data;
  }

  async getByCategory(
    categoryId: string, 
    limit?: number, 
    sortBy: string = 'sold',
    sortOrder: 'asc' | 'desc' = 'desc',
    signal?: AbortSignal
  ): Promise<Product[]> {
    const response = await apiClient.get<{ success: boolean; data: { products: Product[] } }>(
      '/products',
      { 
        params: { 
          category: categoryId,
          sortBy,
          sortOrder,
          limit,
        },
        signal 
      }
    );
    return response.data.data.products;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<{ success: boolean; data: Product }>(
      `/products/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async getAll(params?: {
    search?: string;
    category?: string;
    brand?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }, signal?: AbortSignal): Promise<{ products: Product[]; pagination: any }> {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: { products: Product[]; pagination: any } 
    }>(
      '/products',
      { params, signal }
    );
    return response.data.data;
  }

  async getPopularSearches(limit: number = 5, signal?: AbortSignal): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      '/products/search/popular',
      { 
        params: { limit },
        signal 
      }
    );
    return response.data.data;
  }
}

export const productsService = new ProductsService();

