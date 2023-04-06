import { Injectable, Inject } from '@nestjs/common';
import { CreateUserParams, UserParams } from 'src/users/utils/types';
import { CreateCommentParams } from './utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/typeorm/entities/comment.entity';
import { Repository } from 'typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,

    @Inject(UsersService)
    private userService: UsersService,
  ) {}

  async findArticleId(slug: string) {
    const article = await this.articleRepo.findOneBy({ slug: slug });

    if (article === null) {
      throw new NotFoundException('article not found');
    }

    return article.id;
  }

  async createComment(
    slug: string,
    userDetail: UserParams,
    commentDetail: CreateCommentParams,
  ) {
    const articleId = await this.findArticleId(slug);

    const newComment = this.commentRepo.create({
      userId: userDetail.id,
      articleId: articleId,
      body: commentDetail.comment.body,
    });
    await this.commentRepo.save(newComment);

    return this.returnComment(newComment.id, userDetail);
  }

  async deleteComment(commentId: string) {
    return await this.commentRepo.delete({ id: commentId });
  }

  async getAllComment(slug: string, userDetail: UserParams) {
    const articleId = await this.findArticleId(slug);

    const allComments = await this.commentRepo.find({
      where: {
        articleId: articleId,
      },
    });
   
    const comments = await Promise.all(
      allComments.map(async (comment) => {
        const formatComment = await this.returnComment(comment.id, userDetail);
        return formatComment.comment;
      }),
    );

    return { comments };


  }

  async returnComment(commentId: string, userDetail: UserParams | any) {
    const findComment = await this.commentRepo.findOneBy({ id: commentId });
    if (findComment === null) {
      throw new NotFoundException('Please add your first comment');
    }
    const { id, userId, createdAt, updatedAt, body } = findComment;

    const username = await this.userService.findById(userId);

    const auther = await this.userService.returnProfile(
      username.username,
      userDetail,
    );
    const modifyauthor = {author:auther.profile}

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
