import apiClient from '@/lib/api-client';

export interface UploadResponse {
  url: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
}

class UploadService {
  async uploadImage(
    file: File, 
    type: 'product' | 'banner' | 'category' | 'store' = 'product',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await apiClient.post<{ success: boolean; data: UploadResponse }>(
      '/upload/images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response.data.data;
  }

  async uploadMultipleImages(
    files: File[],
    type: 'product' | 'banner' | 'category' | 'store' = 'product',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, type, onProgress));
    return Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService();

