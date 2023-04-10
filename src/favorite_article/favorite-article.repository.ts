import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/typeorm/entities/article.entity";
import { FavoriteArticle } from "src/typeorm/entities/favouriteArticle.entity";
import { Repository } from "typeorm";

@Injectable()
export class FavoriteArticleRepository {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
  ) {}
  async checkFavorite(articleId: string, userId: string) {
    return await this.favoriteArticleRepo.find({
      where: {
        articleId: articleId,
        userId: userId,
      },
    });
  }

  async checkCount(articleId: string) {
    return await this.favoriteArticleRepo.find({
      where: { articleId: articleId },
    });
  }

  async findOneBySlug(slug: string) {
    return await this.articleRepo.findOneBy({ slug: slug });
  }

  async addFavorite(articleId: string, userId: string) {
    const addFavorite = this.favoriteArticleRepo.create({
      articleId: articleId,
      userId: userId,
    });
    await this.favoriteArticleRepo.save(addFavorite);
  }

  async deleteFavorite(articleId: string, userId: string){
     const findFavorite = await this.favoriteArticleRepo.findOneBy({
       articleId: articleId,
       userId: userId,
     });

     if (findFavorite !== null) {
       const deleteFavorite =await this.favoriteArticleRepo.delete(
         (await findFavorite).id,
       );
     }
  }
}