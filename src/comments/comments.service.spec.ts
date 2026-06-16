import { TestBed, type Mocked } from '@suites/unit';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext } from 'nestjs-i18n';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

describe('CommentsService Unit Test', () => {
  let service: CommentsService;
  let repository: Mocked<Repository<Comment>>;
  let i18n: Mocked<I18nContext>;

  beforeAll(async () => {
    // 🚀 Tự động sinh Mock cho Repository & I18nContext trong Constructor
    const { unit, unitRef } = await TestBed.solitary(CommentsService).compile();

    service = unit;
    repository = unitRef.get(getRepositoryToken(Comment));
    i18n = unitRef.get(I18nContext);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // 1. TEST HÀM CREATE
  // ==========================================
  describe('create', () => {
    const dto = { content: 'Bài viết hay', articleId: 1 };
    const userId = 42;

    it('case success', async () => {
      const mockComment = { id: 1, content: dto.content, article: { id: dto.articleId }, user: { id: userId } };

      repository.create.mockReturnValue(mockComment as any);
      repository.save.mockResolvedValue(mockComment as any);

      const result = await service.create(dto, userId);

      expect(result).toEqual(mockComment);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(mockComment);
    });

    it('case lỗi BadRequest nếu articleId không tồn tại (Lỗi khóa ngoại Code 23503)', async () => {
      repository.create.mockReturnValue({} as any);
      // Giả lập DB ném lỗi Foreign Key Constraint (PostgreSQL: 23503)
      repository.save.mockRejectedValue({ code: '23503' });
      i18n.t.mockReturnValue('Không tìm thấy bài viết');

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
      expect(i18n.t).toHaveBeenCalledWith('article.not_found', { args: { id: dto.articleId } });
    });
  });

  // ==========================================
  // 2. TEST HÀM FINDONE
  // ==========================================
  describe('findOne', () => {
    it('case trả về bình luận nếu tìm thấy', async () => {
      const mockComment = { id: 1, content: 'Hello', user: { id: 2 } };
      repository.findOne.mockResolvedValue(mockComment as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockComment);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true },
      });
    });

    it('case lỗi NotFoundException nếu không thấy bình luận', async () => {
      repository.findOne.mockResolvedValue(null);
      i18n.t.mockReturnValue('Bình luận không tồn tại');

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(i18n.t).toHaveBeenCalledWith('comment.not_found', { args: { id: 999 } });
    });
  });

  // ==========================================
  // 3. TEST HÀM UPDATE
  // ==========================================
  describe('update', () => {
    const updateDto = { content: 'Nội dung đã sửa lại' };

    it('case sửa thành công nếu chính chủ bình luận', async () => {
      const existingComment = { id: 1, content: 'Nội dung cũ', user: { id: 10 } };
      const updatedComment = { id: 1, content: 'Nội dung đã sửa lại', user: { id: 10 } };

      // Mock hàm findOne nội bộ bằng cách mock lệnh findOne của Repository
      repository.findOne.mockResolvedValue(existingComment as any);
      repository.save.mockResolvedValue(updatedComment as any);

      const result = await service.update(1, updateDto, 10); // userId = 10 trùng khớp tác giả

      expect(result.content).toBe('Nội dung đã sửa lại');
      expect(repository.save).toHaveBeenCalled();
    });

    it('case chặn lại và ném lỗi ForbiddenException nếu sửa bình luận của người khác', async () => {
      const existingComment = { id: 1, content: 'Nội dung cũ', user: { id: 10 } }; // Của tác giả số 10
      repository.findOne.mockResolvedValue(existingComment as any);
      i18n.t.mockReturnValue('Không có quyền chỉnh sửa');

      // user 99 sửa comment
      await expect(service.update(1, updateDto, 99)).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // 4. TEST HÀM REMOVE
  // ==========================================
  describe('remove', () => {
    it('case xóa thành công nếu chính chủ xóa', async () => {
      const existingComment = { id: 1, user: { id: 7 } };
      repository.findOne.mockResolvedValue(existingComment as any);
      repository.remove.mockResolvedValue({} as any);
      i18n.t.mockReturnValue('Xóa comment thành công!');

      const result = await service.remove(1, 7); // userId = 7

      expect(result).toEqual({ message: 'Xóa comment thành công!' });
      expect(repository.remove).toHaveBeenCalledWith(existingComment);
    });

    it('case lỗi InternalServerError nếu database bị crash khi xóa', async () => {
      const existingComment = { id: 1, user: { id: 7 } };
      repository.findOne.mockResolvedValue(existingComment as any);
      repository.remove.mockRejectedValue(new Error('Database sập nguồn!'));

      await expect(service.remove(1, 7)).rejects.toThrow(InternalServerErrorException);
    });
  });
});