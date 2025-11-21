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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  async create(@Body() createBannerDto: CreateBannerDto) {
    const data = await this.bannersService.create(createBannerDto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: QueryBannerDto) {
    const result = await this.bannersService.findAll(query);
    return {
      success: true,
      data: {
        banners: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    const data = await this.bannersService.update(id, updateBannerDto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return { success: true, message: 'Banner deleted successfully' };
  }
}

