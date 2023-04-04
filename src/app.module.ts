import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './typeorm/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UserProfile } from './typeorm/entities/userProfile.entity';
import { UserFollow } from './typeorm/entities/userFollow.entity';
import { UserFollowerModule } from './user_follower/user_follower.module';
import { Article } from './typeorm/entities/article.entity';
import { ArticleModule } from './article/article.module';
import { Tag } from './typeorm/entities/tag.entity';
import { FavoriteArticle } from './typeorm/entities/favouriteArticle.entity';
import { FavoriteArticleModule } from './favorite_article/favorite_article.module';

const entities = [User, UserProfile, UserFollow, Article, Tag, FavoriteArticle];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      entities: entities,
      
    }),
    UsersModule,
    AuthModule,
    UserFollowerModule,
    ArticleModule,
    FavoriteArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
