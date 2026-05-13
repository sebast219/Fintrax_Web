import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    this.logger.log(`JWT Guard - Request URL: ${request.url}`);
    this.logger.log(`JWT Guard - Auth Header: ${authHeader ? 'Present' : 'Missing'}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('JWT Guard - No valid Bearer token found');
      return false;
    }

    const token = authHeader.substring(7);
    this.logger.log(`JWT Guard - Token length: ${token.length}`);

    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      this.logger.log(`JWT Guard - Secret exists: ${!!jwtSecret}`);
      
      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });
      
      this.logger.log(`JWT Guard - Token verified successfully for user: ${payload.sub}`);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error(`JWT Guard - Token verification failed: ${error.message}`);
      return false;
    }
  }
}
