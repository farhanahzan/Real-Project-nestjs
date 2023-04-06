import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdatDto {
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

export class UpdateArticleDto{
  article:UpdatDto
}
