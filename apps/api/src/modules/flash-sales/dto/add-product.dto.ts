import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddFlashSaleProductDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0)
  originalPrice!: number;

  @IsNumber()
  @Min(0)
  salePrice!: number;

  @IsNumber()
  @Min(0)
  total!: number;
}

