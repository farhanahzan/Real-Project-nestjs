import {
  IsString,
  IsNotEmpty,
  
} from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  body: string;

 
}
export class CreateCommentDto{
comment:CommentDto
}
