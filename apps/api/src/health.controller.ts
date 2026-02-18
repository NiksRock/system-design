import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import { RedisService } from './redis/redis.service.js';
import { Logger } from 'nestjs-pino';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly logger: Logger,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    let dbOk = false;
    let redisOk = false;

    try {
      await this.prisma.$executeRaw`SELECT 1`;
      dbOk = true;
    } catch (err) {
      this.logger.error({ err }, 'Health check failed: PostgreSQL unreachable');
    }

    try {
      redisOk = await this.redis.ping();
      if (!redisOk) {
        throw new Error('Redis ping failed');
      }
    } catch (err) {
      this.logger.error({ err }, 'Health check failed: Redis unreachable');
    }

    if (!dbOk || !redisOk) {
      throw new HttpException(
        { status: 'error' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { status: 'ok' };
  }
}
