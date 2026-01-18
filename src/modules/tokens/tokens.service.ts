import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  Tokens,
  cleanerObjectSrc,
  createCookies,
} from '@shared/common';
import { configJwt } from '@shared/configuration';
import { RefreshTokenEntity, UserEntity } from '../../entities';
import { Response } from 'express';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { tokensKeys } from '@shared/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokensService {
  static readonly rtData = {
    key: tokensKeys.rt,
    path: '/api/auth/refresh-access-token',
  };
  static readonly atData = { key: tokensKeys.at, path: '/api' };

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getTokens(user: UserEntity): Promise<Tokens> {
    const payload: JwtPayload = {
      login: user.login,
      id: user.id,
    };
    cleanerObjectSrc(payload);
    const now = Date.now();
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: configJwt.atSecret,
      expiresIn: configJwt.atExp,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: configJwt.rtSecret,
      expiresIn: configJwt.rtExp,
    });
    return {
      accessToken,
      refreshToken,
      accessExpire: (now + configJwt.atTtlSeconds) * 1000,
      refreshExpire: (now + configJwt.rtTtlSeconds) * 1000,
    };
  }

  createCookies(
    response: Response,
    tokens: { refreshToken: string; accessToken: string },
  ) {
    createCookies(response, [
      {
        key: TokensService.rtData.key,
        hash: tokens.refreshToken,
        httpOnly: true,
        path: TokensService.rtData.path,
        sameSite: 'strict',
        options: { ttlSeconds: configJwt.rtTtlSeconds },
      },
      {
        key: TokensService.atData.key,
        hash: tokens.accessToken,
        httpOnly: true,
        path: TokensService.atData.path,
        sameSite: 'lax',
        options: { ttlSeconds: configJwt.atTtlSeconds },
      },
    ]);
  }

  async clearCookie(response: Response) {
    response.clearCookie(TokensService.atData.key, {
      path: TokensService.atData.path,
    });
    response.clearCookie(TokensService.rtData.key, {
      path: TokensService.atData.path,
    });
  }

  async resetRefreshToken(userId: string) {
    await this.refreshTokenRepository.update({ userId }, { tokenHash: null });
  }

  async findOneByUserId(userId: string) {
    return this.refreshTokenRepository.findOneBy({ userId });
  }

  async setTokenHash(
    userId: string,
    refreshTokenHash: string,
    refreshExpire: number,
  ) {
    await this.dataSource.transaction(async em => {
      const rt = await em.findOneBy(RefreshTokenEntity, { userId });
      const salt = await bcrypt.genSalt();
      const tokenHash = await bcrypt.hash(refreshTokenHash, salt);

      if (!rt) {
        await em.insert(RefreshTokenEntity, {
          userId,
          tokenHash,
          expiresAt: new Date(refreshExpire),
        });
      } else {
        await em.update(RefreshTokenEntity, { userId }, { tokenHash });
      }
    });
  }
}
