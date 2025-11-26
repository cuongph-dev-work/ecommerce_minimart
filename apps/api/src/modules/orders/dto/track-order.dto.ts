import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TrackOrderDto {
  @IsNotEmpty({ message: 'Mã đơn hàng là bắt buộc' })
  @IsString()
  orderNumber: string;

  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại phải có 10-11 chữ số' })
  phone: string;
}

