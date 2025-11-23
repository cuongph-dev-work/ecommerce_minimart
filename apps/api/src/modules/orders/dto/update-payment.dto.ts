import { IsEnum, IsNumber, IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../../../entities/order.entity';

export class UpdatePaymentDto {
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  receiptImages?: string[];
}

