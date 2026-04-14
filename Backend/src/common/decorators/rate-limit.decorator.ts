import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  ttl: number; // Time window in seconds
  limit: number; // Max requests per window
}

export const RateLimit = (options: RateLimitOptions) => {
  return SetMetadata(RATE_LIMIT_KEY, options);
};

// Convenience decorators
export const RateLimitAuth = () => RateLimit({ ttl: 60, limit: 5 }); // 5 requests per minute for auth
export const RateLimitStrict = () => RateLimit({ ttl: 60, limit: 20 }); // 20 requests per minute
export const RateLimitNormal = () => RateLimit({ ttl: 60, limit: 100 }); // 100 requests per minute
