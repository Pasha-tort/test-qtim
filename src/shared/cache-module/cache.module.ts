import { Global, Module } from '@nestjs/common';
import { CacheHttpInterceptor } from './interceptors/cache-http.interceptor';
import { CacheModule as CacheLibModule } from '@nestjs/cache-manager';
import { configRedis } from '@shared/configuration';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheLibModule.register({
      ...configRedis,
      isGlobal: true,
      store: redisStore, // что бы не кушать память node.js подключим внешнее redis хранилище
    }),
  ],
  providers: [CacheHttpInterceptor],
  exports: [CacheHttpInterceptor],
})
export class CacheModule {}
