import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { UserEntity } from '../../entities';

describe('UserService', () => {
  let repository: jest.Mocked<Repository<UserEntity>>;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', login: 'testuser' } as UserEntity;
      repository.findOneBy.mockResolvedValue(user);

      const result = await service.findById('1');
      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return null if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findById('2');
      expect(result).toBeNull();
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '2' });
    });
  });

  describe('findByLogin', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', login: 'testuser' } as UserEntity;
      repository.findOneBy.mockResolvedValue(user);

      const result = await service.findByLogin('testuser');
      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        login: 'testuser',
      });
    });

    it('should return null if user not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findByLogin('nouser');
      expect(result).toBeNull();
      expect(repository.findOneBy).toHaveBeenCalledWith({
        login: 'nouser',
      });
    });
  });
});
