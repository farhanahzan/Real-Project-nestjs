import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user.entity';
import { Article } from 'src/typeorm/entities/article.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Tag } from 'src/typeorm/entities/tag.entity';
// import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { UsersModule } from 'src/users/users.module';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { AricleRepository } from './article.repository';
// import { Comment } from 'src/typeorm/entities/comment.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Article, Tag, FavoriteArticle, UserFollow]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, AricleRepository],
  exports:[ArticleService]
})
export class ArticleModule {}
