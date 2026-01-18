import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { INVALIDATE_CACHE_TOKEN } from '../constants';
import { TypeCacheKey } from '../types';
import { InvalidateCacheInterceptor } from '../interceptors/invalidate-cache.interceptor';

export function InvalidateCache(key: TypeCacheKey) {
  return applyDecorators(
    UseInterceptors(InvalidateCacheInterceptor),
    SetMetadata(INVALIDATE_CACHE_TOKEN, key),
  );
}
