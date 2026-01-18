import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { CACHE_TTL_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';
import * as crypto from 'crypto';
import { CACHE_KEY_TOKEN, CACHE_PREFIX_TOKEN } from '../constants';
import { stableStringify } from '@shared/common';
import { Observable, of, tap } from 'rxjs';
import { TypeCacheKey } from '../types';

@Injectable()
export class CacheHttpInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const { method, originalUrl, query, body } = req;

    const prefix = this.reflector.get<string>(CACHE_PREFIX_TOKEN, handler);

    const customKey = this.reflector.get<TypeCacheKey>(
      CACHE_KEY_TOKEN,
      handler,
    );

    let key: string;

    if (customKey && typeof customKey === 'function') {
      key = customKey(req);
    } else if (customKey && typeof customKey === 'string') {
      key = customKey;
    } else {
      const keyData = stableStringify({ method, originalUrl, query, body });
      const hash = crypto.createHash('md5').update(keyData).digest('hex');
      key = `${originalUrl}:${method}:${hash}`;
    }

    return prefix ? `${prefix}:${key}` : key;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);
    if (!key) return next.handle();

    const handler = context.getHandler();

    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, handler) ?? undefined;

    const cached = await this.cacheManager.get(key);
    if (cached) return of(cached);

    return next.handle().pipe(
      tap(response => {
        if (ttl !== undefined) {
          this.cacheManager.set(key, response, { ttl });
        } else {
          this.cacheManager.set(key, response);
        }
      }),
    );
  }
}
