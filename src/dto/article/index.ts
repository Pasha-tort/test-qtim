import {
  PaginationSortBaseDto,
  settingsArticle,
  settingsUser,
} from '@shared/common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export namespace ArticleApi {
  @Exclude()
  class AuthorDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    username: string;
  }

  @Exclude()
  export class ArticleDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    title: string;

    @ApiProperty()
    @Expose()
    desc: string;

    @ApiProperty({ type: Date })
    @Expose()
    createdAt: Date;

    @ApiProperty({ type: Date })
    @Expose()
    updatedAt: Date;

    @ApiProperty({ type: AuthorDto })
    @Expose()
    @Type(() => AuthorDto)
    author: AuthorDto;
  }

  export namespace GetArticles {
    enum SortEnum {
      'createdAt' = 'createdAt',
    }
    @Exclude()
    export class GetArticlesReqDto extends PaginationSortBaseDto<
      keyof Pick<ArticleDto, 'createdAt'>
    > {
      @ApiProperty({ required: false, enum: SortEnum })
      @Expose()
      @IsString()
      @IsOptional()
      sortField?: SortEnum;

      @ApiProperty({ required: false })
      @Expose()
      @IsString()
      @MaxLength(settingsArticle.maxLengthCharsTitle)
      @MinLength(settingsArticle.minLengthCharsTitle)
      @IsOptional()
      title?: string;

      @ApiProperty({ required: false })
      @Expose()
      @IsString()
      @MaxLength(settingsUser.maxLengthCharsUsername)
      @MinLength(settingsUser.minLengthCharsUsername)
      @IsOptional()
      authorName?: string;

      @ApiProperty({ required: false, description: 'ISO format' })
      @Expose()
      @Type(() => Date)
      @IsDate()
      @IsOptional()
      fromDate?: string;

      @ApiProperty({ required: false, description: 'ISO format' })
      @Expose()
      @Type(() => Date)
      @IsDate()
      @IsOptional()
      toDate?: string;
    }

    @Exclude()
    export class GetArticlesResDto {
      @ApiProperty({ type: [ArticleDto] })
      @Expose()
      @Type(() => ArticleDto)
      articles: ArticleDto[];

      @ApiProperty({ type: Number })
      @Expose()
      total: number;
    }
  }
  export namespace GetArticle {
    export class GetArticleByArticleIdResDto extends ArticleDto {}
  }

  export namespace CreateArticle {
    @Exclude()
    export class CreateArticleReqDto {
      @ApiProperty({
        maxLength: settingsArticle.maxLengthCharsTitle,
        minLength: settingsArticle.minLengthCharsTitle,
      })
      @Expose()
      @IsString()
      @MaxLength(settingsArticle.maxLengthCharsTitle)
      @MinLength(settingsArticle.minLengthCharsTitle)
      title: string;

      @ApiProperty()
      @Expose()
      @IsString()
      @IsNotEmpty()
      desc: string;
    }

    export class CreateArticleResDto implements Omit<ArticleDto, 'author'> {
      @ApiProperty()
      @Expose()
      id: string;

      @ApiProperty()
      @Expose()
      title: string;

      @ApiProperty()
      @Expose()
      desc: string;

      @ApiProperty({ type: Date })
      @Expose()
      createdAt: Date;

      @ApiProperty({ type: Date })
      @Expose()
      updatedAt: Date;
    }
  }

  export namespace UpdateArticle {
    @Exclude()
    export class UpdateArticleReqDto {
      @ApiProperty({
        maxLength: settingsArticle.maxLengthCharsTitle,
        minLength: settingsArticle.minLengthCharsTitle,
        required: false,
      })
      @Expose()
      @IsString()
      @MaxLength(settingsArticle.maxLengthCharsTitle)
      @MinLength(settingsArticle.minLengthCharsTitle)
      @IsOptional()
      title?: string;

      @ApiProperty()
      @Expose()
      @IsString()
      @IsNotEmpty()
      @IsOptional()
      desc?: string;
    }

    export class UpdateArticleResDto
      extends CreateArticle.CreateArticleResDto {}
  }

  export namespace DeleteArticle {
    @Exclude()
    export class DeleteArticleResDto {
      @ApiProperty()
      @Expose()
      articleId: string;
    }
  }
}
