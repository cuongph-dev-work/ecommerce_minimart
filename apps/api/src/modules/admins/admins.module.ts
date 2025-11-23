import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { User } from '../../entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}

