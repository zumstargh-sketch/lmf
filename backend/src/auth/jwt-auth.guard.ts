import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Simple bearer-token guard. Verifies the JWT issued by the auth module and
 * attaches the decoded payload to `request.user`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request?.headers?.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Please sign in to continue.');
    }
    try {
      request.user = this.jwtService.verify(header.slice('Bearer '.length));
      return true;
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }
  }
}