import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import { StoreStatus } from '../../../entities/store.entity';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  workingHours?: {
    weekdays: { start: string; end: string };
    weekends: { start: string; end: string };
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[];

  @IsBoolean()
  @IsOptional()
  allowPickup?: boolean;

  @IsString()
  @IsOptional()
  preparationTime?: string;

  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;
}

