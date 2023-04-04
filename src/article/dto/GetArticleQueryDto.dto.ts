import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber,  } from 'class-validator';

export class GetArticleQueryDto {
  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  auther: string;

  @IsOptional()
  @IsString()
  favorited: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number;
}
