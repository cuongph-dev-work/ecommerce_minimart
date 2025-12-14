import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsEmail, IsEnum, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '../../../entities/order.entity';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  customerEmail!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @ValidateIf(o => !o.deliveryType || o.deliveryType === DeliveryType.PICKUP || o.deliveryType === 'pickup')
  @IsNotEmpty({ message: 'Pickup store is required when delivery type is pickup' })
  pickupStoreId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  @IsOptional()
  voucherCode?: string;

  @IsOptional()
  expressDelivery?: boolean;

  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType;

  @IsString()
  @ValidateIf(o => o.deliveryType === DeliveryType.DELIVERY || o.deliveryType === 'delivery')
  @IsNotEmpty({ message: 'Delivery address is required when delivery type is delivery' })
  deliveryAddress?: string;
}


