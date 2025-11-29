import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { BatchUpdateSettingsDto } from './dto/batch-update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

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
    this.validateSettingValue(key, updateDto.value);
    const data = await this.settingsService.update(key, updateDto.value);
    return { success: true, data };
  }

  @Patch(':key')
  async patch(@Param('key') key: string, @Body() updateDto: UpdateSettingDto) {
    this.validateSettingValue(key, updateDto.value);
    const data = await this.settingsService.update(key, updateDto.value);
    return { success: true, data };
  }

  @Post('batch')
  async batchUpdate(@Body() batchDto: BatchUpdateSettingsDto) {
    // Validate all settings before updating
    for (const [key, value] of Object.entries(batchDto.settings)) {
      this.validateSettingValue(key, value);
    }

    const data = await this.settingsService.batchUpdate(batchDto.settings);
    return { success: true, data };
  }

  private validateSettingValue(key: string, value: string): void {
    // Allow empty string for optional fields
    if (!value || value.trim() === '') {
      // For required fields, check if empty is allowed
      const requiredFields = ['store_name', 'store_phone', 'store_email', 'store_address'];
      if (requiredFields.includes(key)) {
        throw new BadRequestException(`${key} không được để trống`);
      }
      // For optional fields, empty string is allowed
      return;
    }
    
    const trimmedValue = value.trim();

    switch (key) {
      case 'store_name':
        if (!trimmedValue) {
          throw new BadRequestException('Tên cửa hàng không được để trống');
        }
        if (trimmedValue.length > 200) {
          throw new BadRequestException('Tên cửa hàng không được vượt quá 200 ký tự');
        }
        break;

      case 'store_logo':
        if (trimmedValue && !this.isValidUrl(trimmedValue)) {
          throw new BadRequestException('URL logo không hợp lệ');
        }
        break;

      case 'store_phone':
        if (!trimmedValue) {
          throw new BadRequestException('Số điện thoại không được để trống');
        }
        if (!/^[0-9\s\-()]+$/.test(trimmedValue)) {
          throw new BadRequestException('Số điện thoại không hợp lệ');
        }
        break;

      case 'store_email':
        if (!trimmedValue) {
          throw new BadRequestException('Email không được để trống');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          throw new BadRequestException('Email không hợp lệ');
        }
        break;

      case 'store_address':
        if (!trimmedValue) {
          throw new BadRequestException('Địa chỉ không được để trống');
        }
        if (trimmedValue.length > 500) {
          throw new BadRequestException('Địa chỉ không được vượt quá 500 ký tự');
        }
        break;

      case 'store_description':
        if (trimmedValue.length > 1000) {
          throw new BadRequestException('Mô tả không được vượt quá 1000 ký tự');
        }
        break;

      case 'facebook_link':
      case 'instagram_link':
      case 'telegram_link':
      case 'youtube_link':
        if (trimmedValue && !this.isValidUrl(trimmedValue)) {
          throw new BadRequestException(`Link ${key.replace('_link', '')} không hợp lệ`);
        }
        break;

      case 'bank_account':
        if (trimmedValue && trimmedValue.length > 50) {
          throw new BadRequestException('Số tài khoản không được vượt quá 50 ký tự');
        }
        break;

      case 'account_name':
      case 'bank_name':
      case 'bank_branch':
        if (trimmedValue && trimmedValue.length > 200) {
          throw new BadRequestException(`${key} không được vượt quá 200 ký tự`);
        }
        break;

      case 'transfer_note':
        if (trimmedValue && trimmedValue.length > 200) {
          throw new BadRequestException('Nội dung chuyển khoản không được vượt quá 200 ký tự');
        }
        break;

      case 'warranty_policy':
      case 'return_policy':
      case 'shopping_guide':
      case 'faq':
        if (trimmedValue && trimmedValue.length > 5000) {
          throw new BadRequestException(`${key} không được vượt quá 5000 ký tự`);
        }
        break;

      // SEO Settings - Global
      case 'seo_default_title':
      case 'seo_title_template':
        if (trimmedValue && trimmedValue.length > 200) {
          throw new BadRequestException(`${key} không được vượt quá 200 ký tự`);
        }
        break;

      case 'seo_default_description':
      case 'seo_home_description':
      case 'seo_products_description':
      case 'seo_contact_description':
      case 'seo_stores_description':
        if (trimmedValue && trimmedValue.length > 500) {
          throw new BadRequestException(`${key} không được vượt quá 500 ký tự`);
        }
        break;

      case 'seo_keywords':
      case 'seo_home_keywords':
      case 'seo_products_keywords':
      case 'seo_contact_keywords':
      case 'seo_stores_keywords':
        if (trimmedValue && trimmedValue.length > 500) {
          throw new BadRequestException(`${key} không được vượt quá 500 ký tự`);
        }
        break;

      case 'seo_author':
      case 'seo_creator':
      case 'seo_publisher':
        if (trimmedValue && trimmedValue.length > 200) {
          throw new BadRequestException(`${key} không được vượt quá 200 ký tự`);
        }
        break;

      case 'seo_twitter_handle':
        if (trimmedValue && !/^@?[a-zA-Z0-9_]{1,15}$/.test(trimmedValue.replace('@', ''))) {
          throw new BadRequestException('Twitter handle không hợp lệ (tối đa 15 ký tự, chỉ chữ, số và dấu gạch dưới)');
        }
        break;

      case 'seo_google_verification':
        if (trimmedValue && trimmedValue.length > 100) {
          throw new BadRequestException('Google verification code không được vượt quá 100 ký tự');
        }
        break;

      case 'seo_home_title':
      case 'seo_products_title':
      case 'seo_contact_title':
      case 'seo_stores_title':
        if (trimmedValue && trimmedValue.length > 200) {
          throw new BadRequestException(`${key} không được vượt quá 200 ký tự`);
        }
        break;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async findAll() {
    const data = await this.settingsService.findAll();
    return { success: true, data };
  }

  @Public()
  @Get(':key')
  async findOne(@Param('key') key: string) {
    const data = await this.settingsService.findOne(key);
    return { success: true, data };
  }
}

