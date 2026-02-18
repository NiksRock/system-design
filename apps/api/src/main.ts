import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // Bind structured logger first
  app.useLogger(logger);

  // Secure cookie secret
  await app.register(cookie, {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter (structured logging)
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // CORS
  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  // Security headers
  await app.register(helmet);

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });

  await app.listen({
    port: configService.getOrThrow<number>('PORT'),
    host: '0.0.0.0',
  });

  // Ensure Fastify ready
  await app.getHttpAdapter().getInstance().ready();
}

bootstrap().catch((err) => {
  console.error('❌ Application failed to start', err);
  process.exit(1);
});
