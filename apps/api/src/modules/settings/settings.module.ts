import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from '../../entities/setting.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Setting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

