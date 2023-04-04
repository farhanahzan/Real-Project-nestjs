import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class FavoriteArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  articleId: string;

  @ManyToOne(() => Article, (article) => article.favoriteArticle)
  article:Article
}
