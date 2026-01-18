import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INVALIDATE_CACHE_TOKEN } from '../constants';
import { TypeCacheKey } from '../types';
import { Request } from 'express';

@Injectable()
export class InvalidateCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const key = this.reflector.get<TypeCacheKey>(
      INVALIDATE_CACHE_TOKEN,
      handler,
    );

    let resultKey: string;
    if (key && typeof key === 'function') {
      resultKey = key(req);
    } else if (key && typeof key === 'string') {
      resultKey = key;
    }

    return next.handle().pipe(
      tap(async () => {
        await this.cacheManager.del(resultKey);
      }),
    );
  }
}
