import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {
    
  }

  

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: JwtPayload }>();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);

      request.user = payload;

      return true;
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        err.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: FastifyRequest): string | undefined {
    // 1️⃣ Authorization header (Bearer)
    const authHeader = request.headers.authorization;
console.log(request.cookies);
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // 2️⃣ HttpOnly cookie
    return request.cookies?.access_token;
  }
}
