import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  body: string;


}
