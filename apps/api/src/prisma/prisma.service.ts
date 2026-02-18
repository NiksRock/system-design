import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    const adapter = new PrismaPg(pool);

    // 🔥 CRITICAL FIX: pass adapter AND explicitly preserve types
    super({
      adapter,
    } as ConstructorParameters<typeof PrismaClient>[0]);

    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await super.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await super.$disconnect();
    await this.pool.end();
  }
}
