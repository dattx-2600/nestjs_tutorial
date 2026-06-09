import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleDto {
  @ApiProperty({ example: 'Title example' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.article_title_required') })
  @IsString()
  @MinLength(5, { message: i18nValidationMessage('validation.article_title_min_length') })
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết chi tiết nằm ở đây...' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.article_content_required') })
  @IsString()
  content: string;
}