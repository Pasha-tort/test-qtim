import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticleApi } from '../../dto';
import { ArticleService } from './article.service';
import { GetCurrentUser, Private, Serialize } from '@shared/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Cached, InvalidateCache } from '@shared/cache-module';
import { createKeyCacheArticleDetails } from './cache';

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Serialize(ArticleApi.GetArticles.GetArticlesResDto)
  @ApiResponse({ type: ArticleApi.GetArticles.GetArticlesResDto })
  @Get()
  getArticles(@Query() query: ArticleApi.GetArticles.GetArticlesReqDto) {
    return this.articleService.getArticles(query);
  }

  @Cached({
    ttl: 60,
    key: req => createKeyCacheArticleDetails(req.params['articleId']),
  })
  @Serialize(ArticleApi.GetArticle.GetArticleByArticleIdResDto)
  @ApiResponse({ type: ArticleApi.GetArticle.GetArticleByArticleIdResDto })
  @Get(':articleId')
  getArticle(
    @Param('articleId') articleId: string,
  ): Promise<ArticleApi.GetArticle.GetArticleByArticleIdResDto> {
    return this.articleService.getArticleById(articleId);
  }

  @Serialize(ArticleApi.CreateArticle.CreateArticleResDto)
  @ApiCreatedResponse({ type: ArticleApi.CreateArticle.CreateArticleResDto })
  @Private()
  @Post()
  createArticle(
    @Body() body: ArticleApi.CreateArticle.CreateArticleReqDto,
    @GetCurrentUser('id') authorId: string,
  ): Promise<ArticleApi.CreateArticle.CreateArticleResDto> {
    return this.articleService.createArticle({ ...body, authorId });
  }

  @InvalidateCache(req => createKeyCacheArticleDetails(req.params['articleId']))
  @Serialize(ArticleApi.UpdateArticle.UpdateArticleResDto)
  @ApiResponse({ type: ArticleApi.UpdateArticle.UpdateArticleResDto })
  @Private()
  @Patch(':articleId')
  updateArticle(
    @Body() body: ArticleApi.UpdateArticle.UpdateArticleReqDto,
    @Param('articleId') articleId: string,
    @GetCurrentUser('id') userId: string,
  ) {
    return this.articleService.updateArticle({
      ...body,
      userId,
      articleId,
    });
  }

  @InvalidateCache(req => createKeyCacheArticleDetails(req.params['articleId']))
  @Serialize(ArticleApi.DeleteArticle.DeleteArticleResDto)
  @ApiResponse({ type: ArticleApi.DeleteArticle.DeleteArticleResDto })
  @Private()
  @Delete(':articleId')
  deleteArticle(
    @Param('articleId') id: string,
    @GetCurrentUser('id') userId: string,
  ) {
    return this.articleService.deleteArticle(id, userId);
  }
}
