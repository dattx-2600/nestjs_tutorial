import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from '../../articles/entities/article.entity'; // Import Article Entity

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Article, (article) => article.user)
    articles: Article[];
}