import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
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
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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

    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: {},
      create: {
        email: profile.email,
      },
    });

    return user;
  }

  signJwt(userId: string): string {
    return this.jwt.sign({
      sub: userId,
    });
  }
}
