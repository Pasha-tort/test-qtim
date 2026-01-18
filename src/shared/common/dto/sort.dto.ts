import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export enum SortTypeEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

@Exclude()
export class SortBaseDto {
  @ApiProperty({ required: false })
  @Expose()
  @IsString()
  @IsOptional()
  sortField?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsString()
  @IsOptional()
  sortType?: SortTypeEnum = SortTypeEnum.DESC;
}
