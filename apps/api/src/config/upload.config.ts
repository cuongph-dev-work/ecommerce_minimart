import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  dest: process.env.UPLOAD_DEST || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
  publicUrl: process.env.UPLOAD_PUBLIC_URL,
  enableOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true',
  imageQuality: parseInt(process.env.IMAGE_QUALITY, 10) || 85,
  thumbnailQuality: parseInt(process.env.THUMBNAIL_QUALITY, 10) || 92,
  thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE, 10) || 150,
  mediumSize: parseInt(process.env.MEDIUM_SIZE, 10) || 500,
  largeSize: parseInt(process.env.LARGE_SIZE, 10) || 1200,
  storageType: process.env.STORAGE_TYPE || 'disk', // 'disk' or 'minio'
}));

export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucketName: process.env.MINIO_BUCKET_NAME || 'ecommerce',
  publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000',
  useSSL: process.env.MINIO_USE_SSL === 'true',
}));

