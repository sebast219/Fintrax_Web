import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (!redisUrl) {
          // Fallback to in-memory mock for development
          console.warn('REDIS_URL not configured, using mock Redis for development');
          return new MockRedis();
        }

        return new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

// Mock Redis for development when Redis is not available
class MockRedis {
  private store = new Map<string, any>();

  async incr(key: string): Promise<number> {
    const current = this.store.get(key) || 0;
    const newValue = current + 1;
    this.store.set(key, newValue);
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    // In mock, we don't actually expire entries
    // In production, use real Redis
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async quit(): Promise<void> {
    this.store.clear();
  }
}
