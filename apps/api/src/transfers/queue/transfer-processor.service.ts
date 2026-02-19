// src/transfers/queue/transfer-processor.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TransferStatus } from '@prisma/client';

@Injectable()
export class TransferProcessorService {
  constructor(private readonly prisma: PrismaService) {}

  async process(jobId: string): Promise<void> {
    const updated = await this.prisma.transferJob.updateMany({
      where: {
        id: jobId,
         status: { in: [TransferStatus.PENDING, TransferStatus.RUNNING] }
      },
      data: {
        status: TransferStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return;
    }

    // Placeholder

    await this.prisma.transferJob.update({
      where: { id: jobId },
      data: {
        status: TransferStatus.COMPLETED,
        finishedAt: new Date(),
      },
    });
  }
}
