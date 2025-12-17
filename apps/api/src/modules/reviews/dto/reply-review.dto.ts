import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ReplyReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Reply must not exceed 2000 characters' })
  reply!: string;
}

