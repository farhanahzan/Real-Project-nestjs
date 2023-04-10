import { Inject, Injectable } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/typeorm/entities/article.entity';
import { Repository } from 'typeorm';
import { CreateArticleParams, UpdateArticleParams } from './utils/types';

import { kebabCase, upperFirst, lowerCase } from 'lodash';

import { Tag } from 'src/typeorm/entities/tag.entity';
import { GetArticleQueryDto } from './dto/GetArticleQueryDto.dto';

import { NotFoundException } from '@nestjs/common/exceptions';
import { UsersService } from 'src/users/users.service';

import { FavoriteArticle } from 'src/typeorm/entities/favouriteArticle.entity';
import { UserParams } from 'src/users/utils/types';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { User } from 'src/typeorm/entities/user.entity';
import { AricleRepository } from './article.repository';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,

    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(FavoriteArticle)
    private favoriteArticleRepo: Repository<FavoriteArticle>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private articleRepository: AricleRepository,
  ) {}

  async findOneTagByName(tagName: string) {
    return await this.articleRepository.findOneTagByName(tagName);
  }

  async createTag(tagName: string) {
    const newTag = await this.articleRepository.createTag(tagName);
    return newTag;
  }

  async createArticle(
    articleDetail: CreateArticleParams,
    userDetail: UserParams,
  ) {
    const { title, body, description, tagList } = articleDetail.article;

    //save tag
    for (const tagName of tagList) {
      let newTag = await this.findOneTagByName(tagName);

      if (newTag === null) {
        await this.createTag(tagName);
      }
    }

    const generateSlug = await this.generateTitleToSlug(title);

    const savedArticle = await this.articleRepository.createArticle(
      userDetail.id,
      articleDetail,
      generateSlug,
    );

    return this.returnArticle(savedArticle.slug, userDetail);
  }

  async generateTitleToSlug(title: string) {
    return kebabCase(title);
  }

  async generateSlugToTitle(slug: string) {
    return upperFirst(lowerCase(slug));
  }

  async findOneBySlug(slug: string) {
    return await this.articleRepo.findOneBy({ slug: slug });
  }

  async updateArticle(
    articleDetail: UpdateArticleParams,
    articleSlug: string,
    userDetail: UserParams,
  ) {
    const { slug,...rest } = articleDetail.article;

    const articleInfo = await this.findOneBySlug(articleSlug);

    if (articleInfo === null) {
      throw new NotFoundException('article not found');
    }
    if (articleDetail.article.title) {
      const newSlug = await this.generateTitleToSlug(
        articleDetail.article.title,
      );

      await this.articleRepository.updateArticle(articleDetail.article, articleSlug, newSlug)
      // await this.articleRepo.update(
      //   { slug: articleSlug },
      //   { ...rest, slug: newSlug },
      // );
      return await this.returnArticle(newSlug, userDetail);
    } else {
      await this.articleRepository.updateArticle(
        articleDetail.article,
        articleSlug,
        
      );
        await this.articleRepository.updateArticle(
          articleDetail.article,
          articleSlug,
        );
      // const update = await this.articleRepo.update(
      //   { slug: articleSlug },
      //   { ...rest },
      // );
      return await this.returnArticle(articleSlug, userDetail);
    }
  }

  async deleteArticle(articleSlug: string) {
    return await this.articleRepository.deleteArticle(articleSlug);
  }

  async getAllArticle(limit: number, offset: number) {
    return await this.articleRepository.getAllArticle(limit, offset);
  }
  async findArticleBySlug(slug: string) {
    const singleArticle = await this.findOneBySlug(slug);

    if (singleArticle === null) {
      throw new NotFoundException('article not Found');
    }
    return singleArticle;
  }
  async findArticleBYAuther(auther: string) {
    return await this.articleRepository.findArticleBYAuther(auther);
  }

  async findOneByUsername(username: string) {
    return await this.articleRepository.findOneByUsername(username);
  }

  async findUserId(username: string) {
    const user = await this.findOneByUsername(username);
    if (user === null) {
      throw new NotFoundException('username not found');
    }
    return user.id;
  }

  async findFavoriteArticle(userId: string) {
    return await this.articleRepository.findFavoriteArticle(userId);
  }

  async getArticles(query: GetArticleQueryDto, user: any | UserParams) {
    let { tag, auther, favorited, limit = 20, offset = 0 } = query;

    let filterArticle = await this.getAllArticle(limit, offset);

    if (favorited) {
      const favoritedUserId = await this.findUserId(favorited);

      const findFavorite = await this.findFavoriteArticle(favoritedUserId);

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
  async findFollowerById(userId:string) {
    return await this.articleRepository.findFollowerById(userId)
  }

  async feedArticle(query: GetArticleQueryDto, userDetail: UserParams) {
    let { limit = 20, offset = 0 } = query;

    let filterArticle = await this.getAllArticle(limit, offset);

    const findFollowers = await this.findFollowerById(userDetail.id)
    

    const followerIds = findFollowers.map((follower) => follower.followerId);

    filterArticle = filterArticle.filter((follower) =>
      followerIds.some((id) => id === follower.userId),
    );

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

  async findFavoriteArticleByArticleId(articleId:string){
    return await this.articleRepository.findFavoriteArticleByArticleId(articleId)
  }

  async checkCount(articleId: string) {
    const articlesCount = await this.findFavoriteArticleByArticleId(articleId)

    if (articlesCount !== null) {
      return articlesCount.length;
    }
    return 0;
  }


  async checkFavoriteExits(articleId: string, userId: string) {
    const checkFavorite = await this.articleRepository.checkFavoriteExits(articleId, userId)

    if (checkFavorite === null || checkFavorite.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  async findOneUserById(userId:string){
    return await this.articleRepository.findOneUserById(userId)
  }

  async returnArticle(articleSlug: string, user: any | UserParams) {
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

    const auther = await this.findOneUserById(userId)
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
