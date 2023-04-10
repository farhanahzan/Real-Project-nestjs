import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { Tag } from 'src/typeorm/entities/tag.entity';
import { Repository } from 'typeorm';
import { CreateArticleParams, UpdateArticleParams } from './utils/types';
import { User } from 'src/typeorm/entities/user.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UpdateParams } from './utils/types';

@Injectable()
export class AricleRepository {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
  ) {}

  async findOneTagByName(tagName: string) {
    return await this.tagRepo.findOneBy({ tag: tagName });
  }

  async createTag(tagName: string) {
    const newTag = this.tagRepo.create({ tag: tagName });
    await this.tagRepo.save(newTag);
    return newTag;
  }

  async createArticle(
    userId: string,
    articleDetail: CreateArticleParams,
    slug: string,
  ) {
    const newArticle = this.articleRepo.create({
      userId: userId,
      ...articleDetail.article,
      slug: slug,
    });

    return await this.articleRepo.save(newArticle);
  }

  async updateArticle(
    articleInfo: UpdateParams,
    articleSlug: string,
    newSlug?: string,
  ) {
    const { title, body, description } = articleInfo;
    if (title) {
      await this.articleRepo.update(
        { slug: articleSlug },
        { title, body, description, slug: newSlug },
      );
    } else {
      await this.articleRepo.update(
        { slug: articleSlug },
        { body, description },
      );
    }
  }

  async deleteArticle(articleSlug: string) {
    return await this.articleRepo.delete({ slug: articleSlug });
  }

  async getAllArticle(limit: number, offset: number) {
    return this.articleRepo.find({
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });
  }
  async findArticleBYAuther(auther: string) {
    const autherId = await this.userRepo.findOneBy({ username: auther });

    return autherId.id;
  }

  async findOneByUsername(username: string) {
    return await this.userRepo.findOneBy({ username: username });
  }

  async findFavoriteArticle(userId: string) {
    return await this.favoriteArticleRepo.find({ where: { userId: userId } });
  }

  async findFollowerById(userId: string) {
    return await this.userFollowRepo.find({
      where: { userId: userId },
    });
  }

  async findFavoriteArticleByArticleId(articleId: string) {
    return await this.favoriteArticleRepo.find({
      where: { articleId: articleId },
    });
  }

  async checkFavoriteExits(articleId: string, userId: string) {
    return await this.favoriteArticleRepo.find({
      where: {
        articleId: articleId,
        userId: userId,
      },
    });
  }

  async findOneUserById(userId: string) {
    return await this.userRepo.findOneBy({ id: userId });
  }
}
