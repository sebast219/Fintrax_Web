import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class CacheService implements OnModuleInit {
  private cache: Map<string, { value: any; expiry: number }>;
  private defaultTtl = 300000; // 5 minutes in milliseconds

  constructor(
    private configService: ConfigService,
    private logger: AppLoggerService,
  ) {
    this.cache = new Map();
  }

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    if (redisUrl) {
      // For now, we'll use memory cache even if Redis is configured
      // TODO: Implement Redis properly when cache-manager is fixed
      this.logger.warn('Redis configured but using memory cache (Redis implementation pending)', 'Cache');
    } else {
      this.logger.warn('Using memory cache (Redis not available)', 'Cache');
    }
  }

  private isExpired(item: { value: any; expiry: number }): boolean {
    return Date.now() > item.expiry;
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const item = this.cache.get(key);
      if (item && !this.isExpired(item)) {
        this.logger.debug(`Cache hit: ${key}`, 'Cache');
        return item.value as T;
      } else {
        if (item && this.isExpired(item)) {
          this.cache.delete(key);
        }
        this.logger.debug(`Cache miss: ${key}`, 'Cache');
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}`, error.stack, 'Cache');
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expiry = Date.now() + ((ttl || 300) * 1000);
      this.cache.set(key, { value, expiry });
      this.logger.debug(`Cache set: ${key}`, 'Cache');
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}`, error.stack, 'Cache');
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.logger.debug(`Cache delete: ${key}`, 'Cache');
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}`, error.stack, 'Cache');
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
      this.logger.log('Cache cleared', 'Cache');
    } catch (error) {
      this.logger.error('Cache clear error', error.stack, 'Cache');
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  // Cache key generators
  static userKey(userId: string): string {
    return `user:${userId}`;
  }

  static accountKey(accountId: string): string {
    return `account:${accountId}`;
  }

  static transactionsKey(userId: string, filters?: string): string {
    return `transactions:${userId}${filters ? `:${filters}` : ''}`;
  }

  static dashboardKey(userId: string, period?: string): string {
    return `dashboard:${userId}${period ? `:${period}` : ''}`;
  }

  static exchangeRateKey(from: string, to: string): string {
    return `exchange-rate:${from}-${to}`;
  }

  static categoryKey(userId: string): string {
    return `categories:${userId}`;
  }

  static budgetKey(userId: string, year: number, month: number): string {
    return `budget:${userId}:${year}:${month}`;
  }

  static goalKey(userId: string): string {
    return `goals:${userId}`;
  }

  // Cache invalidation methods
  async invalidateUser(userId: string): Promise<void> {
    await this.del(CacheService.userKey(userId));
    await this.del(CacheService.transactionsKey(userId));
    await this.del(CacheService.dashboardKey(userId));
    await this.del(CacheService.categoryKey(userId));
    await this.del(CacheService.goalKey(userId));
  }

  async invalidateAccount(accountId: string): Promise<void> {
    await this.del(CacheService.accountKey(accountId));
  }

  async invalidateTransactions(userId: string): Promise<void> {
    await this.del(CacheService.transactionsKey(userId));
    await this.del(CacheService.dashboardKey(userId));
  }

  async invalidateDashboard(userId: string): Promise<void> {
    await this.del(CacheService.dashboardKey(userId));
  }

  async invalidateBudget(userId: string, year: number, month: number): Promise<void> {
    await this.del(CacheService.budgetKey(userId, year, month));
    await this.del(CacheService.dashboardKey(userId));
  }

  async invalidateGoals(userId: string): Promise<void> {
    await this.del(CacheService.goalKey(userId));
    await this.del(CacheService.dashboardKey(userId));
  }
}
