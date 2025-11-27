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

    // Thumbnail
    await image
      .clone()
      .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
      .jpeg({ quality })
      .toFile(path.join(thumbnailDir, filename));

    // Medium
    await image
      .clone()
      .resize(mediumSize, mediumSize, { fit: 'inside' })
      .jpeg({ quality })
      .toFile(path.join(mediumDir, filename));

    // Large
    await image
      .clone()
      .resize(largeSize, largeSize, { fit: 'inside' })
      .jpeg({ quality })
      .toFile(path.join(largeDir, filename));
  }
}

