// apps/api/src/transfers/prescan/prescan.service.ts

import { ForbiddenException, Injectable } from '@nestjs/common';
import { GoogleDriveService } from '../../google-drive/google-drive.service.js';
import { GoogleFile } from '../../google-drive/google-drive.types.js';
import { PreScanInput, PreScanResult } from './prescan.types.js';

const MAX_ITEMS = 200_000;
const MAX_DEPTH = 1000;
const MAX_SAFE_BYTES_PER_DAY = 750n * 1024n * 1024n * 1024n; // 750 GB

type QueueNode = {
  file: GoogleFile;
  depth: number;
};

@Injectable()
export class PreScanService {
  constructor(private readonly drive: GoogleDriveService) {}

  async run(input: PreScanInput): Promise<PreScanResult> {
    const {
      accountId,
      refreshTokenEncrypted,
      sourceFileIds, 
    } = input;

    let totalItems = 0;
    let totalBytes = 0n;
    let maxDepth = 0;

    const riskFlags: string[] = [];
    const warnings: string[] = [];

    const visited = new Set<string>();
    const queue: QueueNode[] = [];

    // Seed queue
    for (const fileId of sourceFileIds) {
      const file = await this.drive.getFile(
        accountId,
        refreshTokenEncrypted,
        fileId,
      );

      queue.push({ file, depth: 0 });
    }

    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) break;

      const { file, depth } = node;

      if (visited.has(file.id)) {
        riskFlags.push('Recursion detected');
        continue;
      }

      visited.add(file.id);

      totalItems++;
      maxDepth = Math.max(maxDepth, depth);

      if (totalItems > MAX_ITEMS) {
        throw new ForbiddenException(
          `Transfer exceeds maximum allowed items (${MAX_ITEMS})`,
        );
      }

      if (depth > MAX_DEPTH) {
        throw new ForbiddenException(
          `Transfer exceeds maximum depth (${MAX_DEPTH})`,
        );
      }

      if (file.size) {
        totalBytes += BigInt(file.size);
      }

      const isFolder =
        file.mimeType === 'application/vnd.google-apps.folder';

      if (isFolder) {
        const children = await this.drive.listChildren(
          accountId,
          refreshTokenEncrypted,
          file.id,
        );

        for (const child of children) {
          queue.push({ file: child, depth: depth + 1 });
        }
      }
    }

    // Quota risk detection (simple estimation)
    if (totalBytes > MAX_SAFE_BYTES_PER_DAY) {
      riskFlags.push('Estimated transfer size exceeds daily safe threshold');
    }

    if (totalItems > 100_000) {
      warnings.push('Large transfer — may take significant time');
    }

    const canStart = riskFlags.length === 0;

    return {
      totalItems,
      totalBytes,
      maxDepth,
      riskFlags,
      warnings,
      canStart,
    };
  }
}
