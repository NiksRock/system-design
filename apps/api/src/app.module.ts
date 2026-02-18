import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { baseEnvSchema } from '@repo/config';

import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller.js';
import { HealthController } from './health.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RedisModule } from './redis/redis.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { TransfersModule } from './transfers/transfers.module.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      validate: (config) => baseEnvSchema.parse(config),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { singleLine: true },
              }
            : undefined,
      },
    }),
    AuthModule,
    PrismaModule,
    RedisModule,
    AccountsModule,
    TransfersModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
