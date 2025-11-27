import { IsObject, IsNotEmpty } from 'class-validator';

export class BatchUpdateSettingsDto {
  @IsObject()
  @IsNotEmpty()
  settings!: Record<string, string>;
}

