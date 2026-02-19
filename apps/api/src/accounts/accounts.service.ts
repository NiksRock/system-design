import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransferStatus } from '@prisma/client';
import { GoogleDriveService } from '../google-drive/google-drive.service.js';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDrive: GoogleDriveService,
  ) {}

  async disconnectAccount(accountId: string, userId: string) {
    return this.prisma
      .$transaction(async (tx) => {
        const account = await tx.googleAccount.findUnique({
          where: { id: accountId },
        });

        if (!account || account.userId !== userId) {
          throw new NotFoundException('Account not found');
        }

        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            primarySourceAccountId: true,
            destinationAccountId: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.primarySourceAccountId === accountId) {
          throw new ForbiddenException(
            'Cannot disconnect primary source account',
          );
        }

        const activeTransfer = await tx.transferJob.findFirst({
          where: {
            userId,
            OR: [
              { sourceAccountId: accountId },
              { destinationAccountId: accountId },
            ],
            status: {
              in: [
                TransferStatus.PENDING,
                TransferStatus.RUNNING,
                TransferStatus.PAUSED,
                TransferStatus.AUTO_PAUSED_QUOTA,
              ],
            },
          },
          select: { id: true },
        });

        if (activeTransfer) {
          throw new ForbiddenException(
            'Cannot disconnect account with active transfers',
          );
        }

        await tx.googleAccount.delete({
          where: { id: accountId },
        });

        return { success: true };
      })
      .then((result) => {
        this.googleDrive.clearAccountCache(accountId);
        return result;
      });
  }
}
