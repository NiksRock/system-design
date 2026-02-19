import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class TransferQueue implements OnModuleDestroy {
  private readonly queue: Queue;

  constructor(private readonly config: ConfigService) {
    this.queue = new Queue('transfer-queue', {
      connection: {
        url: this.config.getOrThrow<string>('REDIS_URL'),
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }

  async enqueue(jobId: string): Promise<void> {
    await this.queue.add('process-transfer', { jobId }, { jobId });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
