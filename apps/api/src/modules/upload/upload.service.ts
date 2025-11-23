import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiskStorageService } from './services/disk-storage.service';
import { MinioStorageService } from './services/minio-storage.service';
import { UploadResultDto } from './dto/upload-result.dto';

@Injectable()
export class UploadService {
  private readonly storageType: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly diskStorage: DiskStorageService,
    private readonly minioStorage: MinioStorageService,
  ) {
    this.storageType = this.configService.get<string>('upload.storageType') || 'disk';
  }

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

    // Save file using configured storage
    if (this.storageType === 'minio') {
      return this.minioStorage.saveFile(file, type);
    } else {
      return this.diskStorage.saveFile(file, type);
    }
  }

  async deleteImage(filePath: string): Promise<void> {
    if (this.storageType === 'minio') {
      await this.minioStorage.deleteFile(filePath);
    } else {
      await this.diskStorage.deleteFile(filePath);
    }
  }
}

