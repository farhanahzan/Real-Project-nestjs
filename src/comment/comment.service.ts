import { Injectable, Inject } from '@nestjs/common';
import { CreateUserParams, UserParams } from 'src/users/utils/types';
import { CreateCommentParams } from './utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/typeorm/entities/comment.entity';
import { Repository } from 'typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/users/users.service';
import { CommentRepository } from './comment.repository';

@Injectable()
export class CommentService {
  constructor(
    @Inject(UsersService)
    private userService: UsersService,
    private commentRepository:CommentRepository
  ) {}

  async findOneBySlug(slug: string) {
     const article=  await this.commentRepository.findOneBySlug(slug)
      if (article === null) {
        throw new NotFoundException('article not found');
      }
      return article
  }

  

  async createComment(
    slug: string,
    userDetail: UserParams,
    commentDetail: CreateCommentParams,
  ) {
    const article = await this.findOneBySlug(slug);


    const newComment =await this.commentRepository.createComment(userDetail.id, article.id, commentDetail.comment.body)

    return this.returnComment(newComment.id, userDetail);
  }

  async deleteComment(commentId: string) {
    return await this.commentRepository.deleteComment(commentId)
  }

  async getAllComment(slug: string, userDetail: UserParams) {
    const article = await this.findOneBySlug(slug);

    const allComments = await this.commentRepository.getAllComment(article.id)

    const comments = await Promise.all(
      allComments.map(async (comment) => {
        const formatComment = await this.returnComment(comment.id, userDetail);
        return formatComment.comment;
      }),
    );

    return { comments };
  }

  async findOneById(commentId:string){
    return await this.commentRepository.findOneById(commentId)
  }

  async returnComment(commentId: string, userDetail: UserParams | any) {
    const findComment = await this.findOneById(commentId)
    if (findComment === null) {
      throw new NotFoundException('Please add your first comment');
    }
    const { id, userId, createdAt, updatedAt, body } = findComment;

    const username = await this.userService.findById(userId);

    const auther = await this.userService.buildResponseProfile(
      username.username,
      userDetail,
    );
    const modifyauthor = { author: auther.profile };

    return {
      comment: {
        id,
        createdAt,
        updatedAt,
        body,
        ...modifyauthor,
      },
    };
  }
}
