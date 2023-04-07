import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {TypeOrmModule} from '@nestjs/typeorm'
import { User } from 'src/typeorm/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';

import { ArticleService } from 'src/article/article.service';
import { Article } from 'src/typeorm/entities/article.entity';
import { Tag } from 'src/typeorm/entities/tag.entity';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { Comment } from 'src/typeorm/entities/comment.entity';
import { CommentService } from 'src/comment/comment.service';
import { UsersRepository } from './users.repository';
@Module({
  imports: [
   
    TypeOrmModule.forFeature([User, UserFollow, Article, Tag,FavoriteArticle, Comment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService,ArticleService,CommentService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
