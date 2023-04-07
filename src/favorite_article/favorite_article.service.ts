import { Inject, Injectable } from '@nestjs/common';
import {forwardRef} from '@nestjs/common/utils'
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import {UserParams } from 'src/users/utils/types';
import { Repository } from 'typeorm';
import {NotFoundException} from '@nestjs/common/exceptions'
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class FavoriteArticleService {
  constructor(
    @Inject(forwardRef(() => ArticleService))
    private articleService: ArticleService,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
  ) {}

  async checkFavoriteExits(articleId: string, userId: string) {
    const checkFavorite = await this.favoriteArticleRepo.find({
      where: {
        articleId: articleId,
        userId: userId,
      },
    });
    if (checkFavorite === null || checkFavorite.length === 0) {
      return false;
    } else {
      return true;
    }
  }
  async checkCount(articleId: string) {
    const count = await this.favoriteArticleRepo.find({
      where: { articleId: articleId },
    });

    if (count !== null) {
      return count.length;
    }
    return 0;
  }

  async favoriteArticle(slug: string, userDetail: UserParams) {
    const articleInfo = await this.articleRepo.findOneBy({ slug: slug });

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }

    const articleId = articleInfo.id;

    const checkFavorite = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );

    if (!checkFavorite) {
      const addFavorite = this.favoriteArticleRepo.create({
        articleId: articleId,
        userId: userDetail.id,
      });
      await this.favoriteArticleRepo.save(addFavorite);
    }

    const formatArticle = await this.articleService.returnArticle(slug, userDetail);

    formatArticle.article.favorited = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );
    formatArticle.article.favoriteCount = await this.checkCount(articleId);

    return formatArticle;
  }

  async unFavoriteArticle(slug: string, userDetail: UserParams) {
    const articleInfo = await this.articleRepo.findOneBy({ slug: slug });

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }

    const articleId = articleInfo.id;

    const checkFavorite = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );

    if (checkFavorite) {
      const findFavorite = this.favoriteArticleRepo.findOneBy({
        articleId: articleId,
        userId: userDetail.id,
      });

      if(findFavorite !== null){
        const deleteFavorite = this.favoriteArticleRepo.delete((await findFavorite).id)
      }
      
    }

    const formatArticle = await this.articleService.returnArticle(slug, userDetail);

    formatArticle.article.favorited = await this.checkFavoriteExits(
      articleId,
      userDetail.id,
    );
    formatArticle.article.favoriteCount = await this.checkCount(articleId);

    return formatArticle;
  }
}
