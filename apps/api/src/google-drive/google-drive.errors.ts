// apps/api/src/google-drive/google-drive.errors.ts

export abstract class GoogleDriveError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export class GoogleRetryableError extends GoogleDriveError {}

export class GoogleFatalError extends GoogleDriveError {}

export class GoogleQuotaError extends GoogleDriveError {}
