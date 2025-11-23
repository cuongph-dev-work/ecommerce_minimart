/**
 * Convert original image URL to thumbnail URL
 * Supports both MinIO and disk storage formats
 */
export function getThumbnailUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  // MinIO format: http://localhost:9000/ecommerce/product/original/filename.jpg
  // Convert to: http://localhost:9000/ecommerce/product/thumbnail/filename.jpg
  if (originalUrl.includes('/original/')) {
    return originalUrl.replace('/original/', '/thumbnail/');
  }

  // Disk storage format: http://localhost:3001/uploads/product/original/filename.jpg
  // Convert to: http://localhost:3001/uploads/product/thumbnail/filename.jpg
  if (originalUrl.includes('/uploads/') && originalUrl.includes('/original/')) {
    return originalUrl.replace('/original/', '/thumbnail/');
  }

  // If no pattern matches, return original (fallback)
  return originalUrl;
}

/**
 * Get all image variants (original, thumbnail, medium, large) from original URL
 */
export function getImageVariants(originalUrl: string): {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
} {
  if (!originalUrl) {
    return {
      original: '',
      thumbnail: '',
      medium: '',
      large: '',
    };
  }

  const baseUrl = originalUrl.replace('/original/', '/');
  const filename = originalUrl.split('/').pop() || '';
  const pathWithoutOriginal = originalUrl.substring(0, originalUrl.lastIndexOf('/original/'));

  return {
    original: originalUrl,
    thumbnail: `${pathWithoutOriginal}/thumbnail/${filename}`,
    medium: `${pathWithoutOriginal}/medium/${filename}`,
    large: `${pathWithoutOriginal}/large/${filename}`,
  };
}

