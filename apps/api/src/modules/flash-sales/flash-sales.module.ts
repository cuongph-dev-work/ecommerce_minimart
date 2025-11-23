import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FlashSalesService } from './flash-sales.service';
import { FlashSalesController } from './flash-sales.controller';
import { FlashSalesScheduler } from './flash-sales.scheduler';
import { FlashSale } from '../../entities/flash-sale.entity';
import { FlashSaleProduct } from '../../entities/flash-sale-product.entity';
import { Product } from '../../entities/product.entity';

@Module({
  imports: [MikroOrmModule.forFeature([FlashSale, FlashSaleProduct, Product])],
  controllers: [FlashSalesController],
  providers: [FlashSalesService, FlashSalesScheduler],
  exports: [FlashSalesService],
})
export class FlashSalesModule {}

