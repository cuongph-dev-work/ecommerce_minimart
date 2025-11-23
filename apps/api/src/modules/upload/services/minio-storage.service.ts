import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  GetBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import sharp from 'sharp';
import { UploadResultDto } from '../dto/upload-result.dto';

@Injectable()
export class MinioStorageService implements OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('minio.endpoint') || 'http://localhost:9000';
    const accessKey = this.configService.get<string>('minio.accessKey') || 'minioadmin';
    const secretKey = this.configService.get<string>('minio.secretKey') || 'minioadmin';
    this.bucketName = this.configService.get<string>('minio.bucketName') || 'ecommerce';
    this.publicUrl = this.configService.get<string>('minio.publicUrl') || endpoint;

    this.s3Client = new S3Client({
      endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
    await this.setBucketPolicy();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      const headCommand = new HeadBucketCommand({
        Bucket: this.bucketName,
      });
      
      try {
        await this.s3Client.send(headCommand);
        this.logger.log(`MinIO bucket '${this.bucketName}' already exists`);
      } catch (error: unknown) {
        // Bucket doesn't exist, create it
        if ((error as { name?: string })?.name === 'NotFound' || (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode === 404) {
          this.logger.log(`Creating MinIO bucket '${this.bucketName}'...`);
          const createCommand = new CreateBucketCommand({
            Bucket: this.bucketName,
          });
          await this.s3Client.send(createCommand);
          this.logger.log(`MinIO bucket '${this.bucketName}' created successfully`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.logger.error(`Failed to ensure MinIO bucket exists: ${error}`);
      // Don't throw, allow the service to continue
      // Bucket will be created on first upload attempt
    }
  }

  private async setBucketPolicy(): Promise<void> {
    try {
      // Check if policy already exists
      try {
        const getPolicyCommand = new GetBucketPolicyCommand({
          Bucket: this.bucketName,
        });
        await this.s3Client.send(getPolicyCommand);
        this.logger.log(`Bucket policy for '${this.bucketName}' already exists`);
        return;
      } catch (error: unknown) {
        // Policy doesn't exist, create it
        if ((error as { name?: string })?.name === 'NoSuchBucketPolicy' || 
            (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode === 404) {
          // Continue to set policy
        } else {
          throw error;
        }
      }

      // Create public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      const putPolicyCommand = new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(policy),
      });

      await this.s3Client.send(putPolicyCommand);
      this.logger.log(`Bucket policy set for '${this.bucketName}' to allow public read access`);
    } catch (error) {
      this.logger.warn(`Failed to set bucket policy: ${error}. You may need to set it manually in MinIO Console.`);
      // Don't throw, allow the service to continue
    }
  }

  async saveFile(
    file: Express.Multer.File,
    type: 'product' | 'banner' | 'category' | 'store',
  ): Promise<UploadResultDto> {
    // Ensure bucket exists before upload
    await this.ensureBucketExists();

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const key = `${type}/original/${filename}`;

    // Upload original file
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(uploadCommand);

    // Process image to create thumbnails
    const imageMetadata = await this.processImage(file.buffer, type, filename);

    // Construct public URL
    // MinIO public URL format: http://localhost:9000/bucket-name/key
    const publicUrl = this.publicUrl.endsWith('/') 
      ? `${this.publicUrl}${this.bucketName}` 
      : `${this.publicUrl}/${this.bucketName}`;
    
    return {
      url: `${publicUrl}/${key}`,
      thumbnail: `${publicUrl}/${type}/thumbnail/${filename}`,
      filename,
      size: file.size,
      width: imageMetadata.width,
      height: imageMetadata.height,
    };
  }

  private async processImage(
    buffer: Buffer,
    type: 'product' | 'banner' | 'category' | 'store',
    filename: string,
  ): Promise<{ width?: number; height?: number }> {
    const enableOptimization = this.configService.get<boolean>('upload.enableOptimization');
    
    if (!enableOptimization) {
      return {};
    }

    try {
      const quality = this.configService.get<number>('upload.imageQuality') || 85;
      const thumbnailSize = this.configService.get<number>('upload.thumbnailSize') || 150;
      const mediumSize = this.configService.get<number>('upload.mediumSize') || 500;
      const largeSize = this.configService.get<number>('upload.largeSize') || 1200;

      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Process thumbnail
      const thumbnailBuffer = await image
        .clone()
        .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
        .jpeg({ quality })
        .toBuffer();

      await this.uploadToMinio(
        `${type}/thumbnail/${filename}`,
        thumbnailBuffer,
        'image/jpeg',
      );

      // Process medium
      const mediumBuffer = await image
        .clone()
        .resize(mediumSize, mediumSize, { fit: 'inside' })
        .jpeg({ quality })
        .toBuffer();

      await this.uploadToMinio(
        `${type}/medium/${filename}`,
        mediumBuffer,
        'image/jpeg',
      );

      // Process large
      const largeBuffer = await image
        .clone()
        .resize(largeSize, largeSize, { fit: 'inside' })
        .jpeg({ quality })
        .toBuffer();

      await this.uploadToMinio(
        `${type}/large/${filename}`,
        largeBuffer,
        'image/jpeg',
      );

      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      this.logger.warn('Failed to process image', error);
      return {};
    }
  }

  private async uploadToMinio(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Extract key from URL or use filePath directly
      let key = filePath;
      if (filePath.includes(this.publicUrl)) {
        key = filePath.replace(`${this.publicUrl}/${this.bucketName}/`, '');
      }

      // Extract type and filename from key
      const parts = key.split('/');
      const type = parts[0];
      const filename = parts[parts.length - 1];

      // Delete all versions (original, thumbnail, medium, large)
      const sizes = ['original', 'thumbnail', 'medium', 'large'];

      for (const size of sizes) {
        const deleteKey = `${type}/${size}/${filename}`;
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: deleteKey,
          });
          await this.s3Client.send(deleteCommand);
        } catch (error) {
          // Ignore errors if file doesn't exist
          this.logger.debug(`File ${deleteKey} not found, skipping deletion`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}`, error);
      throw error;
    }
  }
}

