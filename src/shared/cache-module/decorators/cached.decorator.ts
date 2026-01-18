import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { CachePrefix } from './cache-prefix.decorator';
import { CacheHttpInterceptor } from '../interceptors/cache-http.interceptor';
import { TypeCacheKey } from '../types';
import { CacheKeyCustom } from './cache-key.decorator';

export interface CachedOptions {
  prefix?: string;
  key?: TypeCacheKey;
  ttl?: number;
}

export function Cached(options: CachedOptions) {
  return applyDecorators(
    UseInterceptors(CacheHttpInterceptor),
    options.prefix ? CachePrefix(options.prefix) : () => {},
    options.key ? CacheKeyCustom(options.key) : () => {},
    options.ttl ? CacheTTL(options.ttl) : () => {},
  );
}
