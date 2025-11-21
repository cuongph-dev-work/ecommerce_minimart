import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store } from '../../entities/store.entity';
import { Order } from '../../entities/order.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Store, Order])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}

