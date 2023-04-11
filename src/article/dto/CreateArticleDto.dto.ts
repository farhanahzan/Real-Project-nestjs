import { Transform, Type } from 'class-transformer';
import {  IsString, IsNotEmpty, IsOptional, IsArray, IsEmpty, ValidateNested } from 'class-validator';


export class ArticleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsEmpty()
  slug: string;

  @IsOptional()
  @IsArray()
  tagList: string[];


}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => ArticleDto)
  @IsNotEmpty()
  article: ArticleDto;
}
