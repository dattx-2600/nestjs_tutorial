import { TestBed, type Mocked } from '@suites/unit';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';

describe('ArticlesService Unit Test', () => {
  let service: ArticlesService;
  let repository: Mocked<Repository<Article>>;
  let i18n: Mocked<I18nService>;

  beforeAll(async () => {
    // 🚀 Tự động sinh ra Mocks cho tất cả các dependencies trong Constructor
    const { unit, unitRef } = await TestBed.solitary(ArticlesService).compile();

    service = unit;
    // Lấy mock của Repository và I18nService
    repository = unitRef.get(getRepositoryToken(Article));
    i18n = unitRef.get(I18nService);
  });

  // Reset các mock sau mỗi case test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. TEST HÀM CREATE
  // ==========================================
  describe('create', () => {
    const dto = { title: 'Bài viết mới', content: 'Nội dung...' };
    const userId = 1;

    it('test case tạo bài viết thành công (Happy Path)', async () => {
      const mockArticle = { id: 10, ...dto, user: { id: userId } };

      repository.create.mockReturnValue(mockArticle as any);
      repository.save.mockResolvedValue(mockArticle as any);

      const result = await service.create(dto, userId);

      expect(result).toEqual(mockArticle);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(mockArticle);
    });

    it('case ném lỗi BadRequest nếu trùng tiêu đề bài viết (Code 23505)', async () => {
      repository.create.mockReturnValue({} as any);
      // Giả lập Database ném ra lỗi trùng Unique Key
      repository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // 2. TEST HÀM FINDONE
  // ==========================================
  describe('findOne', () => {
    it('test case trả về chi tiết bài viết nếu tìm thấy', async () => {
      const mockArticle = { id: 1, title: 'Học NestJS', user: { id: 1 } };
      repository.findOne.mockResolvedValue(mockArticle as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockArticle);
    });

    it('test case ném lỗi NotFoundException nếu bài viết không tồn tại', async () => {
      repository.findOne.mockResolvedValue(null);
      i18n.t.mockReturnValue('Không tìm thấy bài viết'); // Giả lập i18n dịch chữ

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(i18n.t).toHaveBeenCalledWith('article.not_found', { args: { id: 999 } });
    });
  });

  // ==========================================
  // 3. TEST HÀM UPDATE
  // ==========================================
  describe('update', () => {
    const updateDto = { title: 'Tiêu đề đã sửa' };

    it('test case cập nhật bài viết thành công nếu là CHÍNH CHỦ', async () => {
      const existingArticle = { id: 1, title: 'Tiêu đề cũ', user: { id: 5 } };
      const updatedArticle = { id: 1, title: 'Tiêu đề đã sửa', user: { id: 5 } };

      // Giả lập quá trình tìm thấy bài viết gốc thuộc về userId = 5
      repository.findOne.mockResolvedValue(existingArticle as any);
      repository.save.mockResolvedValue(updatedArticle as any);

      const result = await service.update(1, updateDto, 5); // Truyền userId = 5

      expect(result.title).toBe('Tiêu đề đã sửa');
      expect(repository.save).toHaveBeenCalled();
    });

    it('test case chặn lại và ném lỗi ForbiddenException nếu sửa bài của NGƯỜI KHÁC', async () => {
      const existingArticle = { id: 1, title: 'Tiêu đề cũ', user: { id: 5 } };

      repository.findOne.mockResolvedValue(existingArticle as any);
      i18n.t.mockReturnValue('Bạn không có quyền');

      // User có id = 99 sửa article
      await expect(service.update(1, updateDto, 99)).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // 4. TEST HÀM REMOVE
  // ==========================================
  describe('remove', () => {
    it('test case xóa bài viết thành công nếu là chính chủ', async () => {
      const existingArticle = { id: 1, user: { id: 5 } };
      repository.findOne.mockResolvedValue(existingArticle as any);
      repository.remove.mockResolvedValue({} as any);
      i18n.t.mockReturnValue('Xóa thành công!');

      const result = await service.remove(1, 5);

      expect(result).toEqual({ message: 'Xóa thành công!' });
      expect(repository.remove).toHaveBeenCalledWith(existingArticle);
    });

    it('test case ném lỗi InternalServerError nếu database xảy ra sự cố đột xuất khi xóa', async () => {
      const existingArticle = { id: 1, user: { id: 5 } };
      repository.findOne.mockResolvedValue(existingArticle as any);
      repository.remove.mockRejectedValue(new Error('Mất kết nối Database!'));

      await expect(service.remove(1, 5)).rejects.toThrow(InternalServerErrorException);
    });
  });
});