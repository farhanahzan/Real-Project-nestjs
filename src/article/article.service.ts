import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleParams, UpdateArticleParams } from './utils/types';

import { kebabCase, upperFirst, lowerCase } from 'lodash';

import { Tag } from 'src/typeorm/entities/tag.entity';
import { GetArticleQueryDto } from './dto/GetArticleQueryDto.dto';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async createArticle(articleDetail: CreateArticleParams, id: string) {
    const { title, body, description, tags } = articleDetail;

    //save tag
    for (const tagName of tags) {
      let newTag = await this.tagRepo.findOneBy({ tag: tagName });

      if (newTag === null) {
        const saveTag = this.tagRepo.create({ tag: tagName });
        await this.tagRepo.save(saveTag);
      }
    }

    const newArticle = this.articleRepo.create({
      userId: id,
      ...articleDetail,
      slug: await this.generateTitleToSlug(title),
    });

    const savedArticle = await this.articleRepo.save(newArticle);

    return savedArticle;
  }

  async generateTitleToSlug(title: string) {
    return kebabCase(title);
  }

  async generateSlugToTitle(slug: string) {
    return upperFirst(lowerCase(slug));
  }

  async updateArticle(articleDetail: UpdateArticleParams, articleSlug: string) {
    const { slug, ...rest } = articleDetail;

    console.log(articleDetail.description);

    if (articleDetail.title) {
      const newSlug = await this.generateTitleToSlug(articleDetail.title);
      const update = await this.articleRepo.update(
        { slug: articleSlug },
        { ...rest, slug: newSlug },
      );
    } else {
      const update = await this.articleRepo.update(
        { slug: articleSlug },
        { ...rest },
      );
    }

    return articleDetail;
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
    const autherId = await this.userProfileRepo.findOneBy({ username: auther });

    return autherId.userId;
  }

  async getArticles(query: GetArticleQueryDto) {
    let { tag, auther, favorited, limit = 20, offset = 0 } = query;

    let filterArticle = await this.getAllArticle(limit, offset);

    if (tag) {
      filterArticle = filterArticle.filter((article) =>
        article.tags.includes(tag),
      );
    }

    if (auther) {
      const autherId = await this.findArticleBYAuther(auther);

      filterArticle = filterArticle.filter(
        (article) => article.userId === autherId,
      );
    }

    return filterArticle;
  }
}
