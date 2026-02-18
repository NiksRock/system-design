// apps/api/src/transfers/transfers.module.ts

import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service.js';
import { TransfersController } from './transfers.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PreScanModule } from './prescan/prescan.module.js';
import { TransferQueue } from './queue/transfer.queue.js';
import { TransferWorker } from './queue/transfer.worker.js';
import { TransferProcessorService } from './queue/transfer-processor.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, PreScanModule, AuthModule],
  providers: [
    TransfersService,
    TransferQueue,
    TransferWorker,
    TransferProcessorService,
  ],
  controllers: [TransfersController],
})
export class TransfersModule {}
