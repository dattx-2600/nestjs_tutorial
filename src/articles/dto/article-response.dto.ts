import { Exclude, Expose, Transform } from 'class-transformer';

export class ArticleResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  @Transform(({ value }) => value ? new Date(value).toISOString() : null)
  createdAt: string;

  @Expose()
  @Transform(({ value }) => {
    if (!value) return null;
    // Ẩn mật khẩu
    const { password, ...userWithoutPassword } = value;
    return userWithoutPassword;
  })
  user: any;

  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }
}