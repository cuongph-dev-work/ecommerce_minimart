import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProductStatus } from '../../../entities/product.entity';

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
  @IsString()
  @IsEnum(['name', 'price', 'created_at', 'sold'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

