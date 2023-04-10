import { Module } from '@nestjs/common';
import { FavoriteArticleService } from './favorite_article.service';
import { FavoriteArticleController } from './favorite_article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ArticleModule } from 'src/article/article.module';
import { FavoriteArticleRepository } from './favorite-article.repository';

@Module({
  imports:[
    ArticleModule,
    TypeOrmModule.forFeature([FavoriteArticle,Article]),
    PassportModule.register({
      defaultStrategy:'jwt'
    }),
    JwtModule.registerAsync({
      inject:[ConfigService],
      imports:[ConfigModule],
      useFactory:async ()=>({
        secret:process.env.JWT_SECRET
      })
    })
  ],
  providers: [FavoriteArticleService, FavoriteArticleRepository],
  controllers: [FavoriteArticleController],
  exports:[FavoriteArticleService]

})
export class FavoriteArticleModule {}
