import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { JwtGuard } from './jwt.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  google(@Res({ passthrough: false }) res: FastifyReply) {
    const state = randomUUID();

    res.setCookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    });

    const url = this.auth.buildGoogleAuthUrl(state);

    res.status(302).redirect(url);
  }

  @Get('google/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    const cookieState = (req.cookies as Record<string, string> | undefined)
      ?.oauth_state;

    if (!state || state !== cookieState) {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (!code) {
      throw new BadRequestException('Missing code');
    }

    const user = await this.auth.handleGoogleCallback(code);

    const jwt = this.auth.signJwt(user.id);

    const isProd = process.env.NODE_ENV === 'production';

    res.setCookie('access_token', jwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    res.clearCookie('oauth_state', {
      path: '/',
      secure: isProd,
      sameSite: 'lax',
    });

    return res
      .status(302)
      .redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: FastifyRequest) {
    return {
      user: req.user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: false }) res: FastifyReply) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });

    return res.status(200).send({ success: true });
  }
}
