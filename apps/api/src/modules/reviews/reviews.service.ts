import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Review, ReviewStatus } from '../../entities/review.entity';
import { Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(private readonly em: EntityManager) {}

  async create(createDto: CreateReviewDto): Promise<Review> {
    const product = await this.em.findOne(Product, { id: createDto.productId, deletedAt: null });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let user: User | undefined;
    if (createDto.userId) {
      user = await this.em.findOne(User, { id: createDto.userId, deletedAt: null });
    }

    const review = this.em.create(Review, {
      product,
      user,
      userName: createDto.userName,
      rating: createDto.rating,
      comment: createDto.comment,
    });

    await this.em.persistAndFlush(review);

    // Update product rating
    await this.updateProductRating(createDto.productId);

    return review;
  }

  async findAll(query: QueryReviewDto) {
    const { page = 1, limit = 20, productId, rating, status } = query;

    const where: any = {};

    if (productId) {
      where.product = productId;
    }

    if (rating) {
      where.rating = rating;
    }

    if (status) {
      where.status = status;
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      where.$or = [
        { userName: { $ilike: `%${search}%` } },
        { comment: { $ilike: `%${search}%` } },
        { product: { name: { $ilike: `%${search}%` } } },
      ];
    }

    const offset = (page - 1) * limit;

    const [reviews, total] = await this.em.findAndCount(Review, where, {
      populate: ['product', 'user'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return createPaginatedResponse(reviews, page, limit, total);
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.em.findOne(Review, { id }, {
      populate: ['product', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async approve(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.APPROVED;
    await this.em.flush();
    return review;
  }

  async hide(id: string): Promise<Review> {
    const review = await this.findOne(id);
    review.status = ReviewStatus.HIDDEN;
    await this.em.flush();
    return review;
  }

  async reply(id: string, replyText: string): Promise<Review> {
    const review = await this.findOne(id);
    review.adminResponse = replyText;
    await this.em.flush();
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    const productId = review.product.id;
    await this.em.removeAndFlush(review);
    
    // Update product rating
    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.em.find(Review, {
      product: productId,
      status: ReviewStatus.APPROVED,
    });

    const product = await this.em.findOne(Product, { id: productId, deletedAt: null });
    if (!product) return;

    if (reviews.length === 0) {
      product.rating = 0;
      product.reviewCount = 0;
    } else {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / reviews.length;
      product.reviewCount = reviews.length;
    }

    await this.em.flush();
  }
}

