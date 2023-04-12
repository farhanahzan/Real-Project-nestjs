import { Inject, Injectable } from '@nestjs/common';
import {forwardRef} from '@nestjs/common/utils'
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import {UserParams } from 'src/users/utils/types';
import { Repository } from 'typeorm';
import {NotFoundException} from '@nestjs/common/exceptions'
import { ArticleService } from 'src/article/article.service';
import { FavoriteArticleRepository } from './favorite-article.repository';

@Injectable()
export class FavoriteArticleService {
  constructor(
    @Inject(forwardRef(() => ArticleService))
    private articleService: ArticleService,

    private favoriteArticleRepository:FavoriteArticleRepository
  ) {}

  async checkFavoriteExits(articleId: string, userId: string) {
    const checkFavorite = await this.favoriteArticleRepository.checkFavorite(articleId, userId)
    if (checkFavorite === null || checkFavorite.length === 0) {
      return false;
    } else {
      return true;
    }
  }
  async checkCount(articleId: string) {
    const count = await this.favoriteArticleRepository.checkCount(articleId)
    if (count !== null) {
      return count.length;
    }
    return 0;
  }

  async findOneBySlug(slug:string){
    const article = await this.favoriteArticleRepository.findOneBySlug(slug)
    if(article === null){
      throw new NotFoundException('Article Not Found')
    }
    return article
  }

  async favoriteArticle(slug: string, userDetail: UserParams) {
    const articleInfo = await this.findOneBySlug(slug)

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }

    const articleId = articleInfo.id;

    const checkFavorite = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );

    if (!checkFavorite) {
     await this.favoriteArticleRepository.addFavorite(articleId, userDetail.id)
    }

    const formatArticle = await this.articleService.buildResponseArticle(
      slug,
      userDetail,
    );

    formatArticle.article.favorited = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );
    formatArticle.article.favoriteCount = await this.checkCount(articleId);

    return formatArticle;
  }

  async unFavoriteArticle(slug: string, userDetail: UserParams) {
    const articleInfo = await this.findOneBySlug(slug)

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }

    const articleId = articleInfo.id;

    const checkFavorite = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );

    if (checkFavorite) {
     await this.favoriteArticleRepository.deleteFavorite(articleId, userDetail.id)
      
    }

    const formatArticle = await this.articleService.buildResponseArticle(
      slug,
      userDetail,
    );

    formatArticle.article.favorited = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );
    formatArticle.article.favoriteCount = await this.checkCount(articleId);

    return formatArticle;
  }
}
