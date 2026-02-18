// apps/api/src/transfers/prescan/prescan.module.ts

import { Module } from '@nestjs/common';
import { PreScanService } from './prescan.service.js';
import { GoogleDriveModule } from '../../google-drive/google-drive.module.js';

@Module({
  imports: [GoogleDriveModule],
  providers: [PreScanService],
  exports: [PreScanService],
})
export class PreScanModule {}
