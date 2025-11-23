import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

