import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleParams } from './utils/types';

import { Tag } from 'src/typeorm/entities/tag.entity';

@Injectable()
export class ArticleService {
  constructor(
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
      console.log(newTag)

      if (newTag === null) {
        const saveTag = this.tagRepo.create({tag:tagName});
        await this.tagRepo.save(saveTag);
      }
    }

    const newArticle = this.articleRepo.create({
      userId: id,
      ...articleDetail,
    });

    const savedArticle = await this.articleRepo.save(newArticle);

    return savedArticle;
  }
}
