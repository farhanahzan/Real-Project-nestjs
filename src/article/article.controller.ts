import { Controller, Param, UseGuards, Post, Put, Req, Delete,Body , Get, Query} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/CreateArticleDto.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';
import { UpdateArticleDto } from './dto/UpdateArticleDto.dto';
import { GetArticleQueryDto } from './dto/GetArticleQueryDto.dto';

@Controller('api/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    return this.articleService.createArticle(createArticleDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  async updateArticle(
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(updateArticleDto, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  async deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }

  @Get()
  async listArticles(
    @Query() query?: GetArticleQueryDto,
    // @Query('auther') auther?: string,
    // @Query('favorited') favorited?: string,
    // @Query('limit') limit?: number,
    // @Query('offset') offset?: number,
  ) {
    console.log(query)
    return this.articleService.getArticles(query );
  }
}
