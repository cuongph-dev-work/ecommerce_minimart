import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ImageProcessorService } from './image-processor.service';
import { UploadResultDto } from '../dto/upload-result.dto';

@Injectable()
export class DiskStorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly imageProcessor: ImageProcessorService,
  ) {}

  async saveFile(
    file: Express.Multer.File,
    type: 'product' | 'banner' | 'category' | 'store',
  ): Promise<UploadResultDto> {
    const uploadDest = this.configService.get<string>('upload.dest') || './uploads';
    const publicUrl = this.configService.get<string>('upload.publicUrl');

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;

    // Create directory structure
    const typeDir = path.join(uploadDest, type);
    const originalDir = path.join(typeDir, 'original');
    await fs.ensureDir(originalDir);

    // Save original file
    const filePath = path.join(originalDir, filename);
    await fs.writeFile(filePath, file.buffer);

    // Process image (create thumbnails, etc.)
    if (file.mimetype.startsWith('image/')) {
      await this.imageProcessor.processImage(filePath, type);
    }

    return {
      url: `${publicUrl}/${type}/original/${filename}`,
      thumbnail: `${publicUrl}/${type}/thumbnail/${filename}`,
      filename,
      size: file.size,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const uploadDest = this.configService.get<string>('upload.dest') || './uploads';
    
    // Parse the file path to get type and filename
    const parts = filePath.split('/');
    const filename = parts[parts.length - 1];
    const type = parts[parts.length - 3];

    // Delete all versions
    const typeDir = path.join(uploadDest, type);
    const sizes = ['original', 'thumbnail', 'medium', 'large'];

    for (const size of sizes) {
      const file = path.join(typeDir, size, filename);
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }
}

