import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION_DEFAULT } from '../../common/constants/pagination.constant';

export class CommentQueryDto {
  @ApiPropertyOptional({ example: PAGINATION_DEFAULT.PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION_DEFAULT.PAGE;

  @ApiPropertyOptional({ example: PAGINATION_DEFAULT.LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = PAGINATION_DEFAULT.LIMIT;
}