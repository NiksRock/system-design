import {
  BadRequestException,
  Body,
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
import { SetDestinationDto } from './dto/set-destination.dto.js';

type OAuthIntent = 'primary' | 'destination';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  // =====================================
  // GOOGLE LOGIN (Primary or Destination)
  // =====================================
  @Get('google')
  async google(
    @Query('intent') intent: OAuthIntent | undefined,
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    const isProd = this.config.getOrThrow<string>('NODE_ENV') === 'production';

    const statePayload: {
      csrf: string;
      intent: OAuthIntent;
      userId?: string;
    } = {
      csrf: randomUUID(),
      intent: intent ?? 'primary',
    };

    // 🔐 Require JWT only for destination
    if (statePayload.intent === 'destination') {
      const token =
        req.cookies?.access_token ||
        req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new BadRequestException(
          'Authentication required to add destination',
        );
      }

      try {
        const payload = await this.auth.verifyJwt(token);
        statePayload.userId = payload.sub;
      } catch {
        throw new BadRequestException(
          'Authentication required to add destination',
        );
      }
    }

    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64');

    res.setCookie('oauth_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 300,
    });

    const url = this.auth.buildGoogleAuthUrl(state);

    return res.status(302).redirect(url);
  }

  // =====================================
  // GOOGLE CALLBACK
  // =====================================
  @Get('google/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    const cookieState = (req.cookies as Record<string, string> | undefined)
      ?.oauth_state;

    if (!cookieState) {
      throw new BadRequestException('Missing OAuth state cookie');
    }

    if (!state) {
      throw new BadRequestException('Missing OAuth state');
    }

    let decoded: { csrf: string; intent: OAuthIntent; userId?: string };

    try {
      decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (state !== cookieState) {
        throw new BadRequestException('Invalid OAuth state');
      }

      if (!decoded.csrf || !decoded.intent) {
        throw new BadRequestException('Malformed OAuth state');
      }

      if (decoded.intent === 'destination' && !decoded.userId) {
        throw new BadRequestException('Invalid destination flow state');
      }
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (state !== cookieState || !decoded.csrf) {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (!code) {
      throw new BadRequestException('Missing code');
    }

    const user = await this.auth.handleGoogleCallback(
      code,
      decoded.intent,
      decoded.userId,
    );

    const jwt = this.auth.signJwt(user.id);

    const isProd = this.config.getOrThrow<string>('NODE_ENV') === 'production';

    res.setCookie('access_token', jwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    res.clearCookie('oauth_state', {
      path: '/',
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
    });

    return res
      .status(302)
      .redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
  }

  // =====================================
  // MANUAL DESTINATION SET (existing flow)
  // =====================================
  @UseGuards(JwtGuard)
  @Post('set-destination')
  async setDestination(
    @Body() dto: SetDestinationDto,
    @Req() req: FastifyRequest,
  ) {
    return this.auth.setDestination(req.user!.sub, dto.accountId);
  }

  // =====================================
  // CURRENT USER
  // =====================================
  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: FastifyRequest) {
    return {
      user: req.user,
    };
  }

  // =====================================
  // LOGOUT
  // =====================================
  @Post('logout')
  logout(@Res({ passthrough: false }) res: FastifyReply) {
    const isProd = this.config.getOrThrow<string>('NODE_ENV') === 'production';

    res.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
    });

    return res.status(200).send({ success: true });
  }
}
