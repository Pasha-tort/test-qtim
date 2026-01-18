import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TokensService } from './tokens.service';
import { RefreshTokenEntity, UserEntity } from '../../entities';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { createCookies } from '@shared/common';

jest.mock('@shared/common', () => ({
  ...jest.requireActual('@shared/common'),
  createCookies: jest.fn(),
}));

jest.mock('bcrypt');

describe('TokensService', () => {
  let service: jest.Mocked<TokensService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshTokenEntity>>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: {
            update: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TokensService);
    jwtService = module.get(JwtService);
    dataSource = module.get(DataSource);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshTokenEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = { id: '1', login: 'test' } as UserEntity;

      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.getTokens(user);

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          accessExpire: expect.any(Number),
          refreshExpire: expect.any(Number),
        }),
      );
    });
  });

  describe('createCookies', () => {
    it('should call createCookies helper with correct params', () => {
      const response = {} as Response;

      service.createCookies(response, {
        accessToken: 'at',
        refreshToken: 'rt',
      });

      expect(createCookies).toHaveBeenCalledTimes(1);
      expect(createCookies).toHaveBeenCalledWith(
        response,
        expect.arrayContaining([
          expect.objectContaining({ hash: 'rt' }),
          expect.objectContaining({ hash: 'at' }),
        ]),
      );
    });
  });

  describe('clearCookie', () => {
    it('should clear access and refresh cookies', async () => {
      const response = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await service.clearCookie(response);

      expect(response.clearCookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetRefreshToken', () => {
    it('should reset refresh token hash', async () => {
      await service.resetRefreshToken('user-id');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-id' },
        { tokenHash: null },
      );
    });
  });

  describe('findOneByUserId', () => {
    it('should find refresh token by userId', async () => {
      const token = { userId: '1' } as RefreshTokenEntity;

      refreshTokenRepository.findOneBy.mockResolvedValue(token);

      const result = await service.findOneByUserId('1');

      expect(result).toBe(token);
      expect(refreshTokenRepository.findOneBy).toHaveBeenCalledWith({
        userId: '1',
      });
    });
  });

  describe('setTokenHash', () => {
    it('should insert new refresh token if not exists', async () => {
      const em = {
        findOneBy: jest.fn().mockResolvedValue(null),
        insert: jest.fn(),
        update: jest.fn(),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.setTokenHash('1', 'raw-token', Date.now());

      expect(em.insert).toHaveBeenCalled();
      expect(em.update).not.toHaveBeenCalled();
    });

    it('should update refresh token if exists', async () => {
      const em = {
        findOneBy: jest.fn().mockResolvedValue({ userId: '1' }),
        insert: jest.fn(),
        update: jest.fn(),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await service.setTokenHash('1', 'raw-token', Date.now());

      expect(em.update).toHaveBeenCalled();
      expect(em.insert).not.toHaveBeenCalled();
    });
  });
});
