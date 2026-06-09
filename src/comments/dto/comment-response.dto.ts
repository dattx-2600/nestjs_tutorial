import { Expose, Transform } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  @Transform(({ value }) => value ? new Date(value).toISOString() : null)
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => {
    if (!value) return null;
    const { password, ...userWithoutPassword } = value;
    return userWithoutPassword; // ẩn password của tác giả comment
  })
  user: any;

  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }
}