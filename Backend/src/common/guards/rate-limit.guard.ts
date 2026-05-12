import { Injectable, ExecutionContext, CanActivate, Inject, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppLoggerService } from '../logger/logger.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private logger: AppLoggerService,
    @Inject('REDIS_CLIENT') private redis: Redis,
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
    
    try {
      // Use Redis for distributed rate limiting
      const current = await this.redis.incr(tracker);
      
      if (current === 1) {
        // First request in window - set expiration
        await this.redis.expire(tracker, ttl);
      }
      
      if (current > limit) {
        this.logger.logSecurityEvent('Rate limit exceeded', userId, ip, {
          userAgent,
          endpoint: `${request.method} ${request.url}`,
          limit,
          ttl,
          currentCount: current,
        });
        
        throw new BadRequestException('Rate limit exceeded');
      }
      
      return true;
    } catch (error) {
      // If Redis fails, allow request (fail-open)
      this.logger.error('Rate limiting failed', error.stack, 'RateLimitGuard');
      return true;
    }
  }
}
