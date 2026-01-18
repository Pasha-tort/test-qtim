import { ApiProperty } from '@nestjs/swagger';
import { PaginationBaseDto } from './pagination.dto';
import { SortBaseDto, SortTypeEnum } from './sort.dto';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PaginationSortBaseDto<SortType extends string>
  implements PaginationBaseDto, SortBaseDto
{
  @ApiProperty({ type: Number, required: false })
  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @ApiProperty({ type: Number, required: false })
  @Expose()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number = 20;

  @ApiProperty({ required: false })
  @Expose()
  @IsString()
  @IsOptional()
  sortField?: SortType;

  @ApiProperty({ required: false })
  @Expose()
  @IsString()
  @IsOptional()
  sortType?: SortTypeEnum = SortTypeEnum.DESC;
}
