import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { CategoryStatus } from '../../../entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subcategories?: string[];

  @IsEnum(CategoryStatus)
  @IsOptional()
  status?: CategoryStatus;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

