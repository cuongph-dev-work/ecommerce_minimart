import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiskStorageService } from './services/disk-storage.service';
import { UploadResultDto } from './dto/upload-result.dto';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    private readonly diskStorage: DiskStorageService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    type: 'product' | 'banner' | 'category' | 'store',
  ): Promise<UploadResultDto> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WebP images are allowed');
    }

    // Validate file size
    const maxSize = this.configService.get<number>('upload.maxFileSize') || 5242880; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Save file
    return this.diskStorage.saveFile(file, type);
  }

  async deleteImage(filePath: string): Promise<void> {
    await this.diskStorage.deleteFile(filePath);
  }
}

