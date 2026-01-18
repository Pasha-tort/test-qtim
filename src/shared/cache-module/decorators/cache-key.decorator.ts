import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY_TOKEN } from '../constants';
import { TypeCacheKey } from '../types';

export const CacheKeyCustom = (key: TypeCacheKey) =>
  SetMetadata(CACHE_KEY_TOKEN, key);
