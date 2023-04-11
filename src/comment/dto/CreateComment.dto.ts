import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  
} from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  body: string;

 
}

export class CreateCommentDto {
  @ValidateNested()
  @Type(() => CommentDto)
  @IsNotEmpty()
  comment: CommentDto;
}
