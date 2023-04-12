import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteArticleRepository {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
  ) {}
  
  async checkFavorite(articleId: string, userId: string) {
    try {
      return await this.favoriteArticleRepo.find({
        where: {
          articleId: articleId,
          userId: userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkCount(articleId: string) {
    try {
      return await this.favoriteArticleRepo.find({
        where: { articleId: articleId },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneBySlug(slug: string) {
    try {
      return await this.articleRepo.findOneBy({ slug: slug });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async addFavorite(articleId: string, userId: string) {
    try {
      const addFavorite = this.favoriteArticleRepo.create({
        articleId: articleId,
        userId: userId,
      });
      await this.favoriteArticleRepo.save(addFavorite);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteFavorite(articleId: string, userId: string) {
    try {
      const findFavorite = await this.favoriteArticleRepo.findOneBy({
        articleId: articleId,
        userId: userId,
      });

      if (findFavorite !== null) {
        const deleteFavorite = await this.favoriteArticleRepo.delete(
          (
            await findFavorite
          ).id,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
