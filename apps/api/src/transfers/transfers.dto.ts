// apps/api/src/transfers/transfers.dto.ts

import { TransferMode } from '@prisma/client';
import { IsArray, IsEnum, IsString } from 'class-validator';

export class CreateTransferDto {
  @IsArray()
  @IsString({ each: true })
  sourceFileIds!: string[];

  @IsString()
  destinationFolderId!: string;

  @IsEnum(TransferMode)
  mode!: TransferMode;
}
