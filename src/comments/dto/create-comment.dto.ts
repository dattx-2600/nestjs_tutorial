import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentDto {
  @ApiProperty({ example: 'Bài viết này quá hay và hữu ích!' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.comment_content_required') })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: i18nValidationMessage('validation.comment_article_id_required') })
  @IsNumber()
  articleId: number;
}