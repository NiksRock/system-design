import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { encrypt } from '../common/crypto/encryption.util.js';

type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  picture?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  buildGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      redirect_uri: this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(code: string) {
    const tokenRes = await this.fetchWithTimeout(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
          client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
          grant_type: 'authorization_code',
        }),
      },
    );

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    const profileRes = await this.fetchWithTimeout(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!profileRes.ok) {
      throw new UnauthorizedException('Google profile fetch failed');
    }

    const profile = (await profileRes.json()) as GoogleUserInfo;

    if (!profile.email || !profile.email_verified) {
      throw new UnauthorizedException('Unverified Google account');
    }

    const encryptionKey = Buffer.from(
      this.config.getOrThrow<string>('ENCRYPTION_KEY'),
      'hex',
    );

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: profile.email },
        update: {},
        create: { email: profile.email },
      });

      const existingAccount = await tx.googleAccount.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email: profile.email,
          },
        },
      });

      let encryptedRefresh: string;

      if (tokenData.refresh_token) {
        encryptedRefresh = encrypt(tokenData.refresh_token, encryptionKey);
      } else {
        if (!existingAccount) {
          throw new UnauthorizedException(
            'No refresh token returned and account does not exist',
          );
        }

        encryptedRefresh = existingAccount.refreshTokenEncrypted;
      }

      const googleAccount = await tx.googleAccount.upsert({
        where: {
          userId_email: {
            userId: user.id,
            email: profile.email,
          },
        },
        update: {
          avatarUrl: profile.picture ?? null,
          refreshTokenEncrypted: encryptedRefresh,
        },
        create: {
          userId: user.id,
          email: profile.email,
          avatarUrl: profile.picture ?? null,
          refreshTokenEncrypted: encryptedRefresh,
        },
      });

      // ✅ PRIMARY SOURCE ENFORCEMENT (TC-A6)
      await tx.user.update({
        where: { id: user.id },
        data: {
          primarySourceAccountId: googleAccount.id,
        },
      });

      return user;
    });
  }
  async setDestination(userId: string, accountId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Verify account exists + belongs to user
      const account = await tx.googleAccount.findUnique({
        where: { id: accountId },
        select: { id: true, userId: true },
      });

      if (!account || account.userId !== userId) {
        throw new ForbiddenException('Invalid account');
      }

      // 2️⃣ Fetch user
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { primarySourceAccountId: true },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // 3️⃣ Cannot set primary source as destination
      if (user.primarySourceAccountId === accountId) {
        throw new ForbiddenException('Primary source cannot be destination');
      }

      // 4️⃣ Update destination (overwrites previous automatically)
      await tx.user.update({
        where: { id: userId },
        data: {
          destinationAccountId: accountId,
        },
      });

      return { success: true };
    });
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = 5000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  signJwt(userId: string): string {
    return this.jwt.sign({
      sub: userId,
    });
  }
}
