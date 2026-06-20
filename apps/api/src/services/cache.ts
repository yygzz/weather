import NodeCache from 'node-cache';
import { config } from '../config';

export type CacheKey = 'current' | 'hourly' | 'daily' | 'air' | 'lifestyle' | 'alerts' | 'radar' | 'geocode';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  }

  private buildKey(type: CacheKey, lat: string, lon: string): string {
    return `${type}:${lat}:${lon}`;
  }

  get<T>(type: CacheKey, lat: string, lon: string): T | undefined {
    return this.cache.get<T>(this.buildKey(type, lat, lon));
  }

  set<T>(type: CacheKey, lat: string, lon: string, value: T, ttl?: number): void {
    const key = this.buildKey(type, lat, lon);
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value, config.cacheTtl[type]);
    }
  }

  getByKey<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  setByKey<T>(key: string, value: T, ttl?: number): void {
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value, config.cacheTtl.current);
    }
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export const cache = new CacheService();
