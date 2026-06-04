import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION_DEFAULT } from '../../common/constants/pagination.constant';

export class ArticleQueryDto {
  @ApiPropertyOptional({ example: PAGINATION_DEFAULT.PAGE, description: 'Số trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION_DEFAULT.PAGE;

  @ApiPropertyOptional({ example: PAGINATION_DEFAULT.LIMIT, description: 'Số lượng bài viết trên mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = PAGINATION_DEFAULT.LIMIT;
}