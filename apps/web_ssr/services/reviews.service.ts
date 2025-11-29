import apiClient from '@/lib/api-client';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment?: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
}

interface PaginatedReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ReviewsService {
  async getByProduct(productId: string, page: number = 1, limit: number = 20, signal?: AbortSignal): Promise<PaginatedReviewsResponse> {
    const response = await apiClient.get<{ success: boolean; data: PaginatedReviewsResponse }>(
      `/reviews/product/${productId}`,
      { 
        params: { 
          page, 
          limit,
        },
        signal 
      }
    );
    return response.data.data;
  }

  async getAll(params?: {
    productId?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }, signal?: AbortSignal): Promise<PaginatedReviewsResponse> {
    const response = await apiClient.get<{ success: boolean; data: PaginatedReviewsResponse }>(
      '/reviews',
      { params, signal }
    );
    return response.data.data;
  }

  async create(data: {
    productId: string;
    userName: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const response = await apiClient.post<{ success: boolean; data: Review }>(
      '/reviews',
      data
    );
    return response.data.data;
  }
}

export const reviewsService = new ReviewsService();

