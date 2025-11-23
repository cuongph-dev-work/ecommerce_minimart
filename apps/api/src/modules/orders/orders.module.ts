import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrdersService } from './orders.service';
import { OrdersController, PublicOrdersController } from './orders.controller';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { ContactHistory } from '../../entities/contact-history.entity';
import { Product } from '../../entities/product.entity';
import { Store } from '../../entities/store.entity';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Order, OrderItem, ContactHistory, Product, Store]),
    VouchersModule,
  ],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

