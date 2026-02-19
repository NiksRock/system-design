// apps/api/src/transfers/transfers.service.ts

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PreScanService } from './prescan/prescan.service.js';
import { TransferQueue } from './queue/transfer.queue.js';
import { CreateTransferDto } from './transfers.dto.js';

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prescan: PreScanService,
    private readonly queue: TransferQueue,
  ) {}

  /**
   * Creates a transfer job.
   *
   * Guarantees:
   * - Atomic DB write
   * - No nested transactions
   * - Queue enqueue only after commit
   */
  async createTransfer(userId: string, dto: CreateTransferDto) {
    const job = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          primarySourceAccountId: true,
          destinationAccountId: true,
        },
      });

      if (!user?.primarySourceAccountId) {
        throw new ForbiddenException('Primary source account not configured');
      }

      if (!user.destinationAccountId) {
        throw new ForbiddenException('Destination account not configured');
      }

      if (user.primarySourceAccountId === user.destinationAccountId) {
        throw new ForbiddenException(
          'Source and destination cannot be the same account',
        );
      }

      const sourceAccount = await tx.googleAccount.findUnique({
        where: { id: user.primarySourceAccountId },
        select: { id: true, refreshTokenEncrypted: true },
      });

      const destinationAccount = await tx.googleAccount.findUnique({
        where: { id: user.destinationAccountId },
        select: { id: true },
      });

      if (!sourceAccount || !destinationAccount) {
        throw new NotFoundException('Configured accounts not found');
      }

      const prescanResult = await this.prescan.run({
        accountId: sourceAccount.id,
        refreshTokenEncrypted: sourceAccount.refreshTokenEncrypted,
        sourceFileIds: dto.sourceFileIds,
        destinationFolderId: dto.destinationFolderId,
      });

      if (!prescanResult.canStart) {
        throw new ForbiddenException({
          message: 'Pre-scan failed',
          riskFlags: prescanResult.riskFlags,
        });
      }

      return tx.transferJob.create({
        data: {
          userId,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destinationAccount.id,
          destinationFolderId: dto.destinationFolderId,
          mode: dto.mode,
          totalItems: prescanResult.totalItems,
          totalBytes: prescanResult.totalBytes,
          riskFlags: prescanResult.riskFlags,
          warnings: prescanResult.warnings,
        },
        select: {
          id: true,
          status: true,
          totalItems: true,
          totalBytes: true,
          createdAt: true,
        },
      });
    });

    await this.queue.enqueue(job.id);

    return job;
  }

  async listTransfers(userId: string) {
    return this.prisma.transferJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalItems: true,
        completedItems: true,
        failedItems: true,
        transferredBytes: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
      },
    });
  }
}
