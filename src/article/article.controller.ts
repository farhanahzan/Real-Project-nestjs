import { Controller, Param, UseGuards, Post, Put, Req, Delete,Body , Get, Query} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/CreateArticleDto.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';
import { UpdateArticleDto } from './dto/UpdateArticleDto.dto';
import { GetArticleQueryDto } from './dto/GetArticleQueryDto.dto';
import { OptionalAuthGuard } from 'src/auth/utils/optionalAuth.guard';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    return this.articleService.createArticle(createArticleDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  async updateArticle(
    @Req() req,
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(updateArticleDto, slug, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  async deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async listArticles(
    @Req() req,
    @Query() query?: GetArticleQueryDto,
    // @Query('auther') auther?: string,
    // @Query('favorited') favorited?: string,
    // @Query('limit') limit?: number,
    // @Query('offset') offset?: number,
  ) {
    let user = {};
    if (req.user) {
      user = req.user;
    }
    return this.articleService.getArticles(query, user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeedArticle(@Req() req, @Query() query?: GetArticleQueryDto) {
    console.log('first');
    return this.articleService.feedArticle(query, req.user);
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':slug')
  async getSingleArticle(@Req() req, @Param('slug') slug: string) {
    let user = {};
    if (req.user) {
      user = req.user;
    }
    return this.articleService.returnArticle(slug, user);
  }
}
