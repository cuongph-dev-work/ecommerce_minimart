import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsObject()
  value!: any;
}

