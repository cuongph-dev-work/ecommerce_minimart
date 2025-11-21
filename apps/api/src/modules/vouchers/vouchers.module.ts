import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VouchersService } from './vouchers.service';
import { VouchersController, PublicVouchersController } from './vouchers.controller';
import { Voucher } from '../../entities/voucher.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Voucher])],
  controllers: [VouchersController, PublicVouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}

