import { uploadService, type UploadResponse } from '@/services/upload.service';

/**
 * Represents a pending file upload (not yet uploaded to server)
 */
export interface PendingFile {
  file: File;
  preview: string; // Base64 or blob URL for preview
  id: string; // Unique ID for tracking
}

/**
 * Represents an uploaded file (already on server)
 */
export interface UploadedFile {
  url: string;
  id: string;
}

/**
 * Result of batch upload operation
 */
export interface BatchUploadResult {
  uploaded: UploadResponse[];
  failed: Array<{ file: File; error: unknown }>;
}

/**
 * Upload helper utility for handling file uploads with rollback support
 */
export class UploadHelper {
  /**
   * Create preview URL from File object
   */
  static createPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  static revokePreview(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
    const allowedTypes = options?.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Chỉ chấp nhận file hình ảnh' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Định dạng không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}` };
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      return { valid: false, error: `Kích thước file không được vượt quá ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  /**
   * Upload multiple files with progress tracking and rollback support
   * If any upload fails, all successfully uploaded files will be rolled back
   */
  static async uploadBatch(
    files: File[],
    type: 'product' | 'banner' | 'category' | 'store',
    options?: {
      onProgress?: (progress: number, fileIndex: number) => void;
      onFileComplete?: (file: File, result: UploadResponse, index: number) => void;
    }
  ): Promise<BatchUploadResult> {
    const uploaded: UploadResponse[] = [];
    const failed: Array<{ file: File; error: unknown }> = [];

    try {
      // Upload files sequentially to track progress and enable rollback
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Upload with progress tracking
          const result = await uploadService.uploadImage(file, type, (progress) => {
            options?.onProgress?.(progress, i);
          });

          uploaded.push(result);
          options?.onFileComplete?.(file, result, i);
        } catch (error) {
          // If upload fails, stop and rollback
          failed.push({ file, error });
          
          // Rollback: Delete all successfully uploaded files
          await this.rollbackUploads(uploaded);
          
          throw error; // Re-throw to stop further processing
        }
      }

      return { uploaded, failed };
    } catch (error) {
      // Ensure rollback even if error occurs
      if (uploaded.length > 0) {
        await this.rollbackUploads(uploaded);
      }
      throw error;
    }
  }

  /**
   * Rollback uploaded files by deleting them from server
   */
  static async rollbackUploads(uploaded: UploadResponse[]): Promise<void> {
    // Note: This requires a delete endpoint on the backend
    // For now, we'll log the URLs that need to be deleted
    // In production, you should implement a delete API endpoint
    console.warn('Rollback required for uploaded files:', uploaded.map(u => u.url));
    
    // TODO: Implement actual deletion when backend supports it
    // for (const upload of uploaded) {
    //   try {
    //     await uploadService.deleteImage(upload.url);
    //   } catch (error) {
    //     console.error('Failed to delete uploaded file:', upload.url, error);
    //   }
    // }
  }

  /**
   * Clean up preview URLs
   */
  static cleanupPreviews(previews: string[]): void {
    previews.forEach(preview => this.revokePreview(preview));
  }
}

