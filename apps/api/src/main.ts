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
  await app.register(cookie, {
    secret: process.env.JWT_SECRET,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await app.listen({
    port: configService.getOrThrow<number>('PORT'),
    host: '0.0.0.0',
  });
  // ✅ Ensure Fastify is fully ready
  await app.getHttpAdapter().getInstance().ready();
}

// ✅ Proper top-level promise handling (fixes no-floating-promises)
bootstrap().catch((err) => {
  console.error('❌ Application failed to start', err);
  process.exit(1);
});
