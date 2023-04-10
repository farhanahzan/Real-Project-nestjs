import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/typeorm/entities/article.entity";
import { Comment } from "src/typeorm/entities/comment.entity";
import { Repository } from "typeorm";



@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async findOneBySlug(slug: string) {
    return await this.articleRepo.findOneBy({ slug: slug });
  }

  async createComment(userId: string, articleId: string, body: string) {
    const newComment = this.commentRepo.create({
      userId: userId,
      articleId: articleId,
      body: body,
    });
    await this.commentRepo.save(newComment);
    return newComment;
  }

  async deleteComment(commentId: string) {
    return await this.commentRepo.delete({ id: commentId });
  }

  async getAllComment(articleId: string) {
    const allComments = await this.commentRepo.find({
      where: {
        articleId: articleId,
      },
    });
    return allComments;
  }
  async findOneById(commentId: string) {
    return await this.commentRepo.findOneBy({ id: commentId });
  }
}



