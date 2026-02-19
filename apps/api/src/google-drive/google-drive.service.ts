// apps/api/src/google-drive/google-drive.service.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decrypt } from '../common/crypto/encryption.util.js';
import {
  GoogleFatalError,
  GoogleQuotaError,
  GoogleRetryableError,
} from './google-drive.errors.js';
import {
  GoogleFile,
  ListResponse,
  TokenResponse,
} from './google-drive.types.js';

type AccessTokenCacheEntry = {
  accessToken: string;
  expiresAt: number;
};

@Injectable()
export class GoogleDriveService {
  private readonly tokenCache = new Map<string, AccessTokenCacheEntry>();
  private readonly refreshMutex = new Map<string, Promise<string>>();

  constructor(private readonly config: ConfigService) {}

  // ==============================
  // PUBLIC METHODS
  // ==============================
  clearAccountCache(accountId: string): void {
    this.tokenCache.delete(accountId);
    this.refreshMutex.delete(accountId);
  }

  async listChildren(
    accountId: string,
    refreshTokenEncrypted: string,
    parentId: string,
  ): Promise<GoogleFile[]> {
    const files: GoogleFile[] = [];
    let pageToken: string | undefined;

    do {
      const query = new URLSearchParams({
        q: `'${parentId}' in parents and trashed = false`,
        fields:
          'nextPageToken, files(id, name, mimeType, parents, size, md5Checksum)',
        pageSize: '1000',
        ...(pageToken ? { pageToken } : {}),
      });

      const response = await this.request<ListResponse>(
        accountId,
        refreshTokenEncrypted,
        `https://www.googleapis.com/drive/v3/files?${query.toString()}`,
        {
          method: 'GET',
        },
      );

      files.push(...response.files);
      pageToken = response.nextPageToken;
    } while (pageToken);

    return files;
  }

  async getFile(
    accountId: string,
    refreshTokenEncrypted: string,
    fileId: string,
  ): Promise<GoogleFile> {
    return this.request<GoogleFile>(
      accountId,
      refreshTokenEncrypted,
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,parents,size,md5Checksum`,
      { method: 'GET' },
    );
  }

  async copyFile(
    accountId: string,
    refreshTokenEncrypted: string,
    fileId: string,
    destinationFolderId: string,
  ): Promise<GoogleFile> {
    return this.request<GoogleFile>(
      accountId,
      refreshTokenEncrypted,
      `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parents: [destinationFolderId],
        }),
      },
    );
  }

  async moveFile(
    accountId: string,
    refreshTokenEncrypted: string,
    fileId: string,
    newParentId: string,
    previousParents: string[],
  ): Promise<void> {
    await this.request<void>(
      accountId,
      refreshTokenEncrypted,
      `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentId}&removeParents=${previousParents.join(',')}`,
      {
        method: 'PATCH',
      },
    );
  }

  async deleteFile(
    accountId: string,
    refreshTokenEncrypted: string,
    fileId: string,
  ): Promise<void> {
    await this.request<void>(
      accountId,
      refreshTokenEncrypted,
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      { method: 'DELETE' },
    );
  }

  // ==============================
  // CORE REQUEST ENGINE
  // ==============================

  private async request<T>(
    accountId: string,
    refreshTokenEncrypted: string,
    url: string,
    options: RequestInit,
    attempt = 1,
  ): Promise<T> {
    const accessToken = await this.getValidAccessToken(
      accountId,
      refreshTokenEncrypted,
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });

      if (response.status === 401 && attempt === 1) {
        await this.refreshAccessToken(accountId, refreshTokenEncrypted);
        return this.request<T>(
          accountId,
          refreshTokenEncrypted,
          url,
          options,
          attempt + 1,
        );
      }

      if (!response.ok) {
        await this.handleError(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch {
      if (attempt < 3) {
        const jitter = Math.random() * 100;
        await this.delay(100 * 2 ** attempt + jitter);

        return this.request<T>(
          accountId,
          refreshTokenEncrypted,
          url,
          options,
          attempt + 1,
        );
      }

      throw new GoogleRetryableError('Network failure');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async handleError(response: Response): Promise<never> {
    if (response.status === 429) {
      throw new GoogleQuotaError('Rate limit exceeded', 429);
    }

    if (response.status >= 500) {
      throw new GoogleRetryableError('Google server error', response.status);
    }

    if (response.status === 403) {
      throw new GoogleFatalError('Permission denied', 403);
    }

    if (response.status === 404) {
      throw new GoogleFatalError('File not found', 404);
    }

    throw new GoogleFatalError('Google API error', response.status);
  }

  // ==============================
  // TOKEN MANAGEMENT
  // ==============================

  private async getValidAccessToken(
    accountId: string,
    refreshTokenEncrypted: string,
  ): Promise<string> {
    const cached = this.tokenCache.get(accountId);

    if (cached && cached.expiresAt > Date.now() + 30_000) {
      return cached.accessToken;
    }

    return this.refreshAccessToken(accountId, refreshTokenEncrypted);
  }

  private async refreshAccessToken(
    accountId: string,
    refreshTokenEncrypted: string,
  ): Promise<string> {
    if (this.refreshMutex.has(accountId)) {
      return this.refreshMutex.get(accountId)!;
    }

    const refreshPromise = this.performRefresh(
      accountId,
      refreshTokenEncrypted,
    );

    this.refreshMutex.set(accountId, refreshPromise);

    try {
      return await refreshPromise;
    } finally {
      this.refreshMutex.delete(accountId);
    }
  }

  private async performRefresh(
    accountId: string,
    refreshTokenEncrypted: string,
  ): Promise<string> {
    const encryptionKey = Buffer.from(
      this.config.getOrThrow<string>('ENCRYPTION_KEY'),
      'hex',
    );

    const refreshToken = decrypt(refreshTokenEncrypted, encryptionKey);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new GoogleFatalError('Token refresh failed');
    }

    const data = (await response.json()) as TokenResponse;

    this.tokenCache.set(accountId, {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return data.access_token;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
