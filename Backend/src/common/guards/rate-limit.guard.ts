import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppLoggerService } from '../logger/logger.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly reflector: Reflector,
    private logger: AppLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'] || '';
    const userId = request.user?.sub || request.user?.id;

    // Get rate limit configuration from metadata
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getHandler());
    const ttl = rateLimitOptions?.ttl || 60;
    const limit = rateLimitOptions?.limit || 100;

    // Create tracker key
    const tracker = userId ? `user:${userId}` : `ip:${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;
    
    const now = Date.now();
    const windowStart = now - (ttl * 1000);
    
    // Clean up old entries
    for (const [key, value] of this.rateLimitMap.entries()) {
      if (value.resetTime < now) {
        this.rateLimitMap.delete(key);
      }
    }

    // Check current rate limit
    const current = this.rateLimitMap.get(tracker);
    
    if (!current || current.resetTime < now) {
      // Reset window
      this.rateLimitMap.set(tracker, {
        count: 1,
        resetTime: now + (ttl * 1000),
      });
      return true;
    }

    if (current.count >= limit) {
      this.logger.logSecurityEvent('Rate limit exceeded', userId, ip, {
        userAgent,
        endpoint: `${request.method} ${request.url}`,
        limit,
        ttl,
        currentCount: current.count,
      });
      
      throw new Error('Rate limit exceeded');
    }

    // Increment count
    current.count++;
    return true;
  }
}
