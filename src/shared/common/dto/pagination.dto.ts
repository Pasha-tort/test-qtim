import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PaginationBaseDto {
  @Expose()
  @ApiProperty({ type: Number, required: false })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number = 1;

  @Expose()
  @ApiProperty({ type: Number, required: false })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number = 20;
}
