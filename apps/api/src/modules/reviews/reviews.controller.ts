import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { ReviewStatus } from '../../entities/review.entity';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(@Query() query: QueryReviewDto) {
    const result = await this.reviewsService.findAll(query);
    return {
      success: true,
      data: {
        reviews: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.reviewsService.findOne(id);
    return { success: true, data };
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    const data = await this.reviewsService.approve(id);
    return { success: true, data };
  }

  @Put(':id/hide')
  async hide(@Param('id') id: string) {
    const data = await this.reviewsService.hide(id);
    return { success: true, data };
  }

  @Post(':id/reply')
  async reply(@Param('id') id: string, @Body() replyDto: ReplyReviewDto) {
    const data = await this.reviewsService.reply(id, replyDto.reply);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
    return { success: true, message: 'Review deleted successfully' };
  }
}

@Controller('reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryReviewDto) {
    // Show all reviews except HIDDEN ones - admin can delete/hide if needed
    // Reviews are now auto-visible, no need for approval
    const publicQuery = {
      ...query,
      // Don't filter by status - show PENDING and APPROVED
      status: undefined,
    };
    const result = await this.reviewsService.findAll(publicQuery);
    // Filter out HIDDEN reviews (deleted by admin)
    const visibleReviews = result.data.filter(review => review.status !== ReviewStatus.HIDDEN);
    return {
      success: true,
      data: {
        reviews: visibleReviews,
        pagination: result.pagination,
      },
    };
  }

  @Public()
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    // Show all reviews except HIDDEN ones - admin can delete/hide if needed
    // Reviews are now auto-visible, no need for approval
    const result = await this.reviewsService.findAll({
      productId,
      // Don't filter by status - show PENDING and APPROVED
      // HIDDEN reviews are excluded in the service
      page: page || 1,
      limit: limit || 20,
    });
    // Filter out HIDDEN reviews (deleted by admin)
    const visibleReviews = result.data.filter(review => review.status !== ReviewStatus.HIDDEN);
    return {
      success: true,
      data: {
        reviews: visibleReviews,
        pagination: result.pagination, // Keep original pagination
      },
    };
  }

  @Public()
  @Post()
  async create(@Body() createDto: CreateReviewDto) {
    const data = await this.reviewsService.create(createDto);
    return { success: true, data };
  }
}

