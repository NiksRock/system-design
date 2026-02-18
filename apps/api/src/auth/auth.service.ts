import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { encrypt } from '../common/crypto/encryption.util.js';

type OAuthIntent = 'primary' | 'destination';

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

  // =====================================
  // BUILD GOOGLE AUTH URL
  // =====================================
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

  async verifyJwt(token: string): Promise<{ sub: string }> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  async handleGoogleCallback(
    code: string,
    intent: OAuthIntent,
    linkingUserId?: string,
  ) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    const profileRes = await fetch(
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
      let user;

      if (intent === 'primary') {
        user = await tx.user.upsert({
          where: { email: profile.email },
          update: {},
          create: { email: profile.email },
        });
      } else {
        // 🔐 DESTINATION FLOW
        if (!linkingUserId) {
          throw new ForbiddenException(
            'Destination linking requires active session',
          );
        }

        user = await tx.user.findUnique({
          where: { id: linkingUserId },
        });

        if (!user) {
          throw new ForbiddenException('User not found');
        }
      }

      // Upsert GoogleAccount under same user
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

      if (intent === 'primary') {
        await tx.user.update({
          where: { id: user.id },
          data: {
            primarySourceAccountId: googleAccount.id,
          },
        });
      }

      if (intent === 'destination') {
        if (user.primarySourceAccountId === googleAccount.id) {
          throw new ForbiddenException('Primary account cannot be destination');
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            destinationAccountId: googleAccount.id,
          },
        });
      }

      return user;
    });
  }

  // =====================================
  // MANUAL DESTINATION SET
  // =====================================
  async setDestination(userId: string, accountId: string) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.googleAccount.findUnique({
        where: { id: accountId },
        select: { id: true, userId: true },
      });

      if (!account || account.userId !== userId) {
        throw new ForbiddenException('Invalid account');
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { primarySourceAccountId: true },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      if (user.primarySourceAccountId === accountId) {
        throw new ForbiddenException('Primary source cannot be destination');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          destinationAccountId: accountId,
        },
      });

      return { success: true };
    });
  }

  // =====================================
  // JWT SIGN
  // =====================================
  signJwt(userId: string): string {
    return this.jwt.sign({
      sub: userId,
    });
  }
}
