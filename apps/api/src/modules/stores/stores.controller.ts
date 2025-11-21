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
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { OrderStatus } from '../../entities/order.entity';

@Controller('admin/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto) {
    const data = await this.storesService.create(createStoreDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: QueryStoreDto) {
    const result = await this.storesService.findAll(query);
    return {
      success: true,
      data: {
        stores: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.storesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    const data = await this.storesService.update(id, updateStoreDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.storesService.remove(id);
    return { success: true, message: 'Store deleted successfully' };
  }

  @Get(':id/orders')
  async getStoreOrders(
    @Param('id') id: string,
    @Query('status') status?: OrderStatus,
  ) {
    const data = await this.storesService.getStoreOrders(id, status);
    return { success: true, data };
  }
}

