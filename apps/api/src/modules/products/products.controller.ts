import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { ProductStatus } from '../../entities/product.entity';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.productsService.create(createProductDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: QueryProductDto) {
    const result = await this.productsService.findAll(query);
    return {
      success: true,
      data: {
        products: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const data = await this.productsService.update(id, updateProductDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { success: true, message: 'Product deleted successfully' };
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    const data = await this.productsService.bulkDelete(bulkDeleteDto.ids);
    return { success: true, data, message: `${data.deleted} products deleted` };
  }

  @Post('export')
  async export() {
    const data = await this.productsService.export();
    return { success: true, data };
  }

  @Post('import')
  async import() {
    const data = await this.productsService.import(null);
    return { success: true, data };
  }
}

@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryProductDto) {
    // Only return active products for public
    const publicQuery = {
      ...query,
      status: ProductStatus.ACTIVE,
    };
    const result = await this.productsService.findAll(publicQuery);
    return {
      success: true,
      data: {
        products: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Public()
  @Get('featured')
  async findFeatured(@Query('limit') limit?: number) {
    const result = await this.productsService.findAll({
      featured: true,
      status: ProductStatus.ACTIVE,
      sortBy: 'sold',
      sortOrder: 'desc',
      limit: limit || 5,
      page: 1,
    });
    return { success: true, data: result.data };
  }

  @Public()
  @Get('search/popular')
  async getPopularSearches(@Query('limit') limit?: number) {
    const data = await this.productsService.getPopularSearches(limit || 5);
    return { success: true, data };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    // Only return if product is active
    if (data.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException('Product not found');
    }
    return { success: true, data };
  }
}

