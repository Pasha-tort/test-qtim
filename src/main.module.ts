import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { ArticleModule } from './modules/article';
import { CacheModule } from '@shared/cache-module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule,
    AuthModule,
    TokensModule,
    ArticleModule,
  ],
})
export class MainModule {}
