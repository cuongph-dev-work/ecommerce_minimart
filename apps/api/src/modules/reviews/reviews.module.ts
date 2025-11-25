import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReviewsService } from './reviews.service';
import { ReviewsController, PublicReviewsController } from './reviews.controller';
import { Review } from '../../entities/review.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Review, Product, User])],
  controllers: [ReviewsController, PublicReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

