import { Controller, Param, UseGuards, Post, Get, Req, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/CreateArticleDto.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';

@Controller('api/article')
export class ArticleController {
  constructor(
    private readonly articleService:ArticleService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createArticle(@Body() createArticleDto:CreateArticleDto, @Req() req){

    return this.articleService.createArticle(createArticleDto,req.user.id)
  }
}
