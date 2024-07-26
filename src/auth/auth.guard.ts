import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './skip.auth';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token Authentication Failed, Try Logging In Again',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const unauthorizedAccess = await this.authService.verifyToken(
        payload['email'],
        token,
      );

      if (unauthorizedAccess)
        throw new UnauthorizedException('Unauthorized Profile Access');

      request['user'] = payload;
      request['token'] = token;
    } catch (error) {
      throw new UnauthorizedException(
        'Token Authentication Failed, Log In Again',
      );
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.cookie?.split('=') ?? [];
    return type === process.env.COOKIE_ACCESS_TOKEN ? token : undefined;
  }
}
