import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        user: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        dbName: configService.get<string>('database.name'),
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],
        debug: process.env.NODE_ENV === 'development',
        migrations: {
          path: 'dist/database/migrations',
          pathTs: 'src/database/migrations',
        },
      }),
    }),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}

