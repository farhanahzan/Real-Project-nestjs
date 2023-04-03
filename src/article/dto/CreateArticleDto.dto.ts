import {  IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';


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

  @IsOptional()
  @IsArray()
  tags:string[]
}