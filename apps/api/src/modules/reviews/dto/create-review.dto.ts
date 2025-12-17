import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  comment?: string;
}

