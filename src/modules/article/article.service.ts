import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleApi } from '../../dto';
import { camelToSnake, snakeToCamelObj, SortTypeEnum } from '@shared/common';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async getArticles(query: ArticleApi.GetArticles.GetArticlesReqDto) {
    const builder = this.articleRepository.createQueryBuilder('article');
    if (query.authorName) {
      builder
        .leftJoin('article.author', 'users')
        .where('author.username = :name', { name: query.authorName });
    }
    if (query.title)
      builder.andWhere('article.title = :title', { title: query.title });
    if (query.fromDate)
      builder.andWhere('article.created_at > :date', { date: query.fromDate });
    if (query.toDate)
      builder.andWhere('article.created_at < :date', { date: query.toDate });
    if (query.sortField)
      builder.orderBy(
        `article.${camelToSnake(query.sortField)}`,
        query.sortType,
      );
    else builder.orderBy(`article.created_at`, SortTypeEnum.DESC);

    builder
      .leftJoinAndSelect('article.author', 'author')
      .select([
        'article.id',
        'article.title',
        'article.desc',
        'article.createdAt',
        'article.updatedAt',
        'author.id',
        'author.username',
      ])
      .offset((query.page - 1) * query.limit)
      .limit(query.limit);

    const [articles, total] = await builder.getManyAndCount();
    return { articles, total };
  }

  async getArticleById(articleId: string) {
    return this.articleRepository.findOne({
      where: { id: articleId },
      relations: { author: true },
      select: {
        author: { id: true, username: true },
        createdAt: true,
        updatedAt: true,
        desc: true,
        id: true,
        title: true,
      },
    });
  }

  async createArticle({
    title,
    desc,
    authorId,
  }: {
    title: string;
    desc: string;
    authorId: string;
  }) {
    const article = await this.articleRepository.save(
      this.articleRepository.create({
        title,
        desc,
        authorId,
      }),
    );
    return article;
  }

  async updateArticle({
    title,
    desc,
    articleId,
    userId,
  }: {
    title?: string;
    desc?: string;
    articleId: string;
    userId: string;
  }) {
    if (!desc && !title)
      throw new BadRequestException(
        'Parameters for editing the resource were not found.',
      );

    const updateData: { title?: string; desc?: string } = {};
    if (title) updateData.title = title;
    if (desc) updateData.desc = desc;

    const result = await this.articleRepository
      .createQueryBuilder()
      .update(ArticleEntity)
      .set(updateData)
      .where('id = :id AND author_id = :authorId', {
        id: articleId,
        authorId: userId,
      })
      .returning('*')
      .execute();
    if (result.affected === 0) throw new NotFoundException('Article not found');

    return snakeToCamelObj(result.raw[0]);
  }

  async deleteArticle(articleId: string, userId: string) {
    const result = await this.articleRepository.delete({
      id: articleId,
      authorId: userId,
    });
    if (result.affected === 0) throw new NotFoundException('Article not found');
    return { articleId };
  }
}
