import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // CORS — allow all origins for Render deployment
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  app.setGlobalPrefix('api');

  // Serve uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Get Talent API running on port ${port}`);
  console.log(`   DB: ${process.env.DATABASE_URL ? 'PostgreSQL (Render)' : 'NOT CONFIGURED'}`);
  console.log(`   JWT Secret: ${process.env.JWT_SECRET ? 'from env' : 'default (dev only)'}`);
}
bootstrap();
