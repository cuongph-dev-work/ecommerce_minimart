import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { DiskStorageService } from './services/disk-storage.service';
import { MinioStorageService } from './services/minio-storage.service';
import { ImageProcessorService } from './services/image-processor.service';
import uploadConfig, { minioConfig } from '../../config/upload.config';

@Module({
  imports: [
    ConfigModule.forFeature(uploadConfig),
    ConfigModule.forFeature(minioConfig),
  ],
  controllers: [UploadController],
  providers: [UploadService, DiskStorageService, MinioStorageService, ImageProcessorService],
  exports: [UploadService],
})
export class UploadModule {}

