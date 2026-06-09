import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 👇 Liên kết bài viết với tác giả (User). Khi xóa User, các bài viết liên quan cũng tự xóa (onDelete: 'CASCADE')
  @ManyToOne(() => User, (user) => user.articles, { onDelete: 'CASCADE' })
  user: User;
}