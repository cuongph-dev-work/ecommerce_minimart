import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return { success: true, data };
  }

  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, updateCategoryDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { success: true, message: 'Category deleted successfully' };
  }

  @Put('reorder')
  async reorder(@Body() reorderDto: ReorderCategoriesDto) {
    await this.categoriesService.reorder(reorderDto.categories);
    return { success: true, message: 'Categories reordered successfully' };
  }
}

@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { success: true, data };
  }

  @Public()
  @Get('top-by-sales')
  async findTopBySales(@Query('limit') limit?: number) {
    const data = await this.categoriesService.findTopBySales(limit || 3);
    return { success: true, data };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { success: true, data };
  }
}

