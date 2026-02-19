import { ForbiddenException, Injectable } from '@nestjs/common';
import { GoogleDriveService } from '../../google-drive/google-drive.service.js';
import { GoogleFile } from '../../google-drive/google-drive.types.js';
import { PreScanInput, PreScanResult } from './prescan.types.js';

const MAX_ITEMS = 200_000;
const MAX_DEPTH = 1000;
const MAX_SAFE_BYTES_PER_DAY = 750n * 1024n * 1024n * 1024n;
const MAX_CONCURRENCY = 5;

type QueueNode = {
  file: GoogleFile;
  depth: number;
};

@Injectable()
export class PreScanService {
  constructor(private readonly drive: GoogleDriveService) {}

  async run(input: PreScanInput): Promise<PreScanResult> {
    const { accountId, refreshTokenEncrypted, sourceFileIds } = input;

    let totalItems = 0;
    let totalBytes = 0n;
    let maxDepth = 0;

    const riskFlags: string[] = [];
    const warnings: string[] = [];

    const visited = new Set<string>();
    const queue: QueueNode[] = [];

    // Seed
    const seedFiles = await Promise.all(
      sourceFileIds.map((fileId) =>
        this.drive.getFile(accountId, refreshTokenEncrypted, fileId),
      ),
    );

    for (const file of seedFiles) {
      queue.push({ file, depth: 0 });
    }

    while (queue.length > 0) {
      const batch = queue.splice(0, MAX_CONCURRENCY);

      await Promise.all(
        batch.map(async ({ file, depth }) => {
          if (visited.has(file.id)) {
            riskFlags.push('Recursion detected');
            return;
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

          if (file.mimeType === 'application/vnd.google-apps.folder') {
            const children = await this.drive.listChildren(
              accountId,
              refreshTokenEncrypted,
              file.id,
            );

            for (const child of children) {
              queue.push({ file: child, depth: depth + 1 });
            }
          }
        }),
      );
    }

    if (totalBytes > MAX_SAFE_BYTES_PER_DAY) {
      riskFlags.push('Estimated transfer size exceeds daily safe threshold');
    }

    if (totalItems > 100_000) {
      warnings.push('Large transfer — may take significant time');
    }

    return {
      totalItems,
      totalBytes,
      maxDepth,
      riskFlags,
      warnings,
      canStart: riskFlags.length === 0,
    };
  }
}
