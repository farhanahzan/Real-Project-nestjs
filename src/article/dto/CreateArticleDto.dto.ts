import {  IsString, IsNotEmpty, IsOptional, IsArray, IsEmpty } from 'class-validator';


export class CreateArticleDto {
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
  tags: string[];
}