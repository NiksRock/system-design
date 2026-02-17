import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { AuthService } from './auth.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './jwt.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  google(@Res() res: FastifyReply) {
    const state = randomUUID();

    res.setCookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300,
    });

    const url = this.auth.buildGoogleAuthUrl(state);

    return res.redirect(url);
  }

  @Get('google/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const cookieState = (req.cookies as Record<string, string>)?.oauth_state;

    if (!state || state !== cookieState) {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    if (!code) {
      throw new UnauthorizedException('Missing code');
    }

    const user = await this.auth.handleGoogleCallback(code);

    const jwt = this.auth.signJwt(user.id);

    res.setCookie('access_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('oauth_state');

    return res.redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: FastifyRequest) {
    return {
      user: req.user,
    };
  }

  @Get('logout')
  logout(@Res() res: FastifyReply) {
    res.clearCookie('access_token', { path: '/' });
    return res.send({ success: true });
  }
}
