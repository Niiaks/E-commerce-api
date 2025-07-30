import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}
@Injectable()
export class CacheService {
  constructor(private redisService: RedisService) {}

  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      const value = await this.redisService.get(fullKey);
      //parse value before returning to user
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log('cache get error', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      //stringify value before setting in cache
      const serializedValue = JSON.stringify(value);
      await this.redisService.set(fullKey, serializedValue, options?.ttl);
    } catch (error) {
      console.log('cache set error:', error);
    }
  }

  async del(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      await this.redisService.del(fullKey);
    } catch (error) {
      console.log('cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.redisService.flushPattern(pattern);
    } catch (error) {
      console.log('Cache invalidate pattern error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    customFunction: () => Promise<T>,
    options?: CacheOptions,
  ) {
    const cached = await this.get<T>(key, options);
    if (cached !== null) return cached;
    const value = await customFunction();
    await this.set(key, value, options);
    return value;
  }
}
