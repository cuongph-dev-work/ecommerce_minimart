import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VoucherType, VoucherStatus } from '../../../entities/voucher.entity';

export class QueryVoucherDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @IsOptional()
  @IsEnum(VoucherType)
  type?: VoucherType;

  @IsOptional()
  @IsString()
  @IsEnum(['code', 'created_at', 'usedCount'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

