import apiClient from '@/lib/api-client';
import type { Product } from '@/types';

export interface CreateProductData {
  name: string;
  description?: string;
  specifications?: string;
  usageGuide?: string;
  price: number;
  discount?: number;
  stock: number;
  categoryId: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  images: string[];
  status?: string;
  featured?: boolean;
  isOfficial?: boolean;
  isHidden?: boolean;
  warrantyPeriod?: string;
}

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ProductsService {
  async getAll(params?: QueryProductParams, signal?: AbortSignal): Promise<ProductListResponse> {
    const response = await apiClient.get<{ success: boolean; data: ProductListResponse }>(
      '/admin/products',
      { params, signal }
    );
    return response.data.data;
  }



  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<{ success: boolean; data: Product }>(
      `/admin/products/${id}`
    );
    return response.data.data;
  }

  async create(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<{ success: boolean; data: Product }>(
      '/admin/products',
      data
    );
    return response.data.data;
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.patch<{ success: boolean; data: Product }>(
      `/admin/products/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post('/admin/products/bulk-delete', { ids });
  }
}

export const productsService = new ProductsService();

