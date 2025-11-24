import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoriesService } from './categories.service';
import { CategoriesController, PublicCategoriesController } from './categories.controller';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Category])],
  controllers: [CategoriesController, PublicCategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

