import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/typeorm/entities/comment.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Article } from 'src/typeorm/entities/article.entity';
import { User } from 'src/typeorm/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  
  imports:[UsersModule,TypeOrmModule.forFeature([Comment, Article, User]),
PassportModule.registerAsync({
  inject:[ConfigService],
  imports:[ConfigModule],
  useFactory:async ()=>({
    secret:process.env.JWT_SECRET
  })
})],
  controllers: [CommentController],
  providers: [CommentService],
  exports:[CommentService]
})
export class CommentModule {}
