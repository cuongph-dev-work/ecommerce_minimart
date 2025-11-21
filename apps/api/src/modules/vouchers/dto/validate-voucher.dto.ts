import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ValidateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @Min(0)
  total!: number;
}

