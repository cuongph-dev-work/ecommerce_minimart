import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { BannerStatus } from '../../../entities/banner.entity';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  image!: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

