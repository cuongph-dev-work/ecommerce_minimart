import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VoucherType, VoucherStatus } from '../../../entities/voucher.entity';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(VoucherType)
  type!: VoucherType;

  @IsNumber()
  @Min(0)
  discount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchase?: number;

  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @IsEnum(VoucherStatus)
  @IsOptional()
  status?: VoucherStatus;
}

