import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { I18nService } from 'nestjs-i18n';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException
} from '@nestjs/common';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}


  async create(createArticleDto: CreateArticleDto, userId: number) {
    try {
      const newArticle = this.articleRepository.create({
        ...createArticleDto,
        user: { id: userId } as any, // Gắn ID người dùng làm tác giả bài viết
      });
      return await this.articleRepository.save(newArticle);
    } catch (error) {
      if (error.code === '23505' || error.errno === 1062) {
        throw new BadRequestException('Tiêu đề bài viết này đã tồn tại!');
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  // 2. Lấy danh sách bài viết
  async findAll(options: IPaginationOptions) {
    return paginate<Article>(this.articleRepository, options, {
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Lấy chi tiết 1 bài viết
  async findOne(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!article) throw new NotFoundException(this.i18n.t('article.not_found', { args: { id } }));
    return article;
  }

  // 4. Chỉnh sửa bài viết
  async update(id: number, updateArticleDto: UpdateArticleDto, userId: number) {
    const article = await this.findOne(id);

    if (article.user.id !== userId) {
      throw new ForbiddenException(this.i18n.t('article.forbidden_action'));
    }

    try {
      Object.assign(article, updateArticleDto);
      return await this.articleRepository.save(article);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // 5. Xóa bài viết
  async remove(id: number, userId: number) {
    const article = await this.findOne(id);

    // Kiểm tra quyền sở hữu trước khi xóa
    if (article.user.id !== userId) {
      throw new ForbiddenException(this.i18n.t('article.forbidden_action'));
    }

    try {
      await this.articleRepository.remove(article);
      return { message: this.i18n.t('article.delete_success') };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}