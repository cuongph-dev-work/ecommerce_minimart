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
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin/vouchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    const data = await this.vouchersService.create(createVoucherDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: QueryVoucherDto) {
    const result = await this.vouchersService.findAll(query);
    return {
      success: true,
      data: {
        vouchers: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.vouchersService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    const data = await this.vouchersService.update(id, updateVoucherDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vouchersService.remove(id);
    return { success: true, message: 'Voucher deleted successfully' };
  }
}

@Controller('vouchers')
export class PublicVouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Public()
  @Post('validate')
  async validate(@Body() validateDto: ValidateVoucherDto) {
    const data = await this.vouchersService.validate(validateDto);
    return { success: true, data };
  }
}

