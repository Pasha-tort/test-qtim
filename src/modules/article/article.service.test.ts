import { Test, TestingModule } from '@nestjs/testing';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { ArticleService } from './article.service';
import { ArticleEntity } from '../../entities';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { snakeToCamelObj, SortTypeEnum } from '@shared/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ArticleService', () => {
  let service: jest.Mocked<ArticleService>;
  let repository: jest.Mocked<Repository<ArticleEntity>>;

  const mockQueryBuilder = (): jest.Mocked<
    Partial<SelectQueryBuilder<ArticleEntity>> &
      Partial<UpdateQueryBuilder<ArticleEntity>>
  > => {
    return {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ArticleService);
    repository = module.get(getRepositoryToken(ArticleEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getArticles', () => {
    it('should apply all filters and sort when query has authorName, title, dates and sortField', async () => {
      const qb = mockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<ArticleEntity>,
      );

      await service.getArticles({
        page: 1,
        limit: 10,
        authorName: 'author1',
        title: 'My Title',
        fromDate: '2023-01-01',
        toDate: '2023-01-31',
        sortField: 'createdAt',
        sortType: SortTypeEnum.ASC,
      } as any);

      expect(qb.leftJoin).toHaveBeenCalledWith('article.author', 'users');
      expect(qb.where).toHaveBeenCalledWith('author.username = :name', {
        name: 'author1',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('article.title = :title', {
        title: 'My Title',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('article.created_at > :date', {
        date: '2023-01-01',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('article.created_at < :date', {
        date: '2023-01-31',
      });
      expect(qb.orderBy).toHaveBeenCalledWith(
        'article.created_at',
        SortTypeEnum.ASC,
      );
      expect(qb.getManyAndCount).toHaveBeenCalled();
    });

    it('should apply all filters without sort', async () => {
      const qb = mockQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<ArticleEntity>,
      );

      await service.getArticles({
        page: 1,
        limit: 10,
        authorName: 'author1',
        title: 'My Title',
        fromDate: '2023-01-01',
        toDate: '2023-01-31',
        sortType: SortTypeEnum.ASC,
      } as any);

      expect(qb.orderBy).toHaveBeenCalledWith(
        'article.created_at',
        SortTypeEnum.DESC,
      );
      expect(qb.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getArticleById', () => {
    it('should return a single article', async () => {
      const article = { id: '1', title: 'Test' };
      repository.findOne.mockResolvedValue(article as any);

      const result = await service.getArticleById('1');

      expect(result).toBe(article);
    });
  });

  describe('createArticle', () => {
    it('should create and save article', async () => {
      const createReturn = {
        title: 't',
        desc: 'd',
        authorId: 'u',
      } as ArticleEntity;
      repository.create.mockReturnValue(createReturn);
      repository.save.mockResolvedValue(createReturn);

      const result = await service.createArticle({
        title: 't',
        desc: 'd',
        authorId: 'u',
      });

      expect(repository.create).toHaveBeenCalledWith({
        title: 't',
        desc: 'd',
        authorId: 'u',
      });
      expect(repository.save).toHaveBeenCalledWith(createReturn);
      expect(result).toBe(createReturn);
    });
  });

  describe('updateArticle', () => {
    it('should throw NotFoundException if no title/desc and article not found', async () => {
      await expect(
        service.updateArticle({ articleId: '1', userId: 'u' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update article successfully', async () => {
      const qb = mockQueryBuilder();
      qb.execute.mockResolvedValue({
        affected: 1,
        raw: [{ id: '1', title: 't', desc: 'd' }],
        generatedMaps: [{}],
      });
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<ArticleEntity>,
      );

      const result = await service.updateArticle({
        articleId: '1',
        userId: 'u',
        title: 't',
        desc: 'd',
      });

      expect(qb.update).toHaveBeenCalledWith(ArticleEntity);
      expect(qb.set).toHaveBeenCalledWith({ title: 't', desc: 'd' });
      expect(result).toEqual(
        snakeToCamelObj({ id: '1', title: 't', desc: 'd' }),
      );
    });

    it('should throw NotFoundException if update affected 0', async () => {
      const qb = mockQueryBuilder();
      qb.execute.mockResolvedValue({
        affected: 0,
        raw: [],
        generatedMaps: [{}],
      });
      repository.createQueryBuilder.mockReturnValue(
        qb as unknown as SelectQueryBuilder<ArticleEntity>,
      );

      await expect(
        service.updateArticle({
          articleId: '1',
          userId: 'u',
          title: 't',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteArticle('1', 'u');

      expect(repository.delete).toHaveBeenCalledWith({
        id: '1',
        authorId: 'u',
      });
      expect(result).toEqual({ articleId: '1' });
    });

    it('should throw NotFoundException if delete affected 0', async () => {
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteArticle('1', 'u')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
