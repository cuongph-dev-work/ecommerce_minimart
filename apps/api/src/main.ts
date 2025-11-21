import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');
  
  // Enable CORS
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Serve static files (uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 API server is running on: http://localhost:${port}`);
  console.log(`📚 API docs (when enabled): http://localhost:${port}/api/docs`);
}

bootstrap();
