import { Controller, UseGuards,Post, Param, Req, Delete } from '@nestjs/common';
import { FavoriteArticleService } from './favorite_article.service';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';

@Controller('articles')
export class FavoriteArticleController {
  constructor(
    private readonly favoriteArticleService: FavoriteArticleService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':slug/favorite')
  async favouriteArticle(@Param('slug') slug: string, @Req() req) {
    return this.favoriteArticleService.favoriteArticle(slug, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug/favorite')
  async unFavouriteArticle(@Param('slug') slug: string, @Req() req) {
    return this.favoriteArticleService.unFavoriteArticle(slug, req.user);
  }
}
 