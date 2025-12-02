import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs-extra';

@Injectable()
export class ImageProcessorService {
  constructor(private readonly configService: ConfigService) {}

  async processImage(
    filePath: string,
    _type: 'product' | 'banner' | 'category' | 'store',
  ): Promise<void> {
    const enableOptimization = this.configService.get<boolean>('upload.enableOptimization');
    
    if (!enableOptimization) {
      return;
    }

    const quality = this.configService.get<number>('upload.imageQuality') || 85;
    const thumbnailQuality = this.configService.get<number>('upload.thumbnailQuality') || 92;
    const thumbnailSize = this.configService.get<number>('upload.thumbnailSize') || 150;
    const mediumSize = this.configService.get<number>('upload.mediumSize') || 500;
    const largeSize = this.configService.get<number>('upload.largeSize') || 1200;

    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);
    const baseDir = path.dirname(dir); // Go up from 'original' folder

    // Create size folders
    const thumbnailDir = path.join(baseDir, 'thumbnail');
    const mediumDir = path.join(baseDir, 'medium');
    const largeDir = path.join(baseDir, 'large');

    await fs.ensureDir(thumbnailDir);
    await fs.ensureDir(mediumDir);
    await fs.ensureDir(largeDir);

    // Process images
    const image = sharp(filePath);
    const fileStats = await fs.stat(filePath);
    const fileSize = fileStats.size;
    const ONE_MB = 1024 * 1024; // 1MB in bytes

    // Thumbnail - nếu file < 1MB thì dùng ảnh gốc
    if (fileSize < ONE_MB) {
      // Dùng ảnh gốc làm thumbnail, chỉ tối ưu chất lượng
      await image
        .clone()
        .jpeg({ 
          quality: thumbnailQuality,
          progressive: true,
          mozjpeg: true
        })
        .toFile(path.join(thumbnailDir, filename));
    } else {
      // Resize với các tối ưu chất lượng
      await image
        .clone()
        .resize(thumbnailSize, thumbnailSize, { 
          fit: 'cover',
          kernel: 'lanczos3'
        })
        .sharpen({ sigma: 1, m1: 1.2, m2: 1.4, x1: 2, y2: 10, y3: 20 })
        .jpeg({ 
          quality: thumbnailQuality,
          progressive: true,
          mozjpeg: true
        })
        .toFile(path.join(thumbnailDir, filename));
    }

    // Medium
    await image
      .clone()
      .resize(mediumSize, mediumSize, { fit: 'inside' })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(path.join(mediumDir, filename));

    // Large
    await image
      .clone()
      .resize(largeSize, largeSize, { fit: 'inside' })
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(path.join(largeDir, filename));
  }
}

