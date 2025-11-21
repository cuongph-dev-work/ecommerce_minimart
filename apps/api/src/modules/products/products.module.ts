import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Product, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

