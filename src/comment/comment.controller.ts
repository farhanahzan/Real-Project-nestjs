import {
  Controller,
  UseGuards,
  Body,
  Post,
  Req,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { OptionalAuthGuard } from 'src/auth/utils/optionalAuth.guard';

@Controller('api/articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':slug/comments')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
    @Param('slug') slug: string,
  ) {
    return this.commentService.createComment(slug, req.user, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug/comments/:id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string, @Req() req) {
    return this.commentService.getAllComment(slug, req.user);
  }
}
