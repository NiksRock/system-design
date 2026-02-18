// src/transfers/queue/transfer-processor.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TransferStatus } from '@prisma/client';

@Injectable()
export class TransferProcessorService {
  constructor(private readonly prisma: PrismaService) {}

  async process(jobId: string): Promise<void> {
    const job = await this.prisma.transferJob.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return;
    }

    if (job.status !== TransferStatus.PENDING) {
      return;
    }

    await this.prisma.transferJob.update({
      where: { id: jobId },
      data: {
        status: TransferStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    // Placeholder until TransferItem processor implemented

    await this.prisma.transferJob.update({
      where: { id: jobId },
      data: {
        status: TransferStatus.COMPLETED,
        finishedAt: new Date(),
      },
    });
  }
}
