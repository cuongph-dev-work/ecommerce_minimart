import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AddContactDto } from './dto/add-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { OrderStatus } from '../../entities/order.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.ordersService.findAll(page, limit, search, status, startDate, endDate);
    return {
      success: true,
      data: {
        orders: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return { success: true, data };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.updateStatus(id, dto.status, dto.notes || '', user.id);
    return { success: true, data };
  }

  @Put(':id/payment')
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    try {
      const data = await this.ordersService.updatePayment(id, dto, user.id);
      return { success: true, data };
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  @Post(':id/contact')
  async addContact(
    @Param('id') id: string,
    @Body() dto: AddContactDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.ordersService.addContact(id, dto.type, dto.note, user.id);
    return { success: true, data };
  }
}

@Controller('orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  async create(@Body() createDto: CreateOrderDto) {
    const order = await this.ordersService.create(createDto);
    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
      },
      message: 'Đơn hàng đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
    };
  }

  @Public()
  @Get('track')
  async trackOrder(
    @Query('orderNumber') orderNumber: string,
    @Query('phone') phone: string,
  ) {
    if (!orderNumber || !phone) {
      throw new BadRequestException('Vui lòng cung cấp mã đơn hàng và số điện thoại');
    }

    const order = await this.ordersService.trackOrder(orderNumber, phone);
    return {
      success: true,
      data: order,
    };
  }
}

