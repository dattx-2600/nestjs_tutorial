import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Comments CRUD')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    const comment = await this.commentsService.create(createCommentDto, req.user.sub);
    return new CommentResponseDto(comment);
  }

  @Get('article/:articleId')
  async findAllByArticle(@Param('articleId') articleId: string, @Query() query: CommentQueryDto) {
    const pagination = await this.commentsService.findAllByArticle(+articleId, {
      page: query.page || 1,
      limit: query.limit || 10,
    });
    return {
      items: pagination.items.map((comment) => new CommentResponseDto(comment)),
      meta: pagination.meta,
    };
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: any) {
    const updatedComment = await this.commentsService.update(+id, updateCommentDto, req.user.sub);
    return new CommentResponseDto(updatedComment);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.remove(+id, req.user.sub);
  }
}