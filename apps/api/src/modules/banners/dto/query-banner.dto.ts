import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { BannerStatus } from '../../../entities/banner.entity';

export class QueryBannerDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BannerStatus)
  status?: BannerStatus;

  @IsOptional()
  @IsString()
  @IsEnum(['sortOrder', 'created_at'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

