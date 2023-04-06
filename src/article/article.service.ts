import { Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleParams, UpdateArticleParams } from './utils/types';

import { kebabCase, upperFirst, lowerCase } from 'lodash';

import { Tag } from 'src/typeorm/entities/tag.entity';
import { GetArticleQueryDto } from './dto/GetArticleQueryDto.dto';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/users/users.service';
import { FavoriteArticleService } from 'src/favorite_article/favorite_article.service';
import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { CreateUserParams, UserParams } from 'src/users/utils/types';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
  ) {}

  async createArticle(
    articleDetail: CreateArticleParams,
    userDetail: UserParams,
  ) {
    const { title, body, description, tagList} = articleDetail.article;

    //save tag
    for (const tagName of tagList) {
      let newTag = await this.tagRepo.findOneBy({ tag: tagName });

      if (newTag === null) {
        const saveTag = this.tagRepo.create({ tag: tagName });
        await this.tagRepo.save(saveTag);
      }
    }

    const newArticle = this.articleRepo.create({
      userId: userDetail.id,
      ...articleDetail.article,
      slug: await this.generateTitleToSlug(title),
    });

    const savedArticle = await this.articleRepo.save(newArticle);

    return this.returnArticle(savedArticle.slug, userDetail);
  }

  async generateTitleToSlug(title: string) {
    return kebabCase(title);
  }

  async generateSlugToTitle(slug: string) {
    return upperFirst(lowerCase(slug));
  }

  async updateArticle(
    articleDetail: UpdateArticleParams,
    articleSlug: string,
    userDetail: UserParams,
  ) {
    const { slug, ...rest} = articleDetail.article;

    const articleInfo = await this.articleRepo.findOneBy({ slug: articleSlug });

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }
    if (articleDetail.article.title) {
      const newSlug = await this.generateTitleToSlug(articleDetail.article.title);
      const update = await this.articleRepo.update(
        { slug: articleSlug },
        { ...rest ,slug:newSlug},
      );
      return await this.returnArticle(newSlug, userDetail);
    } else {
      const update = await this.articleRepo.update(
        { slug: articleSlug },
        { ...rest },
      );
      return await this.returnArticle(articleSlug, userDetail);
    }

    
  }

  async deleteArticle(articleSlug: string) {
    // await this.findArticleBySlug(articleSlug);

    return await this.articleRepo.delete({ slug: articleSlug });
  }

  async getAllArticle(limit: number, offset: number) {
    return this.articleRepo.find({
      order: {
        createdAt: 'DESC',
      },
      skip: offset,
      take: limit,
    });
  }
  async findArticleBySlug(slug: string) {
    const singleArticle = await this.articleRepo.findOneBy({
      slug: slug,
    });

    if (singleArticle === null) {
      throw new NotFoundException('article not Found');
    }
    return singleArticle;
  }
  async findArticleBYAuther(auther: string) {
    const autherId = await this.userProfileRepo.findOneBy({ username: auther });

    return autherId.userId;
  }

  async findUserId(username: string) {
    const user = await this.userProfileRepo.findOneBy({ username: username });
    if (user === null) {
      throw new NotFoundException('username not found');
    }
    return user.userId;
  }

  async getArticles(query: GetArticleQueryDto, user: any|UserParams) {
    let { tag, auther, favorited, limit = 20, offset = 0 } = query;

    let filterArticle = await this.getAllArticle(limit, offset);

    if (favorited) {
      const favoritedUserId = await this.findUserId(favorited);
      const findFavorite = await this.favoriteArticleRepo.find({
        select: { articleId: true },
        where: { userId: favoritedUserId },
      });

      const favoriteArticleIds = findFavorite.map(
        (article) => article.articleId,
      );
      filterArticle = filterArticle.filter((article) =>
        favoriteArticleIds.some((id) => id === article.id),
      );
    }

    if (tag) {
      filterArticle = filterArticle.filter((article) =>
        article.tagList.includes(tag),
      );
    }

    if (auther) {
      const autherId = await this.findArticleBYAuther(auther);

      filterArticle = filterArticle.filter(
        (article) => article.userId === autherId,
      );
    }

    const articles = await Promise.all(
      filterArticle.map(async (article) => {
        const formattedArticle = await this.returnArticle(article.slug, user);
        return formattedArticle.article;
      }),
    );
    return { articles, articlesCount: articles.length };
  }

  async feedArticle(query: GetArticleQueryDto, userDetail: UserParams) {
    let { limit = 20, offset = 0 } = query;

    let filterArticle = await this.getAllArticle(limit, offset);

    const findFollowers = await this.userFollowRepo.find({select:{followerId:true}, where:{userId:userDetail.id}})
    

    const followerIds = findFollowers.map((follower)=>follower.followerId)

    filterArticle = filterArticle.filter((follower)=> followerIds.some((id)=>id===follower.userId))

    const articles = await Promise.all(
      filterArticle.map(async (article) => {
        const formattedArticle = await this.returnArticle(
          article.slug,
          userDetail,
        );
        return formattedArticle.article;
      }),
    );
    return { articles, articlesCount: articles.length };
  }

  async checkCount(articleId: string) {
    const count = await this.favoriteArticleRepo.find({
      where: { articleId: articleId },
    });

    if (count !== null) {
      return count.length;
    }
    return 0;
  }

  async checkFavoriteExits(articleId: string, userId: string) {
    const checkFavorite = await this.favoriteArticleRepo.find({
      where: {
        articleId: articleId,
        userId: userId,
      },
    });
    if (checkFavorite === null || checkFavorite.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  async returnArticle(articleSlug: string, user: any|UserParams) {
    const singleArticle = await this.findArticleBySlug(articleSlug);
    const {
      id: articleId,
      slug,
      title,
      description,
      body,
      tagList,
      createdAt,
      updatedAt,
      userId,
    } = singleArticle;

    const auther = await this.userProfileRepo.findOneBy({ userId: userId });
    const { username } = auther;

    const authorProfile = await this.userService.returnProfile(username, user);
    const newAuthorProfile = {
      author: authorProfile.profile,
    };

    const favoriteCount = await this.checkCount(articleId);

    let favorited = false;
    if (Object.keys(user).length > 0) {
      favorited = await this.checkFavoriteExits(articleId, user.id);
    }

    return {
      article: {
        slug: slug,
        title: title,
        description: description,
        body: body,
        tagList: tagList,
        createdAt: createdAt,
        updatedAt: updatedAt,
        favorited: favorited,
        favoriteCount: favoriteCount,
        ...newAuthorProfile,
      },
    };
  }
}
