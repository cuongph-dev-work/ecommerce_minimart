import { IsObject, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchUpdateSettingsDto {
  @IsObject()
  @IsNotEmpty()
  settings!: Record<string, string>;
}

