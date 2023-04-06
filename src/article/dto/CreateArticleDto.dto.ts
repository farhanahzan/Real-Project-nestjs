import {  IsString, IsNotEmpty, IsOptional, IsArray, IsEmpty } from 'class-validator';


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

export class CreateArticleDto{
  article:ArticleDto
}