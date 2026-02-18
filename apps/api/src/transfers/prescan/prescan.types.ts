// apps/api/src/transfers/prescan/prescan.types.ts

export type PreScanInput = {
  accountId: string;
  refreshTokenEncrypted: string;
  sourceFileIds: string[];
  destinationFolderId: string;
};

export type PreScanResult = {
  totalItems: number;
  totalBytes: bigint;
  maxDepth: number;
  riskFlags: string[];
  warnings: string[];
  canStart: boolean;
};
