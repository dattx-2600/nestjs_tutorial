import {
  InternalServerErrorException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { I18nContext } from 'nestjs-i18n';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly i18n: I18nContext,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    try {
      const newComment = this.commentRepository.create({
        content: createCommentDto.content,
        article: { id: createCommentDto.articleId } as any,
        user: { id: userId } as any,
      });
      return await this.commentRepository.save(newComment);
    } catch (error)  {
      if (error.code === '23503' || error.errno === 1452) {
        throw new BadRequestException(
          this.i18n.t('article.not_found', { args: { id: createCommentDto.articleId } })
        );
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  // Phân trang danh sách comment của một bài viết cụ thể
  async findAllByArticle(articleId: number, options: IPaginationOptions) {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');

    queryBuilder
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.articleId = :articleId', { articleId })
      .orderBy('comment.createdAt', 'DESC');

    return paginate<Comment>(queryBuilder, options);
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!comment) {
      throw new NotFoundException(this.i18n.t('comment.not_found', { args: { id } }));
    }
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    const comment = await this.findOne(id);
    if (comment.user.id !== userId) {
      throw new ForbiddenException(this.i18n.t('comment.forbidden_action'));
    }

    try {
      Object.assign(comment, updateCommentDto);
      return await this.commentRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number, userId: number) {
    const comment = await this.findOne(id);

    if (comment.user.id !== userId) {
      throw new ForbiddenException(this.i18n.t('comment.forbidden_action'));
    }

    try {
      await this.commentRepository.remove(comment);
      return { message: this.i18n.t('comment.delete_success') };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}