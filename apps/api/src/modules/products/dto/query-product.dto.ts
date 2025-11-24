import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProductStatus } from '../../../entities/product.entity';
import { Transform } from 'class-transformer';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @IsEnum(['name', 'price', 'created_at', 'sold'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

