import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ArticleQueryDto } from './dto/article-query.dto';

@ApiTags('Articles CRUD')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  create(@Body() createArticleDto: CreateArticleDto, @Req() req: any) {
    return this.articlesService.create(createArticleDto, req.user.sub);
  }

  @Get()
  async findAll(@Query() query: ArticleQueryDto) {
    const pagination = await this.articlesService.findAll({
      page: query.page || 1,
      limit: query.limit || 10,
    });

    return {
      items: pagination.items.map(article => new ArticleResponseDto(article)),
      meta: pagination.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(+id);

    return new ArticleResponseDto(article);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req: any
  ) {
    return this.articlesService.update(+id, updateArticleDto, req.user.sub);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.articlesService.remove(+id, req.user.sub);
  }
}