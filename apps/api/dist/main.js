import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, new FastifyAdapter(), { bufferLogs: true });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useLogger(app.get(Logger));
    const configService = app.get(ConfigService);
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    await app.listen({
        port: configService.getOrThrow('PORT'),
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
