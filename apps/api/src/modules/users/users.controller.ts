import {
  Controller,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
  Body,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole, UserStatus } from '../../entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    const result = await this.usersService.findAll(page, limit, search, role, status);
    return {
      success: true,
      data: {
        users: result.data,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { success: true, data };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    const data = await this.usersService.updateStatus(id, dto.status);
    return { success: true, data };
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body('password') password: string) {
    await this.usersService.resetPassword(id, password);
    return { success: true, message: 'Password reset successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true, message: 'User deleted successfully' };
  }
}

