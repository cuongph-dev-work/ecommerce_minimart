import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { StoreStatus } from '../../../entities/store.entity';

export class QueryStoreDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  allowPickup?: boolean;

  @IsOptional()
  @IsString()
  @IsEnum(['name', 'orderCount', 'created_at'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

