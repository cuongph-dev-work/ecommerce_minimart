import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FlashSaleStatus } from '../../../entities/flash-sale.entity';

export class CreateFlashSaleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Date)
  @IsNotEmpty()
  startTime!: Date;

  @Type(() => Date)
  @IsNotEmpty()
  endTime!: Date;

  @IsEnum(FlashSaleStatus)
  @IsOptional()
  status?: FlashSaleStatus;
}

