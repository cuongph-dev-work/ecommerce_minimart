import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    const data = await this.dashboardService.getStats();
    return { success: true, data };
  }

  @Get('top-products')
  async getTopProducts(@Query('limit') limit?: number) {
    const data = await this.dashboardService.getTopProducts(limit);
    return { success: true, data };
  }

  @Get('recent-orders')
  async getRecentOrders(@Query('limit') limit?: number) {
    const data = await this.dashboardService.getRecentOrders(limit);
    return { success: true, data };
  }
}

