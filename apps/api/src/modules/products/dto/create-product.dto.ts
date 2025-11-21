import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';
import { ProductStatus } from '../../../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsBoolean()
  @IsOptional()
  isOfficial?: boolean;

  @IsString()
  @IsOptional()
  warrantyPeriod?: string;
}

