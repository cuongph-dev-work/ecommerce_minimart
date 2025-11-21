import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  dest: process.env.UPLOAD_DEST || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
  publicUrl: process.env.UPLOAD_PUBLIC_URL || 'http://localhost:3001/uploads',
  enableOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true',
  imageQuality: parseInt(process.env.IMAGE_QUALITY, 10) || 85,
  thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE, 10) || 150,
  mediumSize: parseInt(process.env.MEDIUM_SIZE, 10) || 500,
  largeSize: parseInt(process.env.LARGE_SIZE, 10) || 1200,
}));

