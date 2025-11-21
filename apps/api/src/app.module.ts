import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UploadModule } from './modules/upload/upload.module';
import { StoresModule } from './modules/stores/stores.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { BannersModule } from './modules/banners/banners.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import uploadConfig from './config/upload.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, uploadConfig, redisConfig],
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    UploadModule,
    StoresModule,
    VouchersModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
