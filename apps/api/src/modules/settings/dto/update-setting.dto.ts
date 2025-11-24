import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches, IsEmail, IsUrl } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  value!: string;
}

