import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { AddFlashSaleProductDto } from './dto/add-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('admin/flash-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Post()
  async create(@Body() createDto: CreateFlashSaleDto) {
    const data = await this.flashSalesService.create(createDto);
    return { success: true, data };
  }

  @Get()
  async findAll() {
    const data = await this.flashSalesService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.flashSalesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateFlashSaleDto) {
    const data = await this.flashSalesService.update(id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.flashSalesService.remove(id);
    return { success: true, message: 'Flash sale deleted successfully' };
  }

  @Post(':id/products')
  async addProduct(@Param('id') id: string, @Body() addProductDto: AddFlashSaleProductDto) {
    const data = await this.flashSalesService.addProduct(id, addProductDto);
    return { success: true, data };
  }

  @Put(':id/products/:productId')
  async updateProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() updateDto: Partial<AddFlashSaleProductDto>,
  ) {
    const data = await this.flashSalesService.updateProduct(id, productId, updateDto);
    return { success: true, data };
  }

  @Delete(':id/products/:productId')
  async removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    await this.flashSalesService.removeProduct(id, productId);
    return { success: true, message: 'Product removed from flash sale' };
  }
}

