import { SetMetadata } from '@nestjs/common';
import { CACHE_PREFIX_TOKEN } from '../constants';

export const CachePrefix = (prefix: string) =>
  SetMetadata(CACHE_PREFIX_TOKEN, prefix);
