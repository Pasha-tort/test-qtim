import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { TokensService } from '../tokens/tokens.service';
import { UserService } from '../user/user.service';
import { RefreshTokenEntity, UserEntity } from '../../entities';
import { Response } from 'express';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let tokensService: jest.Mocked<TokensService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByLogin: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: TokensService,
          useValue: {
            getTokens: jest.fn(),
            setTokenHash: jest.fn(),
            createCookies: jest.fn(),
            clearCookie: jest.fn(),
            resetRefreshToken: jest.fn(),
            findOneByUserId: jest.fn(),
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

    service = module.get(AuthService);
    userService = module.get(UserService);
    tokensService = module.get(TokensService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const response = {} as Response;

      const user = {
        id: '1',
        login: 'test',
        username: 'test-user',
        passwordHash: 'hashed',
      } as UserEntity;

      userService.findByLogin.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      tokensService.getTokens.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        accessExpire: 1,
        refreshExpire: 2,
      });

      const result = await service.signIn(response, {
        login: 'test',
        password: '123',
      });

      expect(result).toEqual({ id: '1', username: 'test-user' });
      expect(tokensService.setTokenHash).toHaveBeenCalled();
      expect(tokensService.createCookies).toHaveBeenCalled();
    });

    it('should throw Unauthorized if user not found', async () => {
      userService.findByLogin.mockResolvedValue(null);

      await expect(
        service.signIn({} as Response, { login: 'x', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw Unauthorized if password mismatch', async () => {
      userService.findByLogin.mockResolvedValue({
        passwordHash: 'hash',
      } as UserEntity);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signIn({} as Response, { login: 'x', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should throw Conflict if passwords do not match', async () => {
      await expect(
        service.signUp({
          login: 'l',
          username: 'u',
          password: '1',
          confirmPassword: '2',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user already exists', async () => {
      const em = {
        existsBy: jest.fn().mockResolvedValue(true),
        insert: jest.fn(),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      await expect(
        service.signUp({
          login: 'login',
          username: 'username',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow('A user with this login already exists.');
    });

    it('should throw ConflictException if insert throws 23505 error', async () => {
      const em = {
        existsBy: jest.fn().mockResolvedValue(false),
        insert: jest.fn().mockRejectedValue({ code: '23505' }),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      await expect(
        service.signUp({
          login: 'login',
          username: 'username',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow('A user with this login already exists.');
    });

    it('should rethrow error if insert throws unknown error', async () => {
      const em = {
        existsBy: jest.fn().mockResolvedValue(false),
        insert: jest.fn().mockRejectedValue(new Error('unknown')),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      await expect(
        service.signUp({
          login: 'login',
          username: 'username',
          password: 'pass',
          confirmPassword: 'pass',
        }),
      ).rejects.toThrow('unknown');
    });

    it('should create user successfully', async () => {
      const em = {
        existsBy: jest.fn().mockResolvedValue(false),
        insert: jest.fn().mockResolvedValue(undefined),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(em);
      });

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      const result = await service.signUp({
        login: 'login',
        username: 'username',
        password: 'pass',
        confirmPassword: 'pass',
      });

      expect(result).toEqual({
        message: 'You have successfully completed registration',
      });
      expect(em.insert).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear cookies and reset refresh token', async () => {
      const response = {} as Response;
      await service.logout(response, 'user-id');

      expect(tokensService.clearCookie).toHaveBeenCalledWith(response);
      expect(tokensService.resetRefreshToken).toHaveBeenCalledWith('user-id');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens successfully', async () => {
      const response = {} as Response;

      const user = { id: '1' } as UserEntity;
      const rt = { tokenHash: 'hash' };

      userService.findById.mockResolvedValue(user);
      tokensService.findOneByUserId.mockResolvedValue(rt as RefreshTokenEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      tokensService.getTokens.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        accessExpire: 1,
        refreshExpire: 2,
      });

      await service.refreshAccessToken('1', 'raw', response);

      expect(tokensService.setTokenHash).toHaveBeenCalled();
      expect(tokensService.createCookies).toHaveBeenCalled();
    });

    it('should throw Unauthorized if user not found', async () => {
      userService.findById.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken('1', 't', {} as Response),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      userService.findById.mockResolvedValue({ id: '1' } as any);
      tokensService.findOneByUserId.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken('1', 'token', {} as Response),
      ).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException if tokenHash is null', async () => {
      userService.findById.mockResolvedValue({ id: '1' } as any);
      tokensService.findOneByUserId.mockResolvedValue({
        tokenHash: null,
      } as RefreshTokenEntity);

      await expect(
        service.refreshAccessToken('1', 'token', {} as Response),
      ).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException if token does not match', async () => {
      userService.findById.mockResolvedValue({ id: '1' } as any);
      tokensService.findOneByUserId.mockResolvedValue({
        tokenHash: 'hash',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshAccessToken('1', 'token', {} as Response),
      ).rejects.toThrow('Invalid token');
    });
  });
});
