import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll() {
    const data = await this.settingsService.findAll();
    return { success: true, data };
  }

  @Get(':key')
  async findOne(@Param('key') key: string) {
    const data = await this.settingsService.findOne(key);
    return { success: true, data };
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() updateDto: UpdateSettingDto) {
    const data = await this.settingsService.update(key, updateDto.value);
    return { success: true, data };
  }
}

