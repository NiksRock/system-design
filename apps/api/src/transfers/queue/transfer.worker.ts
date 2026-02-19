import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import { TransferProcessorService } from './transfer-processor.service.js';

@Injectable()
export class TransferWorker implements OnModuleInit, OnModuleDestroy {
  private worker!: Worker;

  constructor(
    private readonly config: ConfigService,
    private readonly processor: TransferProcessorService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.worker = new Worker(
      'transfer-queue',
      async (job) => {
        const { jobId } = job.data as { jobId: string };
        await this.processor.process(jobId);
      },
      {
        connection: {
          url: this.config.getOrThrow<string>('REDIS_URL'),
        },
        concurrency: 3,
      },
    );
    this.worker.on('error', (err) => {
      console.error('Transfer worker error', err);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed`, err);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }
}
