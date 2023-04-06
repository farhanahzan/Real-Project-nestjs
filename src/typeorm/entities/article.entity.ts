import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

import { kebabCase, upperFirst, lowerCase } from 'lodash';
import { FavoriteArticle } from './favouriteArticle.entity';
import { Comment } from './comment.entity';
@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @Column('simple-array')
  tagList: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @BeforeUpdate()
  //  updateSlug() {
  //   this.slug =  kebabCase(this.title);
  // }

  @OneToMany(
    () => FavoriteArticle,
    (favoriteArticle) => favoriteArticle.article,
  )
  favoriteArticle: FavoriteArticle[];

  @ManyToOne(() => User, (user) => user.article)
  user: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comment: Comment[];

  @ManyToMany(() => Tag, (tag) => tag.article)
  @JoinTable()
  tag: Tag[];
}
