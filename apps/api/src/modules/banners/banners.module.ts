import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BannersService } from './banners.service';
import { BannersController, PublicBannersController } from './banners.controller';
import { Banner } from '../../entities/banner.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Banner])],
  controllers: [BannersController, PublicBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}

