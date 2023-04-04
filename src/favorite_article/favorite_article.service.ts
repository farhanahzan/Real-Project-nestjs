import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { CreateUserParams } from 'src/users/utils/types';
import { Repository } from 'typeorm';
import {NotFoundException} from '@nestjs/common/exceptions'

@Injectable()
export class FavoriteArticleService {
    constructor(
        @InjectRepository(FavoriteArticle)
        private favoriteArticleRepo:Repository<FavoriteArticle>,
        @InjectRepository(Article)
        private articleRepo:Repository<Article>
    ){}

    async checkFavoriteExits(articleId:string, userId:string){
        const checkFavorite = await this.favoriteArticleRepo.find({
          where: {
            articleId: articleId,
            userId: userId,
          },
        });
        if(checkFavorite === null || checkFavorite.length === 0){
            return false
        }else{
            return true
        }
    }

    async favoriteArticle(slug:string, userDetail:CreateUserParams){
        const articleInfo = await this.articleRepo.findOneBy({slug:slug})

        if(articleInfo===null){
            throw new NotFoundException('article not found')
        }

        const articleId = articleInfo.id

        const checkFavorite = await this.checkFavoriteExits(articleId, userDetail.id)

        if(!checkFavorite){
            const addFavorite = this.favoriteArticleRepo.create({
                articleId:articleId,
                userId:userDetail.id
            })
            await this.favoriteArticleRepo.save(addFavorite)
        }

        return articleInfo

    }

    
}
