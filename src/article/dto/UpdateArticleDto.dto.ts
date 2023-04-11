import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class UpdateDto {
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


export class UpdateArticleDto {
  @ValidateNested()
  @Type(() => UpdateDto)
  @IsNotEmpty()
  article: UpdateDto;
}
