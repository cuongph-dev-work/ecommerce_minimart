import apiClient from '@/lib/api-client';

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  reply?: string;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: string;
}

export interface ReplyReviewData {
  reply: string;
}

export interface QueryReviewParams {
  page?: number;
  limit?: number;
  productId?: string;
  rating?: number;
  isApproved?: boolean;
  isHidden?: boolean;
}

class ReviewsService {
  async getAll(params?: QueryReviewParams, signal?: AbortSignal) {
    const response = await apiClient.get<{ success: boolean; data: { reviews: Review[]; pagination: any } }>(
      '/admin/reviews',
      { params, signal }
    );
    return response.data.data;
  }

  async getById(id: string, signal?: AbortSignal): Promise<Review> {
    const response = await apiClient.get<{ success: boolean; data: Review }>(
      `/admin/reviews/${id}`,
      { signal }
    );
    return response.data.data;
  }

  async approve(id: string): Promise<Review> {
    const response = await apiClient.patch<{ success: boolean; data: Review }>(
      `/admin/reviews/${id}/approve`
    );
    return response.data.data;
  }

  async hide(id: string): Promise<Review> {
    const response = await apiClient.patch<{ success: boolean; data: Review }>(
      `/admin/reviews/${id}/hide`
    );
    return response.data.data;
  }

  async reply(id: string, data: ReplyReviewData): Promise<Review> {
    const response = await apiClient.post<{ success: boolean; data: Review }>(
      `/admin/reviews/${id}/reply`,
      data
    );
    return response.data.data;
  }
}

export const reviewsService = new ReviewsService();

